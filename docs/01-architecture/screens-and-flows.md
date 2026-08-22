---
title: Screens and flows
status: specification
last_updated: 2026-08-23
---

# Screens and flows

## The flow that matters

Everything else is secondary to this loop working without documentation:

```
describe a product in chat
   → watch it generate (minutes, with real progress)
   → copy the base URL
   → paste it into your own app, replacing the production URL
   → your app works
   → watch your own calls arrive in the traffic inspector
   → ask for an edge case ("five blocked cards", "429 next call")
   → your app sees it immediately
```

**Exit criterion for Phase 4:** a developer completes that loop without reading any docs.

## Screens

| Screen | Contains | Notes |
| --- | --- | --- |
| Sign in | Firebase | nothing else until Phase 1 lands |
| Projects | list, create, plan usage | the base URL is the hero element |
| Project → Chat | the conversation | the default tab; the primary surface |
| Project → API | groups → endpoints → schemas | Postman-like |
| Endpoint detail | **the data it serves**, then rules | data first — see the mental model |
| Project → Data | data collections, records, bulk seed | show storage headroom *before* a write fails |
| Project → Traffic | live tail of served calls | unmatched routes highlighted — they mean the generator got a path wrong |
| Project → Settings | base URL, auth mode, latency, keys | the key-shown-once moment lives here |
| Account | plan, entitlements, usage | read-only from the server |

## Two moments that need real care

### The key-shown-once moment

A project API key is displayed exactly once. Drovi stores only a hash and **cannot**
redisplay it. The UI must make that unmissable and require a deliberate dismissal — not a
toast that can be scrolled past.

### Generation progress

Research → spec → seed takes minutes and can fail at any stage. Show which stage is
running, what it produced so far, and — if it fails — what remains usable. A spinner for
three minutes is not acceptable for the product's headline feature.

## Two things the UI must keep distinct

| | |
| --- | --- |
| **A platform error** | Drovi failed. Our problem |
| **A simulated error** | the sandbox did what the user asked. A *success* |

Rendering a deliberate 429 as a Drovi failure sends users debugging the wrong system.

Likewise **API group** (a folder of endpoints) and **data collection** (a set of records)
are different things that both used to be called "collection". Never label either one just
"collection".
