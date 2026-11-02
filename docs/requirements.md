# BeaverLink Requirements

Status at this commit: only the backend scaffold exists (`GET /health`). Everything marked *Planned* is not built yet. Priorities use MoSCoW (Must, Should, Could, Won't).

## Problem Statement

At OSU Alumni Association networking events, students and alumni do not know who in the room is worth meeting, so useful conversations depend on luck. BeaverLink recommends who each attendee should meet at an event and explains why each match makes sense, using profile fields, an event survey, and free-text career goals.

**Evidence:** none gathered yet, so the problem is *assumed*. Planned: attend real alumni events and observe how attendees find people to talk to without the app.

## Users

- **Students** looking for mentors, jobs, or career advice.
- **Alumni** who want to mentor, recruit, or network.
- **Alumni Association event staff** who run events and want attendees to make useful connections.

## Functional Requirements

| ID | Requirement | Priority | Why | Status | Acceptance criterion |
| --- | --- | --- | --- | --- | --- |
| FR-0 | The backend reports that it is up. | Must | Deploys and CI need a check that the server runs. | Done | CI test `backend/tests/test_health.py::test_health_returns_ok` |
| FR-1 | A user can create an account and sign in. | Must | Profiles and matches belong to a person. | Planned | A new user signs up, signs out, and signs back in. Requests without a valid token get 401. Sign-in method is open (see RFCs). |
| FR-2 | A user can create and edit their own profile (major or industry, job, goals). | Must | Matching has no input without profiles. | Planned | A user can read and edit only their own profile; editing another user's profile returns 403. |
| FR-3 | A user can fill out an event survey for an event they attend. | Must | Matches are per event and depend on what each person wants from it. | Planned | Survey answers are saved per user per event and can be edited until the event starts. |
| FR-4 | A user sees a ranked list of people to meet at an event. | Must | This is the core feature. | Planned | Given seed profiles, the list is ordered by match score and excludes the user themself. |
| FR-5 | Each recommendation explains why the two people matched. | Should | Explanations build trust, but a ranked list alone still works. | Planned | Each match shows per-feature scores that sum to its total score. |
| FR-6 | Profiles can be filled from more than one source (manual entry first, OSU Connections later). | Could | Depends on OSU and Gravyty approvals we do not control. | Planned | Adding a new source needs no schema change (RFC: profile data source). |

## Non-Functional Requirements

| ID | Requirement | Priority | Measure |
| --- | --- | --- | --- |
| NFR-1 | Privacy: development and CI use fake seed data only. | Must | No real names or emails in seed files or test fixtures (checked in review). |
| NFR-2 | Security: authorization lives in the backend and secrets stay out of the repo and the frontend build. | Must | Every endpoint that touches user data has a test that rejects a missing or wrong token. |
| NFR-3 | Portability: the database runs on plain PostgreSQL with pgvector. | Must | CI applies all migrations to the plain Postgres container it already runs. |
| NFR-4 | Usability: signup is fast. | Should | Most of at least 5 test users finish profile and survey in under 5 minutes. |
| NFR-5 | Explainability: match scores are not opaque. | Should | Same as FR-5's criterion. |

## Constraints

Limits the team did not choose:

- **C-1 Personal data rules.** Student data tied to OSU may fall under FERPA. We do not store real student or alumni data until the partner gives data-use terms.
- **C-2 OSU Connections access.** Profile import from OSU Connections (Gravyty's Graduway platform) needs OSU to enable API access, and storing that data is pending Gravyty's legal review.
- **C-3 Alumni sign-in.** ONID accounts are deactivated one year after graduation, so OSU login cannot be the only sign-in for alumni.
- **C-4 AI tool rules.** The team charter bans sharing real student or alumni data and credentials with AI tools.
- **C-5 Hosting accounts.** Production runs on free cloud plans registered to an email the partner provides, as agreed with the partner on 2026-10-16.
- **C-6 Schedule.** The walking skeleton must be deployed by fall week 10, and the project hands off to the partner after winter term.
- **C-7 LinkedIn terms.** LinkedIn prohibits scraping, so we may only use Sign In with LinkedIn and exports users upload themselves.

## Success Metrics

| Metric | Target | Decision rule | How we collect it |
| --- | --- | --- | --- |
| Attendees who finish the event survey before the event | 60% | Below 60% at the first pilot event: shorten the survey or add profile auto-fill before the next event. | Survey completions in the database divided by the event's attendee list. |
| Time to finish profile and survey | Under 5 minutes for most users | If most of 5 test users take longer, cut or reorder survey questions. | Timed usability sessions. |

## Non-Goals

- Not a general social network or messaging app.
- Not a replacement for OSU Connections.
- No scraping of LinkedIn or other sites.
- No hosted embedding APIs in v1; any embeddings run locally (RFC: embeddings).

## Open Questions

Each question is owned by whoever raised it. The owner gets the answer or brings it to the team by the date.

| Question | Owner | Answer by |
| --- | --- | --- |
| Which free cloud host runs production? | Benjamin Smithynunta | 2026-11-08 |
| How must alumni sign in? | Andy Nguyen | 2026-11-15 |
| Will OSU enable the Graduway API, and may we store the data it returns? | Andy Nguyen | 2026-11-29 |
| Which profile fields can the Graduway API read? | Andy Nguyen | 2026-11-29 |
| Do embeddings improve matching enough to turn them on? | Tyler Quach | End of winter week 3 |
