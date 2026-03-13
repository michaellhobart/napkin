import { Command } from 'commander';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'path';

export const initCommand = new Command('init')
  .description('Initialize a new Napkin project')
  .action(async () => {
    const configPath = path.join(process.cwd(), 'napkin.yaml');
    
    if (await fs.pathExists(configPath)) {
      console.error('napkin.yaml already exists in this directory.');
      process.exit(1);
    }

    const defaultConfig = {
      version: 1,
      project: {
        name: path.basename(process.cwd()),
        network: 'napkin'
      }
    };

    await fs.writeFile(configPath, yaml.dump(defaultConfig));
    console.log('Created napkin.yaml');
  });
