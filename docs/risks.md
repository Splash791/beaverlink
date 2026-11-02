# BeaverLink Risk Register

**Objective:** a walking skeleton deployed by fall week 10 that recommends who to meet at an OSU Alumni Association event, using only data we are allowed to hold. Impact is rated against this objective.

This is the only risk register for BeaverLink. Risks are sorted with high-high first. Review the top of this file at every sprint planning, and update it in the same PR as any change that affects a risk. When a trigger fires, the risk becomes an issue on the board.

## Risks

### R1. Production target not agreed

- **Statement:** if the partner does not agree a production host and account owner, the week 10 deployment may slip or have to move later.
- **Category:** Business
- **Likelihood:** High, because no host is picked yet.
- **Impact:** High, because deployment is the fall milestone.
- **Owner:** Benjamin Smithynunta
- **Response:** pick a free cloud host the team controls and get the partner's OK on it.
- **Trigger:** no partner agreement by 2026-11-08.

### R2. No data-use terms

- **Statement:** if we get no data-use terms for student and alumni data, we cannot test with or store real profiles.
- **Category:** Business
- **Likelihood:** High, because no terms exist yet.
- **Impact:** High, because matching quality depends on real data.
- **Owner:** Andy Nguyen
- **Response:** use fake seed data only, and ask the partner for terms once profile data access is close.
- **Trigger:** profile features are ready but no terms have arrived.

### R3. OSU Connections data unavailable

- **Statement:** if OSU does not enable the Graduway API, or Gravyty legal does not allow storing its data, profiles cannot be imported.
- **Category:** Technical
- **Likelihood:** Medium, because the API exists but needs OSU setup and legal review.
- **Impact:** Medium, because manual profile entry still works.
- **Owner:** Andy Nguyen
- **Response:** build manual entry first; the API is an optional source (RFC: profile data source).
- **Trigger:** no API access by the time profile features start.

### R4. Alumni cannot use OSU login

- **Statement:** because ONID accounts are deleted one year after graduation, alumni cannot rely on OSU sign-in.
- **Category:** Technical
- **Likelihood:** High, because this is OSU policy.
- **Impact:** Medium, because other sign-in options exist.
- **Owner:** Andy Nguyen
- **Response:** plan Google and LinkedIn sign-in.
- **Trigger:** a sign-in design that depends only on OSU accounts.

### R5. User accounts locked to one vendor

- **Statement:** if user accounts live in Supabase Auth, moving hosts later means rewriting auth and re-importing users.
- **Category:** Technical
- **Likelihood:** Medium, because Supabase is in the draft tech stack.
- **Impact:** High, because the partner inherits the lock-in.
- **Owner:** Benjamin Smithynunta
- **Response:** keep users in our own database (RFC: Supabase with Better Auth).
- **Trigger:** a PR imports `@supabase/supabase-js` in the frontend or references `auth.uid()`.

### R6. Embeddings do not help or leak text

- **Statement:** if embeddings are added without evaluation, matching may not improve, or free text may reach a third party.
- **Category:** Technical
- **Likelihood:** Medium, because no real data exists to evaluate on.
- **Impact:** Medium, because structured scoring still works.
- **Owner:** Tyler Quach
- **Response:** local model, separate table, off by default until evaluated (RFC: embeddings).
- **Trigger:** a PR adds a vector column to the profile table or calls a hosted embedding API.

### R7. Branch protection not enforced

- **Statement:** if GitHub rules do not enforce CONTRIBUTING.md, changes can reach `dev` or `main` without review.
- **Category:** Technical
- **Likelihood:** Medium, because the rules have not been checked against CONTRIBUTING.md.
- **Impact:** Medium, because the checkpoint grades history.
- **Owner:** Tyler Quach
- **Response:** confirm the rulesets match CONTRIBUTING.md.
- **Trigger:** any commit on `dev` or `main` that did not come from a PR.

### R8. Inconsistent code from heavy AI use

- **Statement:** with four people and AI tools writing code, inconsistent patterns may get merged.
- **Category:** Team
- **Likelihood:** Medium, because AI tools copy whatever pattern they see first.
- **Impact:** Medium, because rework costs sprint time.
- **Owner:** Brady Hanna
- **Response:** AGENTS.md points agents at these docs; one approval and green CI to merge.
- **Trigger:** two PRs solve the same problem in different ways.

## External Prerequisites

| Prerequisite | Needed for | Owner | Asked of | Asked or start-by | Status |
| --- | --- | --- | --- | --- | --- |
| Agreement on production host and account owner | Week 10 deployment | Benjamin Smithynunta | OSU Alumni Association (partner) | Start by 2026-11-08 | Open |
| Data-use terms for student and alumni data | Any real data | Andy Nguyen | OSU Alumni Association (partner) | Start by 2026-11-29 | Open |
| OSU enables Graduway API access | Profile import | Andy Nguyen | OSU Connections admin (via Gravyty contact) | Asked 2026-10-22 | Pending; admin not yet identified |
| Gravyty legal approval to store profile data | Profile import | Andy Nguyen | Gravyty | Asked 2026-10-22 | Pending |

## Staging and Rollback Plan

- **Staging (where changes are tried before users see them):** every PR runs CI now. Once the host is picked, PRs to `main` also get a preview deployment on that host. Owner: Benjamin Smithynunta. Lands by 2026-11-22 (fall week 8).
- **Rollback (how a bad change is undone):** revert the merge on `main` with a PR and redeploy the previous build. Schema changes ship as migrations with a tested down step. Owner: Benjamin Smithynunta. Lands by 2026-11-22 (fall week 8).
