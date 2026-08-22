---
title: Security — the console
status: current
last_updated: 2026-08-23
---

# Security — the console

Cross-repo invariants and the full model live in
`drovi-backend/docs/05-security/`. This file is what is specific to the client.

## The client is not a security boundary

INVARIANT: every limit, ownership check and entitlement is enforced by the server. Client
checks are UX. A console that decides its own limit is a console that can be edited in
devtools.

## Nothing secret ships in the bundle

INVARIANT: anything shipped to a browser is public. The Firebase *web* config is
publishable by design; the model provider key, database credentials and service-account
JSON stay server-side and must never appear in client code, an env var prefixed for the
browser, or a build artifact.

## Untrusted content

The console renders data that came from **users and from a model**: records, chat messages,
generated schemas, endpoint descriptions.

INVARIANT: never render any of it as trusted HTML. No `dangerouslySetInnerHTML` on
project-originated content. JSON goes through a viewer that escapes.

## Credentials the console handles

| Credential | Rule |
| --- | --- |
| Firebase ID token | held by the SDK; never logged, never in a URL |
| Project API key | displayed **once** at creation, then never again. Do not cache it, do not put it in local storage, do not log it |

The key-shown-once moment needs deliberate UX: Drovi genuinely cannot recover the key, so a
dismissed dialog means the user must issue a new one.

## Sign-out

A 401 clears the token **and every cached view of another user's data**. Clearing the token
alone leaves the previous account's projects on screen.

## Checklist before merging a client change

- [ ] No secret value, and nothing sensitive in a browser-exposed env var
- [ ] No entitlement computed or enforced locally
- [ ] No project-originated content rendered as HTML
- [ ] No API type hand-written
- [ ] Platform errors and simulated errors still render differently
- [ ] 401 clears caches, not just the token
