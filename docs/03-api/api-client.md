---
title: Calling the API
status: specification
last_updated: 2026-08-23
---

# Calling the API

⚠️ The console API **does not exist yet** (backend Phases 1–2). Its specification is
`drovi-backend/docs/03-api/console-api.md`; the boundary contract is
`global-context/shared/api-contract.md`.

## Two boundaries — the thing to get right

| | Console API | Sandbox surface |
| --- | --- | --- |
| Path | `/api/v1/**` | `/s/{projectKey}/**` |
| Caller | **this console** | **the user's own application** |
| Auth | Firebase ID token | a project API key |
| Shape | Drovi's house style | the imitated product's |

INVARIANT: **the console never calls a sandbox as though it owned it.**

If a "try it" feature is ever built, it is calling the *user's* mock service the way a
third party would — with their key. It counts against their quota and appears in their
traffic inspector, and the UI must say so.

## Client rules

1. **Types are generated** from the OpenAPI document. Never hand-write a payload type.
2. **Attach the Firebase ID token** to every console request; refresh it through the SDK,
   not by hand.
3. **Never send a limit to the server.** Entitlements are read, never asserted.
4. **Never persist a project API key.** It is shown once, at creation, and Drovi cannot
   redisplay it — so the console must not quietly cache it either.
5. **Treat 401 as sign-out**, and clear every cache, not just the token.
6. **Surface the correlation id** from an error response. It is what makes a support
   conversation short.

## Reading a sandbox's traffic

The traffic inspector reads `mock_request_log` through the console API. Two fields carry
most of the meaning:

| Field | Meaning |
| --- | --- |
| `endpointId` is null | nothing matched — usually a path the generator got wrong. **Highlight these** |
| `ruleId` is set | an override answered, not the data |
