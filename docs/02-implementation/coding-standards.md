---
title: Coding standards
status: current
last_updated: 2026-08-23
---

# Coding standards

No code exists yet. These are the rules the first commit should already follow.

## TypeScript

- `strict: true`. No `any`; use `unknown` and narrow.
- **API types are generated** from the console API's OpenAPI. Never hand-write a type that
  describes a server payload, and never edit the generated file.
- Prefer `type` for unions and object shapes; `interface` only when declaration merging is
  actually needed.
- No default exports for components — named exports grep better.

## React

- Server Components by default; `"use client"` only where interactivity requires it.
- Data fetching in one place per surface. Do not scatter `fetch` through components.
- No client-side cache of an entitlement or a limit — always read the server's answer.

## Rendering untrusted content

INVARIANT: **never render sandbox content as trusted HTML.** Records hold arbitrary user-
and model-generated data. No `dangerouslySetInnerHTML` on anything originating from a
project's data, a chat message, or a generated schema.

JSON is displayed through a viewer that escapes, never by injecting markup.

## Naming

Use the glossary (`drovi-backend/docs/00-overview/glossary.md`) exactly. In particular:

| Say | Not |
| --- | --- |
| **API group** | "collection" |
| **Data collection** | "collection", "table" |
| **Record key** | "id" (ambiguous with our own ids) |
| **Project key** | "API key" (a different credential) |

A synonym introduced here is a defect, because the same words appear in the backend, the
docs, and the product's own UI.

## Errors

Two kinds, never conflated:

- **Platform error** — Drovi failed. Show it as our problem.
- **Simulated error** — the sandbox did what the user asked. Show it as a *result*.

## State

Server state is fetched and cached in one layer; never mirrored into a global store where
it can go stale. Client state is UI state only.

## Formatting and dates

Timestamps arrive ISO-8601 UTC and render in the viewer's timezone — **except** inside a
sandbox's own payloads, which are the imitated product's and must be shown verbatim.

## Tests

- `name_condition_expectedResult`.
- Test the flows in `../01-architecture/screens-and-flows.md`, not implementation details.
- Anything that could show a user the wrong entitlement, or hide the key-shown-once
  warning, gets a test.
