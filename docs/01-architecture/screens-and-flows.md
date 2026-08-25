---
title: Screens and flows
status: specification
last_updated: 2026-08-23
---

# Screens and flows

## The flow that matters

Everything else is secondary to this loop working without documentation:

```
describe a product — or paste its spec, or give a link to it
   → answer any questions it asks (it stops rather than guessing)
   → watch it generate (minutes, with a stated wait)
   → copy the base URL
   → paste it into your own app, replacing the production URL
   → your app works
   → watch your own calls arrive in the traffic inspector
   → ask for an edge case ("five blocked cards", "429 next call")
   → your app sees it immediately
```

**Exit criterion for Phase 4:** a developer completes that loop without reading any docs.

⚠️ **The base URL is `{host}/s/{projectId}`** — the project's own id. There is no separate
project key any more; if you are showing one, the page is out of date.

## Screens

| Screen | Contains | Notes |
| --- | --- | --- |
| Sign in | Firebase | identity is live; this is the only unauthenticated screen |
| Projects | list, create, plan usage | the base URL is the hero element |
| Project → Chat | the conversation | the default tab; the primary surface |
| Project → API | groups → endpoints → schemas | Postman-like |
| Endpoint detail | **the data it serves**, then rules | data first — see the mental model |
| Project → Data | data collections, records, bulk seed | show storage headroom *before* a write fails |
| Project → Traffic | live tail of served calls | unmatched routes highlighted — they mean the generator got a path wrong |
| Project → Settings | base URL, auth mode, latency, keys | the key-shown-once moment lives here |
| Project → Questions | open and answered clarifications | see below. Not a notification — a blocked build lives here |
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

The backend gives a **stated wait** (`GET …/generations/progress` returns seconds and a
sentence), so "about 3 minutes" is available and a bare spinner is now a choice rather than a
limitation.

### Questions, which are a screen and not a toast

**This is the moment most likely to be got wrong.** Generation *stops* when a request is
ambiguous — "give me a blocked card" when a card has both `status` and `blocked` — and waits.
`progress` reports `waitingForYou: true` and no estimate, because the clock is not running.

| Rule | Why |
| --- | --- |
| A pending question is the **primary** thing on the screen | nothing is happening until it is answered; a badge somewhere is a build that appears hung |
| Offer the options as buttons | the backend supplies concrete choices precisely so this is one click |
| **"You decide" is a first-class button**, not a link | for most doubts a plausible assumption beats a blocked build, and a user who does not care should not be made to care |
| Show what was assumed, afterwards | an assumption nobody can look up later is indistinguishable from a bug — and answered questions are kept forever for exactly this |
| Answering the last one resumes the build | so the screen must move on by itself, not wait for a refresh |

## Two things the UI must keep distinct

| | |
| --- | --- |
| **A platform error** | Drovi failed. Our problem |
| **A simulated error** | the sandbox did what the user asked. A *success* |

Rendering a deliberate 429 as a Drovi failure sends users debugging the wrong system.

Likewise **API group** (a folder of endpoints) and **data collection** (a set of records)
are different things that both used to be called "collection". Never label either one just
"collection".
