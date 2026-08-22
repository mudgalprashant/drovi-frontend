---
title: Drovi console documentation
status: current
last_updated: 2026-08-23
---

# Documentation

Human documentation for the **Drovi console** — the web client for the API-sandbox
platform.

⚠️ **No code exists yet.** The console is Phase 4 of the roadmap and is blocked on backend
Phases 1–2 (identity, then the console API). These docs are the specification to build
against, not a description of what is there.

| Document | Covers |
| --- | --- |
| [00-overview/product-brief.md](00-overview/product-brief.md) | what the console is for |
| [01-architecture/tech-stack.md](01-architecture/tech-stack.md) | Next.js + React + TypeScript, and why |
| [01-architecture/screens-and-flows.md](01-architecture/screens-and-flows.md) | the surfaces and the one flow that matters |
| [02-implementation/branching-and-workflow.md](02-implementation/branching-and-workflow.md) | **how to contribute — never commit to `main`** |
| [02-implementation/coding-standards.md](02-implementation/coding-standards.md) | how code here is written |
| [03-api/api-client.md](03-api/api-client.md) | calling the console API — and the two boundaries |
| [05-security/README.md](05-security/README.md) | what the client is and is not responsible for |

The product roadmap is canonical in `drovi-backend/docs/00-overview/roadmap.md`.

## Before writing any code

Two backend deliverables must land first, and neither is in this repo:

1. **Firebase token verification** — there is nothing to sign in against.
2. **The console API** — it does not exist; only the sandbox runtime does.

An agent asked to "build the console" before those exist should say so rather than mocking
an API that has not been designed.
