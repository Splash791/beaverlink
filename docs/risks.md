# BeaverLink Risk Register

This is the only risk register for BeaverLink. Rank 1 is the highest risk. Update it between checkpoints.

## Risks

| Rank | Type | Risk | Likelihood | Impact | Owner | Mitigation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Business | The production target is not agreed with the partner, so the week 10 deployment could slip. | High | High | Benjamin Smithynunta | Propose a target to the partner this week; default to a cloud host the partner can take over. |
| 2 | Business | We have no data-use terms for real student and alumni data. | High | High | Andy Nguyen | Use fake seed data only; ask the partner for terms before any real data. |
| 3 | Technical | OSU may not enable the Graduway API, or Gravyty legal may not allow storing its data. | Medium | Medium | Andy Nguyen | Build manual profile entry first; API is an optional source (RFC: profile data source). |
| 4 | Technical | Alumni lose ONID accounts after one year, so OSU login cannot be the only sign-in. | High | Medium | Andy Nguyen | Plan Google and LinkedIn sign-in. |
| 5 | Technical | Choosing Supabase Auth would lock user accounts to Supabase. | Medium | High | Benjamin Smithynunta | Keep users in our own database (RFC: Supabase with Better Auth). |
| 6 | Technical | Embeddings may not improve matching or may leak free text to a third party. | Medium | Medium | Tyler Quach | Local model, separate table, off by default until evaluated (RFC: embeddings). |
| 7 | Technical | Branch protection on `dev` and `main` may not be enforced in GitHub settings. | Medium | Medium | Tyler Quach | Confirm protection rules match CONTRIBUTING.md. |
| 8 | Team | Four people sharing one codebase with heavy AI use may merge inconsistent patterns. | Medium | Medium | Brady Hanna | AGENTS.md points agents at these docs; one approval and green CI to merge. |

## External Prerequisites

| Prerequisite | Needed for | Asked by | Asked of | Date asked | Status |
| --- | --- | --- | --- | --- | --- |
| Agreement on production hosting and account owner | Week 10 deployment | Benjamin Smithynunta | OSU Alumni Association (partner) | Not yet asked | Open |
| Data-use terms for student and alumni data | Any real data | Andy Nguyen | OSU Alumni Association (partner) | Not yet asked | Open |
| OSU enables Graduway API access | Profile import | Andy Nguyen | OSU Connections admin (via Gravyty contact) | 2026-10-22 | Pending; admin not yet identified |
| Gravyty legal approval to store profile data | Profile import | Andy Nguyen | Gravyty | 2026-10-22 | Pending |

## Staging and Rollback Plan

- **Where changes are exercised:** every PR runs CI; once hosting is picked, PRs to `main` get a preview or staging deployment of the same host. Owner: Benjamin Smithynunta. Lands by: 2026-11-22 (fall week 8).
- **How a bad change is undone:** revert the merge commit on `main` with a PR and redeploy the previous build; schema changes ship as reversible migrations with a tested down step. Owner: Benjamin Smithynunta. Lands by: 2026-11-22 (fall week 8).
