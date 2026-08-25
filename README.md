# drovi-frontend

The web console for **Drovi** — a platform that builds working replicas of third-party
production APIs. You name a product, an agent researches it, and you get a base URL to
paste over the real one.

## Status: in progress

The console is **Phase 4**. Both things it used to be blocked on have landed:

1. **Firebase token verification** — done, and live in production. `/api/v1/me` returns 401
   rather than 503, so there is something to sign in against
2. **The console API** — done, and considerably larger than the specification it was blocked
   on: projects, keys, data, endpoints, rules, the inspector, generations with progress,
   clarifications, revisions and chat

Backend phases 0–5 are complete — the v1 cut line. What the console is catching up to is
`drovi-backend/docs/03-api/console-api.md`, which is the contract.

## Stack

**Next.js + React + TypeScript**, deployed to Render or Cloudflare — *not* Vercel, whose
Hobby plan is non-commercial only and would be breached by a paid tier.

Rationale: `drovi-backend/docs/00-overview/decisions/ADR-0005-nextjs-console.md`.

## Contributing

**Never commit to `main`, and never open a PR into it** except the release PR from `dev`.
Work on `feat/<feature-name>` or `fix/<fix-name>` branched from `dev`, and raise PRs into
`dev`. Full rules:
[docs/02-implementation/branching-and-workflow.md](docs/02-implementation/branching-and-workflow.md).

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
