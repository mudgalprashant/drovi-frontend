---
title: Calling the API
status: specification
last_updated: 2026-08-23
---

# Calling the API

The console API **exists and is deployed**. Its contract is
`drovi-backend/docs/03-api/console-api.md`; the boundary contract is
`global-context/shared/api-contract.md`.

Base URL: `https://drovi-backend.onrender.com`, or `http://localhost:8080` locally.

⚠️ **The backend allows a named list of origins.** A console on an origin the backend does not
know fails every request at the preflight, and the browser reports a network error that says
nothing about the API. It is set with `DROVI_CONSOLE_ORIGINS`, and it is the first thing to check
when a freshly deployed console cannot reach a working backend.

## Two boundaries — the thing to get right

| | Console API | Sandbox surface |
| --- | --- | --- |
| Path | `/api/v1/**` | `/s/{projectId}/**` |
| Caller | **this console** | **the user's own application** |
| Auth | Firebase ID token | a project API key |
| Shape | Drovi's house style | the imitated product's |

INVARIANT: **the console never calls a sandbox as though it owned it.**

If a "try it" feature is ever built, it is calling the *user's* mock service the way a
third party would — with their key. It counts against their quota and appears in their
traffic inspector, and the UI must say so.

## Client rules

1. **Types live in one module** and are never redefined per component. ⚠️ They are currently
   **hand-written** in `src/lib/api/types.ts`, because the backend publishes no OpenAPI document
   yet. That is a deviation from the tech-stack doc's "never hand-written", it is temporary, and
   it means the client *can* drift from the server. Until it is generated, treat
   `drovi-backend/docs/03-api/console-api.md` as the source of truth.
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

## Generation is not one call

A generation is a chain of jobs taking minutes, and it can **stop and ask a question**. The
console has to handle that, not just show a progress bar:

| Route | For |
| --- | --- |
| `POST /projects/{id}/generations` | start one. Returns **202** with an estimate, not a result |
| `GET /projects/{id}/generations/progress` | seconds remaining — or `waitingForYou: true`, meaning the clock has stopped and it is the user's move |
| `GET /projects/{id}/generations` | the per-step history |
| `GET /projects/{id}/clarifications` | the questions. **Answering the last one resumes the build** |
| `POST …/clarifications/{cid}/answer` | `{"optionId"}` or `{"answer"}` |
| `POST …/clarifications/{cid}/assume` | "you decide" — a real answer, not a skip |
| `POST /projects/{id}/revisions` | change a built sandbox in words |
| `POST /projects/{id}/threads`, `POST /threads/{id}/messages` | chat, which decides between generating and revising for you |

**A project's `status` is the truth about whether its sandbox works**: `GENERATING` means it is
not serving yet, `READY` means it is, `FAILED` means it gave up. Do not infer readiness from the
job list.
