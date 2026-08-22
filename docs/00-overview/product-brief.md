---
title: Product brief — the console
status: current
last_updated: 2026-08-23
---

# Product brief — the console

Full product context: `drovi-backend/docs/00-overview/product-brief.md`.

## The job

A developer says *"mimic Stripe's card API"*, and minutes later has a base URL they paste
over the real one. Then they keep talking to it:

> give me five customer IDs whose card was blocked in the last 30 days
>
> make `POST /v1/charges` return a 429 for the next two calls

The console is where that conversation happens, and where its results are inspectable.

## Surfaces

| Surface | Shows |
| --- | --- |
| **Chat** | the conversation that creates and steers a sandbox |
| **Collection browser** | the generated API, Postman-style: groups → endpoints → schemas |
| **Data inspector** | the records behind each endpoint, editable within quota |
| **Rules** | the overrides: status, matcher, delay, one-shot |
| **Traffic inspector** | a live tail of the calls the sandbox served |
| **Project settings** | base URL, auth mode, latency, API keys |
| **Account** | plan, entitlements, storage used, model spend |

## The mental model the UI must preserve

**A sandbox is data, not scripts.** The generated endpoints are *bound* to collections of
records; rules are an override layer on top.

If the UI presents endpoints as scripted responses, users will ask for the wrong things,
and the product's central trick — that changing behaviour is an `INSERT` — becomes
invisible.

A good sign the UI is right: an endpoint's page shows **the data it serves**, with rules as
a clearly secondary layer.

## Seven requirements that are not negotiable

| # | Requirement | Why |
| --- | --- | --- |
| 1 | Never compute or enforce an entitlement | Limits are server-authoritative. A client that computes its own limit can be edited |
| 2 | Warn before dismissing a new project API key | Only a hash is stored; Drovi **cannot** redisplay it |
| 3 | Render a platform error differently from a simulated one | A sandbox returning 429 because the user asked is a *success*. Confusing the two sends users debugging the wrong system |
| 4 | Never reformat a sandbox's own payload | It is the imitated product's shape. Fidelity is the product |
| 5 | Show storage headroom *before* a write fails | Quota returns 507 at write time; a user who has typed 10k records has wasted the effort |
| 6 | Treat the base URL as the primary artifact | It is what the user came for. One click to copy, from anywhere |
| 7 | Never render sandbox content as trusted HTML | Records hold arbitrary user- and model-generated data |

## Hard parts, named early

| Problem | Note |
| --- | --- |
| Generation takes minutes | Research → spec → seed. Needs real progress, not a spinner |
| The collection can be large | Dozens of endpoints, thousands of records — both need paging and search |
| Editing is two-sourced | A user edits a rule by hand *and* by asking the chat. Both must converge on one visible state |
