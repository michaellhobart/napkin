# NAPKIN VISION

## The Problem
Architecture diagrams are often "static" artifacts. Validating the assumptions made in a diagram requires either:
1. Writing extensive mocks (which drift from reality).
2. Scaffolding a real system (which takes too much time).

This friction leads to architectural flaws being discovered too late in the development cycle.

## The Solution
Napkin provides a "middle ground": **Runnable Sketches**. By generating low-fidelity but functional surfaces, Napkin allows teams to "run" their diagrams before writing a single line of production code.

## Core Primitives
Napkin models common architecture shapes as primitives:
- **UI Node**: A minimal client to test API integration assumptions.
- **API Node**: A minimal REST API with endpoints and downstream wiring.
- **Store Node**: Schema-lite persistence (SQLite/JSON) for data flow validation.
- **Worker Node**: Event-driven or HTTP-invoked logic.
- **Broker**: Infrastructure (e.g., NATS) for async messaging.
- **External Stub**: Deterministic responses for external dependencies with fault injection.

## Long-Term Vision
- **Diagram Portability**: Import from Draw.io/Lucidchart and export back to templates.
- **Contract Drift Checks**: Automatically flag when a UI expects a field that an API doesn't provide.
- **Traceability**: End-to-end correlation IDs and minimal "trace" output to visualize data flow.
- **Ecosystem**: A library of "flavors" for different stacks (Python workers, Kotlin APIs) while maintaining the low-fidelity ethos.

## Why "Napkin"?
Because the best ideas start on the back of a napkin. Napkin helps you take those ideas to a runnable state in minutes.
