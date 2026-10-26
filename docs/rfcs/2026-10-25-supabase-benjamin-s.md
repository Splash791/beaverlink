# RFC: Supabase as Hosted Postgres, Better Auth for Login

| Field | Value |
| --- | --- |
| Author | Benjamin Smithynunta |
| Date | 2026-10-25 |
| Status | Proposed |
| Decision Date | (fill when decided) |
| Deciders | (fill when decided) |
| Superseded By | (N/A) |

## Problem and Context

BeaverLink is a web app for the OSU Alumni Association that recommends which OSU students and alumni should meet at networking events. Users fill out a profile and survey, and a Python matching engine ranks who to meet. Our draft [tech stack doc](https://docs.google.com/document/d/16LsshO28nIFrSqVz9jE3ZZ3os9R4nk1fer3xpqijX5o/edit?usp=sharing) lists Supabase for the database, authentication, and realtime. Hosting is still "TBD (OSU or cloud)", and we do not know yet how students and alumni must sign in. In review, Andy Nguyen asked that the database choice stay pending until hosting is confirmed. I flagged that putting both Postgres and auth on Supabase makes a later move harder. That cost lands on our project partner and on future teams who maintain BeaverLink after handoff, not on us.

The hard-to-reverse part is where user accounts live. Plain Postgres tables move to any Postgres host with `pg_dump` and restore. Supabase Auth is different. It keeps users in its own `auth` schema, its row-level security (RLS) rules call `auth.uid()`, and its tutorials have the browser query the database directly. Once our tables and screens are built on those three things, leaving Supabase means rewriting all of them and importing every user.

This matters now because sprint 2 writes the first schema (profiles, surveys, events, matches) and the first login screen. Teammates and coding agents copy whatever those first PRs do, because our AGENTS.md tells agents to "match existing code convention." If we do nothing, sprint 2 starts without a login, and each person or agent that needs one will likely follow Supabase's tutorial default.

## Options

### Option A: Supabase All-In

Use Supabase for Postgres, auth, and realtime with its default patterns. The React frontend calls `supabase-js` for data and login, and RLS rules using `auth.uid()` decide who can see what.

**Benefits:** fastest path to working login and CRUD screens, and the least backend code.
**Costs:** authorization is split between SQL rules and Python, and leaving means rewriting rules, frontend queries, and user records.
**Right choice when:** the partner confirms BeaverLink stays on Supabase long-term and someone on their side owns the account after handoff.

### Option B: Supabase Postgres and Supabase Auth Behind a Wall

Keep Supabase Auth, but the frontend uses `supabase-js` only to sign in and out. All data goes through FastAPI, which checks the Supabase login token in one module. App tables point at our own `users` table, not `auth.users`.

**Benefits:** ready-made auth, and app code does not depend on Supabase.
**Costs:** user accounts still live in Supabase's `auth` schema, so leaving still means exporting password hashes, importing them into a new provider, and remapping user IDs.
**Right choice when:** the partner will own the Supabase account but wants the app code portable.

### Option C: Supabase Postgres and Better Auth

Use Supabase only as hosted Postgres, through a standard connection string. Login runs on [Better Auth](https://www.better-auth.com/docs/introduction), an MIT-licensed TypeScript auth library that stores users in our own database. Because Better Auth needs a JavaScript server and our backend is FastAPI, it runs as a small Node service. FastAPI checks its login tokens with the public key Better Auth publishes. All data goes through FastAPI.

**Benefits:** user accounts are ordinary tables in our database, so they move with `pg_dump` like everything else. We do not write password code ourselves.
**Costs:** one extra service to run and host, and more FastAPI code than Option A.
**Right choice when:** hosting and sign-in are undecided and we want user accounts to move with the database.

### Option D: Do Nothing

Leave the platform "pending" and start sprint 2 on local Postgres in Docker.

**Benefits:** no commitment until the partner answers our hosting questions.
**Costs:** login cannot be built or tested in sprint 2, so the first end-to-end prototype slips. People and agents pick their own auth patterns in the meantime, and the decision arrives in sprint 3 with more code to change.
**Right choice when:** the partner will answer hosting and sign-in questions within a week.

## Analysis

**Reversal cost.** Supabase stores accounts in `auth.users` with bcrypt password hashes, and auth providers document importing those hashes so users keep their passwords ([WorkOS migration guide](https://workos.com/docs/migrate/supabase)). The harder part is everything that points at Supabase's auth model. Neon's guide for leaving Supabase says every `auth.uid()` in a rule must be replaced, user IDs may change so every `user_id` column needs remapping, and the Supabase client must be replaced ([Neon guide](https://neon.com/guides/complete-supabase-migration)). Option A pays all of that. Option B pays the user import and ID remap. Option C pays none of it, because Better Auth keeps users in four tables in our own database (`user`, `session`, `account`, `verification`) ([Better Auth database docs](https://www.better-auth.com/docs/concepts/database)). Writing our own auth would also avoid Supabase, but it puts password storage, resets, and sessions on a four-person student team, so I left it out as an option.

**Security.** Supabase's docs warn that an exposed table without RLS "is readable and writable by any role with a grant on it," and that `auth.uid()` returns null for signed-out users, so a wrong rule can fail without an error ([Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)). In Option A, coding agents would write many of these rules. Options B and C keep authorization in Python, where pytest covers it and reviewers can read it. Option C has one new risk. Better Auth's tables, including `session`, sit in a database that Supabase can expose through its API, so RLS must be on for them too.

**Complexity.** Option A is fastest to a first demo. Options B and C add FastAPI endpoints, which we planned to build anyway for business logic and matching. Option C also adds the Node auth service. Better Auth's JWT plugin publishes a public key at `/api/auth/jwks` for "services that can't use the session" ([JWT plugin docs](https://www.better-auth.com/docs/plugins/jwt)), so FastAPI can check tokens without calling the Node service on each request.

**Cost.** Supabase's free plan includes a 500 MB database and two active projects, but free projects pause after one week of inactivity and get no automatic backups. Pro is $25 a month ([Supabase pricing](https://supabase.com/pricing)). Profile and survey data should fit in 500 MB. That is an estimate, because we have no partner data or user counts yet. The pause rule matters for a demo that may sit idle between events. Option C's Node service can run on the same host as FastAPI.

**Sign-in.** Students have OSU accounts. Whether alumni keep a usable OSU identity is not confirmed. Better Auth's Generic OAuth plugin supports "any OAuth 2.0 or OpenID Connect (OIDC) provider" ([Generic OAuth docs](https://www.better-auth.com/docs/plugins/generic-oauth)), so if OSU sign-in uses one of those, we can add it later without moving users.

**Embeddings.** CI already runs Postgres with pgvector, and Supabase supports it ([Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector)), so this does not change the choice.

**Uncertainty.** I do not know whether OSU will require OSU hosting, how alumni must sign in, or whether the Alumni Association allows this data with a third-party vendor. Option C loses the least if any of these changes. I have not yet run Better Auth next to FastAPI, so the cost of the extra service is untested.

## Recommendation and Verification Plan

I recommend Option C, Supabase as hosted Postgres with Better Auth for login. It is the only option where user accounts move with the database, and it still avoids writing our own password code. It also follows Andy's point, because we commit to Postgres and treat Supabase as a host we can replace. It also is nicer to potential future teams working on the project and the project partner as they will not have to deal with the lock-in of using a specific db provider like Supabase and being stuck with it for auth as well. 

**How we will know it worked:**

1. **Portability test in CI (every PR, from sprint 2).** CI already starts a plain Postgres container and runs `ruff` and `pytest` once `backend/` has code. We add a step that applies all migrations, including the SQL that Better Auth's `generate` command produces, before tests run. If anything needs a Supabase-only feature, this job fails. Acceptance: green on every merged PR.
2. **No Supabase client in the frontend (every PR).** An ESLint rule in the existing `npm run lint` step fails if frontend code imports `@supabase/supabase-js`. Acceptance: zero violations (should probably also be written into AGENTS.md when this decision is confirmed).
3. **Authorization tests (sprint 2).** Pytest checks that FastAPI rejects requests with no token, an expired token, or a token not signed by the Better Auth key, and that a user cannot read or edit another user's profile or survey. Acceptance: tests exist for every endpoint that touches user data.
4. **RLS check (sprint 2).** A script uses only Supabase's public key to read every table, including Better Auth's `user`, `session`, and `account`. Acceptance: every read returns no rows.
5. **Exit rehearsal (before winter handoff planning).** Run `pg_dump` on the Supabase dev database with seed users, restore into plain Postgres, point Better Auth and FastAPI at it, and log in as a seed user. Acceptance: a written runbook and one successful login. If this fails, something Supabase-only got into the app.

## Constraints

**Licensing.** Supabase is Apache 2.0, Better Auth is MIT ([GitHub](https://github.com/better-auth/better-auth)), and PostgreSQL uses the PostgreSQL License, so none put obligations on our code. The hosted Supabase service has its own terms of service, and the partner would need to own or accept that account at handoff.

**Data use.** Profiles and surveys hold personal data about students and alumni, and storing it on Supabase makes a third party hold it. We have no data-use terms from the partner yet. The free plan has no backups, so before real data arrives we either pay for Pro or schedule our own `pg_dump` backups(which I have personally done before for personal projects).

**IP.** The schema, FastAPI code, and matching engine are ours to hand off under the partner agreement. With Option C, the user accounts are part of that database too, so the partner gets a working system even if they never take over the Supabase account.

**Partner confidentiality boundary.** BeaverLink is not under an NDA. This RFC used only public documentation, our repository, the tech stack doc, and my own notes/review on it.

## Delegation and Validation

- **What I handed to AI tools.** I used Claude to read the course RFC template, our repository (CI workflow, AGENTS.md, CONTRIBUTING.md), and the tech stack doc. It looked up Supabase's pricing, RLS, and pgvector docs, two migration guides, and Better Auth's docs, and drafted this document from my review comments. I had it reshape the draft around my main point, which is Supabase for Postgres only and a separate auth library for login. That concern came from my own review comment before I used any AI. I talked through my own perspective and judgement with Claude before drafting and refining this document to align with my own.

- **What checks made that reasonable.** This is research and writing, so the checks are mostly human. Every factual claim links to its source, the RFC gets two peer reviews and an instructor review, and nothing is decided until the team accepts it. In the repo today, CI runs on every PR to `dev` and `main`, with `ruff` and `pytest` against Postgres for the backend and `tsc`, lint, tests, and build for the frontend. Those jobs only run once `backend/` and `frontend/` have code. CONTRIBUTING.md bans direct pushes to `dev` and `main`, needs one approval and passing CI to merge, and asks each PR to say the author tested agent-written code. The team tested branch protection in [PR #2](https://github.com/Splash791/beaverlink/pull/2). The migration step, ESLint rule, RLS script, and exit rehearsal do not exist yet.

- **Where I stopped and validated the result myself.** Because this decision is hard to reverse, I opened each cited page and confirmed the figures (500 MB, one-week pause, $25 Pro, bcrypt hashes, the `auth.uid()` rewrite, Better Auth's four tables and MIT license). I checked that the options match what our team discussed in the tech stack doc. I chose the recommendation myself, based on what I can defend without the tool. Leaving Supabase is expensive because of where user accounts live, so the recommendation moves the accounts, not the database. 

## Decision

Proposed. Awaiting team discussion after peer review and the partner's answers on hosting and sign-in. If the partner requires OSU hosting or OSU sign-in, this RFC gets revisited, and checks 1 to 5 show what has to move.
