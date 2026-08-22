# drovi-frontend

The web console for **Drovi** — a platform that builds working replicas of third-party
production APIs. You name a product, an agent researches it, and you get a base URL to
paste over the real one.

## Status: specification, no code yet

The console is **Phase 4** of the roadmap. It is blocked on two backend deliverables:

1. **Firebase token verification** (backend Phase 1) — there is nothing to sign in against
2. **The console API** (backend Phase 2) — it does not exist; only the sandbox runtime does

An agent asked to build the console before those land should say so rather than mocking an
API that has not been designed.

## Stack

**Next.js + React + TypeScript**, deployed to Render or Cloudflare — *not* Vercel, whose
Hobby plan is non-commercial only and would be breached by a paid tier.

Rationale: `drovi-backend/docs/00-overview/decisions/ADR-0005-nextjs-console.md`.

## Documentation

Start at [docs/README.md](docs/README.md).

| For | Read |
| --- | --- |
| What the console is for | [docs/00-overview/product-brief.md](docs/00-overview/product-brief.md) |
| The surfaces and the one flow that matters | [docs/01-architecture/screens-and-flows.md](docs/01-architecture/screens-and-flows.md) |
| How code here is written | [docs/02-implementation/coding-standards.md](docs/02-implementation/coding-standards.md) |
| Calling the API — and the two boundaries | [docs/03-api/api-client.md](docs/03-api/api-client.md) |
| What the client is responsible for | [docs/05-security/README.md](docs/05-security/README.md) |

The product roadmap is canonical in `drovi-backend/docs/00-overview/roadmap.md`.

## The one idea to hold on to

**A sandbox is data, not scripts.** The generated endpoints are *bound* to collections of
records; rules are a thin override layer. If the UI presents endpoints as scripted
responses, the product's central trick — that changing behaviour is an `INSERT` — becomes
invisible.
