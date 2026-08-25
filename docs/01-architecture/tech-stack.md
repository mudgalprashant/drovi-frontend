---
title: Tech stack
status: current
last_updated: 2026-08-23
---

# Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js** |
| Language | **TypeScript**, strict |
| UI | **React** |
| API types | hand-written in one module **for now** — see below |
| Auth | **Firebase Authentication** (web SDK) |
| Hosting | **Render or Cloudflare** — *not* Vercel free |

Rationale: `drovi-backend/docs/00-overview/decisions/ADR-0005-nextjs-console.md`.

## Why not Vercel

Vercel's Hobby plan is **non-commercial only**, so a product with a paid tier breaches its
terms the day that tier goes live. This is a terms constraint, not a capability one —
recorded so its free tier does not tempt a re-proposal.

## Types

The intent stands: types are generated from the console API's OpenAPI document, so client and
server cannot drift.

⚠️ **They are not generated yet, because there is no OpenAPI document.** The backend describes
its routes only as controllers. So the types are hand-written in `src/lib/api/types.ts`, and the
consequence is real — the client *can* drift from the server, and nothing will catch it.

Until that changes:

- `drovi-backend/docs/03-api/console-api.md` is the source of truth. Change a type only against it.
- Types live in **one module**. Do not define local interfaces that duplicate an API type — the
  cost of drift is already being paid once and should not be paid per component.
- Publishing an OpenAPI document is backend work and the fix. It is worth doing before the
  console grows much larger.

## What the client is not

Not a security boundary. Every limit, every ownership check and every entitlement is the
server's. Client checks are UX only.

Nothing secret ships in the bundle. The Firebase *web* config is publishable by design; the
model provider key and every other credential stay server-side.
