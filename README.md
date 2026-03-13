# Napkin

**Turn your architecture diagrams into runnable sketches.**

Architecture reviews often produce diagrams that describe systems as discrete components (web app, API, workers, queues, DB, external deps). However, validating those designs usually requires scaffolding a real system—which is slow and distracts from the design intent.

**Napkin** is a CLI + generator that turns architecture primitives into low-fidelity, runnable surfaces using Docker Compose. It allows teams to quickly test assumptions about integration boundaries, data flow, failure modes, and deployment topology.

## Key Features

- **Runnable Sketches**: Generate minimal, functional components (UI, API, Store, Worker) from a simple manifest.
- **Composition First**: Wire nodes together based on edges in the manifest, producing a runnable system via Docker Compose.
- **Low Fidelity, High Value**: Focus on surfaces and contracts, not production implementations. Validate sync vs async interactions and failure modes early.
- **Fault Injection**: Built-in support for latency and error rate simulation to test system resilience.
- **Docker Compose Glue**: Leverages Docker Compose for consistent networking, startup, and environment management.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

Install the CLI globally via npm:

```bash
npm install -g @michaellhobart/napkin
```

### Development Setup

If you want to contribute or build from source:

```bash
git clone https://github.com/michaellhobart/napkin.git
cd napkin
npm install
npm run build
npm link
```

### Usage

1. **Initialize a new project**:
   ```bash
   napkin init
   ```
   This creates a `napkin.yaml` file in your current directory, which serves as the source of truth for your architecture sketch.

2. **Generate a REST service**:
   ```bash
   # Generate a simple service
   napkin generate service users
   
   # Generate a service with a specific schema
   napkin generate service books --schema "title, author, year"
   ```
   This scaffolds a lean REST API in `services/<name>/` using only native Node.js modules. It includes an in-memory CSV storage provider for quick prototyping.

3. **Start a service**:
   ```bash
   cd services/books
   npm start
   ```

4. **Wired up (Docker Compose)**:
   *Coming Soon: Generate the docker-compose.yaml from your manifest.*

## Documentation

For more detailed information on the project structure and design, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Design Principles

1. **Low Fidelity**: Runnable artifacts with one command, explicit surfaces (HTTP/NATS), and minimal behavior.
2. **Avoid Combinatorial Explosion**: Support "blessed stacks" for each primitive (e.g., Fastify for APIs, Vite for UIs).
3. **Manifest-First**: The `napkin.yaml` is the source of truth for the entire system architecture.

## License

MIT

## Distribution

This package is published to the npm registry under the `@michaellhobart` scope.

### Publishing

To publish a new version:
1. Update the version in `package.json`.
2. Push a new tag: `git tag v0.x.x && git push origin v0.x.x`.
3. The GitHub Action will automatically build and publish the package to npm.
