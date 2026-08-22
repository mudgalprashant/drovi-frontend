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
| API types | **generated** from the console API's OpenAPI — never hand-written |
| Auth | **Firebase Authentication** (web SDK) |
| Hosting | **Render or Cloudflare** — *not* Vercel free |

Rationale: `drovi-backend/docs/00-overview/decisions/ADR-0005-nextjs-console.md`.

## Why not Vercel

Vercel's Hobby plan is **non-commercial only**, so a product with a paid tier breaches its
terms the day that tier goes live. This is a terms constraint, not a capability one —
recorded so its free tier does not tempt a re-proposal.

## Types are generated

The console generates its TypeScript types from the console API's OpenAPI document. They
are never hand-written and never edited by hand, so the client and server cannot drift.

Do **not** define local interfaces that duplicate an API type.

## What the client is not

Not a security boundary. Every limit, every ownership check and every entitlement is the
server's. Client checks are UX only.

Nothing secret ships in the bundle. The Firebase *web* config is publishable by design; the
model provider key and every other credential stay server-side.
