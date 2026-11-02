# BeaverLink Requirements

Status at this commit: only the backend scaffold exists (`GET /health`). Everything below marked *planned* is not built yet.

## Problem Statement

At OSU Alumni Association networking events, students and alumni do not know who in the room is worth meeting, so conversations depend on luck. BeaverLink recommends who each attendee should meet at an event and explains why each match makes sense, using profile fields, an event survey, and free-text career goals.

## Users

- **Students** looking for mentors, jobs, or career advice.
- **Alumni** who want to mentor, recruit, or network.
- **Alumni Association event staff** who run events and want attendees to make useful connections.

## Functional Requirements

| ID | Requirement | Status | Acceptance criterion |
| --- | --- | --- | --- |
| FR-0 | The backend reports that it is up. | Done | CI test `backend/tests/test_health.py::test_health_returns_ok` |
| FR-1 | A user can create an account and sign in. | Planned | A new user signs up, signs out, and signs back in. Requests without a valid token get 401. Sign-in method is open (see RFCs). |
| FR-2 | A user can create and edit their own profile (major or industry, job, goals). | Planned | A user can read and edit only their own profile; editing another user's profile returns 403. |
| FR-3 | A user can fill out an event survey for an event they attend. | Planned | Survey answers are saved per user per event and can be edited until the event starts. |
| FR-4 | A user sees a ranked list of people to meet at an event. | Planned | Given seed profiles, the list is ordered by match score and excludes the user themself. |
| FR-5 | Each recommendation explains why the two people matched. | Planned | Each match shows per-feature scores that sum to its total score. |
| FR-6 | Profiles can be filled from more than one source (manual entry first, OSU Connections later). | Planned | Adding a new source needs no schema change (RFC: profile data source). |

## Non-Functional Requirements

- **Privacy:** profiles are real people's personal data. Development and CI use fake seed data only.
- **Security:** authorization lives in the backend and is covered by tests; secrets never enter the repo or the frontend build.
- **Portability:** the database must run on plain PostgreSQL with pgvector, so the partner can move hosts (RFC: Supabase with Better Auth).
- **Usability:** most users finish profile and survey in under 5 minutes in usability testing with at least 5 users.
- **Explainability:** match scores must be explainable to users, not opaque.

## Constraints

Limits the team did not choose:

- **Personal data rules.** Student data tied to OSU may fall under FERPA. We do not store real student or alumni data until the partner gives data-use terms.
- **OSU Connections access.** Profile import from OSU Connections (Gravyty's Graduway platform) needs OSU to enable API access, and storing that data is pending Gravyty's legal review.
- **Alumni sign-in.** ONID accounts are deactivated one year after graduation, so OSU login cannot be the only sign-in for alumni.
- **Hosting.** The partner and OSU decide where the production system runs; this is not yet confirmed.
- **Team charter.** Real student or alumni data and credentials may not be shared with AI tools.
- **Schedule.** The walking skeleton must be deployed by fall week 10; the project hands off to the partner after winter term.
- **LinkedIn terms.** LinkedIn prohibits scraping; we may only use Sign In with LinkedIn and exports users upload themselves.

## Success Metrics

- Share of attendees who complete a profile and survey before an event.
- Share of attendees who say at least one recommended match was worth meeting (post-event survey).
- Time to finish profile and survey (target: under 5 minutes for most users).

## Non-Goals

- Not a general social network or messaging app.
- Not a replacement for OSU Connections.
- No scraping of LinkedIn or other sites.
- No hosted embedding APIs in v1; any embeddings run locally (RFC: embeddings).

## Open Questions

- Where will production run (OSU hosting or cloud), and who owns the account after handoff?
- How must alumni sign in?
- Will OSU enable the Graduway API, and may we store the data it returns?
- Which profile fields can the Graduway API read?
- Do embeddings improve matching enough to turn them on?
