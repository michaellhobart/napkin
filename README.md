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

```bash
npm install -g @michaellhobart/napkin
```

### Usage

1. **Initialize a new project**:
   ```bash
   napkin init
   ```

2. **Add components**:
   ```bash
   napkin add api backend
   napkin add store db
   napkin add ui web
   ```

3. **Start the system**:
   ```bash
   napkin up
   ```

## Design Principles

1. **Low Fidelity**: Runnable artifacts with one command, explicit surfaces (HTTP/NATS), and minimal behavior.
2. **Avoid Combinatorial Explosion**: Support "blessed stacks" for each primitive (e.g., Fastify for APIs, Vite for UIs).
3. **Manifest-First**: The `napkin.yaml` is the source of truth for the entire system architecture.

## License

MIT
