---
title: Drovi console documentation
status: current
last_updated: 2026-08-23
---

# Documentation

Human documentation for the **Drovi console** — the web client for the API-sandbox
platform.

The console is Phase 4. The first slice exists — sign in, projects, and the build loop with its
questions. These docs are partly specification and partly description; each page says which.

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

Read [03-api/api-client.md](03-api/api-client.md) first. Two things there are easy to get wrong
and expensive to unpick:

1. **Generation is not one call.** It is a chain that takes minutes and can *stop to ask a
   question*. A console that only shows a progress bar will appear hung.
2. **Types are hand-written, for now.** The backend publishes no OpenAPI document, so this
   client can drift from the server and nothing will catch it. Change a type only against
   `drovi-backend/docs/03-api/console-api.md`.

## What is built, and what is not

| Built | Not built |
| --- | --- |
| Sign in (Firebase, Google) | The API browser: groups → endpoints → schemas |
| Projects: list, create, plan usage | The data browser and bulk seed |
| The base URL, as the hero element | The traffic inspector |
| Build a sandbox: describe it, paste a spec, or link to it | Project settings, and the key-shown-once moment |
| Questions — answer, or "you decide" | Chat as a conversation surface |
| A stated wait, and per-step history | |
| Revisions: change the data in words | |

The two absences that matter most are the **traffic inspector** — the loop's "watch your own
calls arrive" step — and the **key-shown-once moment**, which the screens doc singles out as
needing real care.
