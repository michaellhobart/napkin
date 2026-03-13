import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateServiceCommand = new Command('service')
  .description('Generate a lean REST service')
  .argument('<resource>', 'Name of the resource (e.g., users)')
  .option('-s, --schema <fields>', 'Comma-separated list of fields for the resource')
  .option('-n, --name <name>', 'Custom name for the service')
  .action(async (resource, options) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, 'napkin.yaml');

    if (!(await fs.pathExists(configPath))) {
      console.error('Error: napkin.yaml not found. Run "napkin init" first.');
      process.exit(1);
    }

    const serviceId = options.name || `${resource}-${Math.random().toString(36).substring(2, 6)}`;
    const serviceDir = path.join(cwd, 'services', serviceId);

    if (await fs.pathExists(serviceDir)) {
      console.error(`Error: Service directory ${serviceDir} already exists.`);
      process.exit(1);
    }

    await fs.ensureDir(serviceDir);

    // Initial fields always include 'id'
    const schemaFields = options.schema 
      ? options.schema.split(',').map((f: string) => f.trim())
      : [];
    const allFields = ['id', ...schemaFields];

    // Initialize data.csv with headers if schema is provided
    if (schemaFields.length > 0) {
      await fs.writeFile(path.join(serviceDir, 'data.csv'), allFields.join(',') + '\n');
    }

    const indexContent = `import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Storage } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const storage = new Storage(path.join(__dirname, 'data.csv'));

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', \`http://\${req.headers.host}\`);
  const method = req.method;

  res.setHeader('Content-Type', 'application/json');

  const getBody = async () => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  try {
    if (url.pathname === '/') {
      if (method === 'GET') {
        const records = await storage.readAll();
        res.writeHead(200);
        res.end(JSON.stringify(records));
        return;
      }
      if (method === 'POST') {
        const body = await getBody();
        const newRecord = await storage.create(body);
        res.writeHead(201);
        res.end(JSON.stringify(newRecord));
        return;
      }
    } else {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 1) {
        const id = parts[0];
        
        if (method === 'GET') {
          const record = await storage.readOne(id);
          if (record) {
            res.writeHead(200);
            res.end(JSON.stringify(record));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
          }
          return;
        }

        if (method === 'PUT') {
          const body = await getBody();
          const updated = await storage.update(id, body);
          if (updated) {
            res.writeHead(200);
            res.end(JSON.stringify(updated));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
          }
          return;
        }

        if (method === 'DELETE') {
          const deleted = await storage.delete(id);
          if (deleted) {
            res.writeHead(204);
            res.end();
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
          }
          return;
        }
      }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(\`Service running on port \${PORT}\`);
});
`;

    const storageContent = `import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';

export class Storage {
  constructor(filename) {
    this.filename = filename;
  }

  async readRows() {
    if (!existsSync(this.filename)) return [];
    
    const content = await fs.readFile(this.filename, 'utf-8');
    const lines = content.split('\\n').filter(Boolean);
    if (lines.length < 1) return [];

    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const record = {};
      headers.forEach((h, i) => record[h] = values[i]);
      return record;
    });
  }

  async writeRows(rows) {
    if (rows.length === 0) {
      if (!existsSync(this.filename)) {
        await fs.writeFile(this.filename, '');
        return;
      }
      // If file exists, keep headers but clear data
      const content = await fs.readFile(this.filename, 'utf-8');
      const lines = content.split('\\n').filter(Boolean);
      const headers = lines[0] || '';
      await fs.writeFile(this.filename, headers + (headers ? '\\n' : ''));
      return;
    }
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map(h => row[h] || '').join(','));
    }
    await fs.writeFile(this.filename, lines.join('\\n') + '\\n');
  }

  async readAll() {
    return this.readRows();
  }

  async readOne(id) {
    const rows = await this.readRows();
    return rows.find(r => r.id === id) || null;
  }

  async create(data) {
    const rows = await this.readRows();
    const newRecord = { id: crypto.randomUUID(), ...data };
    
    // Use headers from file if they exist, otherwise build from data
    let allKeys;
    if (!existsSync(this.filename)) {
       allKeys = new Set(['id', ...Object.keys(data)]);
    } else {
       const content = await fs.readFile(this.filename, 'utf-8');
       const lines = content.split('\\n').filter(Boolean);
       if (lines.length > 0) {
         allKeys = new Set(lines[0].split(','));
         // Add any missing keys from incoming data to schema? 
         // For now, let's keep it strict to the initialized schema if it exists.
       } else {
         allKeys = new Set(['id', ...Object.keys(data)]);
       }
    }
    
    const normalizedRows = rows.map(r => {
      const norm = {};
      allKeys.forEach(k => norm[k] = r[k] || '');
      return norm;
    });
    
    const normNewRecord = {};
    allKeys.forEach(k => normNewRecord[k] = String(newRecord[k] || ''));
    
    normalizedRows.push(normNewRecord);
    await this.writeRows(normalizedRows);
    return newRecord;
  }

  async update(id, data) {
    const rows = await this.readRows();
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return null;

    rows[index] = { ...rows[index], ...data, id };
    
    await this.writeRows(rows);
    return rows[index];
  }

  async delete(id) {
    const rows = await this.readRows();
    const filtered = rows.filter(r => r.id !== id);
    if (filtered.length === rows.length) return false;
    
    await this.writeRows(filtered);
    return true;
  }
}
`;

    const packageJsonContent = `{
  "name": "${serviceId}-service",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
`;

    await fs.writeFile(path.join(serviceDir, 'index.js'), indexContent);
    await fs.writeFile(path.join(serviceDir, 'storage.js'), storageContent);
    await fs.writeFile(path.join(serviceDir, 'package.json'), packageJsonContent);

    // Update napkin.yaml
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(configContent) as any;
    
    if (!config.services) {
      config.services = [];
    }

    if (!config.services.find((s: any) => s.id === serviceId)) {
      config.services.push({
        id: serviceId,
        kind: 'api',
        flavor: 'native-http',
        path: `services/${serviceId}`,
        fields: allFields,
        ports: [
          `300${config.services.length}:3000`
        ]
      });
      await fs.writeFile(configPath, yaml.dump(config));
    }

    console.log(`Successfully generated ${resource} service as "${serviceId}" at ${serviceDir}`);
  });

