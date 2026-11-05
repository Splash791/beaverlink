# RFC 0001: Should BeaverLink's First Release Use Stored Text Embeddings for Matching?

**Status:** Draft for peer review
**Author:** Tyler Quach
**Date:** October 26, 2026
**Related:** `docs/adr/tech-stack.md` (BeaverLink Technology Stack & Architecture, proposed)

*This draft is sanitized: the university, the project partner, and the partner's alumni-platform vendor are referred to by role. Scope note: other RFCs this term cover the account and authentication platform and the profile data source. This RFC assumes a PostgreSQL database with the pgvector extension is available and does not decide those questions.*

## 1. Problem and Context

BeaverLink recommends which students and alumni should meet at a networking event, using survey answers, profile fields, and free-text career goals. The tech stack document proposes a Python matching engine using scikit-learn for structured scoring, with Sentence Transformers embeddings and pgvector search both marked "optional." Its pending-decisions list includes "whether embeddings and vector search are necessary for the initial release." Its implementation strategy builds the structured baseline first and defers semantic matching to step 6, "evaluate semantic matching and other AI enhancements."

**Decision needed:** Whether the first release stores text embeddings of users' free-text answers, and if so on what terms: which model, where the model runs, and how the vectors are stored.

**Why it can be hard to reverse (Type 1), and when it is not.** A matching feature is normally easy to swap. Three choices inside it are not, if made carelessly:
1. **Schema.** A pgvector column declares a fixed dimension (for example `vector(384)`), and indexes support up to 2,000 dimensions for standard vectors ([pgvector README](https://pgxn.org/dist/vector/0.7.3/)). Changing the model usually changes the dimension, so every stored vector must be regenerated and the column and index rebuilt.
2. **Data flow.** Sending users' free-text career goals to a hosted embedding API is a data-use commitment that cannot be undone for text already sent. The partner has not given us data-use terms.
3. **Coupling.** If match explanations, ranking, and the profile table all depend on embedding scores, removing or replacing them later means redesigning the product, not swapping a library.

The decision becomes reversible if embeddings live in a separate, regenerable table that nothing else depends on, computed locally. This RFC chooses that design on purpose.

**Why now.** Step 1 of the implementation strategy lays down the database foundation, and the first schema migration is the cheapest moment to decide whether a `vector` column exists and where. The team also has no real event data yet, so any claim that embeddings improve matching is currently untested.

**If we do nothing.** Embeddings arrive by drift: a teammate or coding agent adds a `vector` column to the profile table, calls a hosted API for convenience, and the first release depends on it. The choice then gets made by whoever writes the first migration.

## 2. Options

**A. Structured scoring only; no embeddings in v1 (do nothing about embeddings).** Weighted scoring over survey and profile fields with scikit-learn.
*Costs:* Free-text answers go unused, and related goals phrased differently (for example "break into data science" and "ML career") look unrelated. The stack document names keyword-only matching as the risk of missing semantic relationships.
*Right when:* The survey is mostly structured and free text is optional or short.

**B. Hosted embedding API from day one, vector column on the profile table.**
*Costs:* Free text leaves our infrastructure under unknown partner terms; per-call cost and vendor model deprecation can force re-embedding; the dimension is locked into the main schema; and matching depends on an external service being up.
*Right when:* The partner approves third-party processing in writing and a measured quality gap justifies it.

**C. Local open model, regenerable embeddings table, used as one gated feature (recommended).** Run a small open Sentence Transformers model inside the FastAPI service. Store vectors in a separate `profile_embeddings` table keyed by user and `(model_id, dimension)`, never on the profile table. Embedding similarity is one weighted feature in the hybrid score, behind a feature flag that stays off until offline evaluation shows it helps.
*Costs:* The model must be downloaded and held in backend memory; long answers get truncated (see section 3); extra tests and an evaluation harness; slightly more schema.
*Right when:* Free text matters, data must stay on our infrastructure, and we want the option to remove embeddings cheaply.

**D. Embeddings only, replacing structured scoring.**
*Costs:* The stack document notes embedding-only matching "may overlook complementary networking goals," and weighted scoring is what lets the team explain why two people matched. Opaque scores are also harder to test.
*Right when:* The survey has no structured fields at all.

## 3. Analysis

| Tradeoff | A | B | C | D |
|---|---|---|---|---|
| Reversibility | High | Low | High | Low |
| Matching quality on free text | Weak | Likely best | Good enough, to be measured | Unmeasured |
| Privacy | Strongest | Weakest | Strong (data stays local) | Depends |
| Complexity | Lowest | Medium | Medium | Medium |
| Explainability | Strong | Medium | Strong (feature scores shown) | Weak |
| Cost | None | Per-call, unknown | CPU and memory only | Same as C |

**Why a small local model is plausible.** A widely used small Sentence Transformers model, all-MiniLM-L6-v2, produces 384-dimensional vectors, is released under Apache 2.0, and by default cuts input off after 256 word pieces ([model card mirror](https://huggingface.co/mmine/all-MiniLM-L6-v2)). Supabase's own pgvector guide uses a `vector(384)` column in its example ([Supabase, pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)), so this dimension is well supported. Those same Supabase docs say nothing about switching models, which is why the table design in Option C, with `model_id` and `dimension` recorded per row, carries that risk ourselves.

**Truncation is a real quality risk.** The 256-word-piece default means a long career-goals answer is silently cut. This is why Option C includes a length test and a survey length limit; I have not measured how long real answers will be, and we have none yet.

**Indexing needs no early optimization.** The pgvector README describes HNSW and IVFFlat indexes and notes that standard vectors can be indexed up to 2,000 dimensions, far above 384. Event size is unconfirmed, but a networking event is very unlikely to reach millions of attendees, so an exact scan without an index is probably fast enough for a first release. I have not benchmarked this, and the team will measure it on synthetic data.

**Project evidence.** The stack document marks embeddings and vector search optional and sequences them after the structured baseline (Implementation Strategy, steps 3 to 6). The team repository (commit 4d3a842) enforces pull requests and runs CI on every PR to `dev` and `main`, so the checks in section 4 can become required status checks. I have not yet confirmed that the CI database service includes pgvector; that is the first task for the verification plan.

**Uncertainty.** We have no real survey responses, no labeled examples of good matches, and no event-size data. Whether embeddings beat structured scoring here is unknown, which is exactly why Option C ships them off by default. The design turns what could be a pure quality bet into a measured, removable experiment.

## 4. Recommendation and Verification Plan

**Recommend Option C**, with the rule that embeddings are computed only inside the `matching/embeddings/` module, stored only in `profile_embeddings`, and enabled only after check 2 passes.

Checks are pass/fail and run in the existing PR CI (commit 4d3a842) once the backend exists.

1. **Removability test.** Run the full backend test suite with the `profile_embeddings` table dropped and the flag off. *Pass:* all tests green and recommendations still return. *Detects:* hidden dependence on embeddings.
2. **Offline quality evaluation.** Build a labeled set of synthetic profile pairs, with good-match judgments made by at least two teammates, and compare structured-only vs hybrid on NDCG@5. *Pass:* the flag is switched on only if hybrid beats the baseline by a margin the team fixes before running the experiment. *Detects:* adopting embeddings that do not help.
3. **No-egress test.** In CI, run the embedding module with outbound network access blocked. *Pass:* embeddings still compute. *Detects:* any accidental call to a hosted API.
4. **Model-swap test.** Regenerate all vectors under a second model with a different dimension into new rows and run matching. *Pass:* works with no change outside `matching/embeddings/` and a migration, and finishes within one working session for the synthetic dataset. *Detects:* schema lock-in.
5. **Explainability test.** Every recommendation returns per-feature scores that sum to its total. *Pass:* embedding similarity appears as its own labeled feature. *Detects:* opaque scoring.
6. **Truncation test.** An answer longer than the model's input limit is flagged or chunked, never silently cut. *Detects:* the quality risk above.
7. **Revisit trigger.** If check 2 fails, leave the flag off and delete the table; if the partner later approves a hosted service and measurements justify it, write a follow-up ADR.

## 5. Constraints

- **Licensing.** The model card lists Apache 2.0 and pgvector's PGXN listing names the PostgreSQL License, so neither places obligations on our code. I read the model card on a mirror and will confirm it on the official model page; the Sentence Transformers library license must also be checked before adoption.
- **Data use.** Free-text career goals about students and alumni are personal data. The partner's data-use terms and the university's privacy requirements, including whether FERPA applies, are pending (stack document, Pending Decisions). Local processing means no new third party receives that text. Derived vectors are personal data too, so they are covered by the same consent and retention rules and must be deletable per user.
- **IP.** Ownership of our code and data follows the course and partner agreement, which I have not confirmed for this decision. Option C relies only on openly licensed components.
- **Partner confidentiality.** No partner, vendor, or contact is named, and tests use synthetic profiles only.

## 6. Delegation and Validation

- **Handed to AI tools:** I used Claude to draft this RFC from the team's tech stack document, to look up the pgvector, Supabase, and model-card facts cited above, and to propose the structure of the verification checks. No code on this decision has been generated.
- **Checks that make that reasonable:** Pull requests are required and CI runs on every PR to `dev` and `main` (commit 4d3a842); embeddings stay behind a flag that is off by default; the vectors live in a separate table, so rollback is dropping it. The RFC itself goes through peer review before the team commits.
- **Where I validate myself, and why:**
  - *Cited claims:* I open each cited page and confirm it says what I attribute to it, including the 2,000-dimension index limit, the 384-dimension and 256-word-piece figures, and the license, because the recommendation depends on them.
  - *Schema and migrations:* I review the `profile_embeddings` table, key, and dimension handling by hand, because the dimension is what is hard to change once vectors exist.
  - *Evaluation design:* I write the labeled pairs and the success margin myself before running anything, since a generated test set tends to confirm whatever the model assumes.
  - *Privacy boundary:* I read the embedding module's imports myself, because text that leaves our infrastructure cannot be recalled.
- **Not delegated:** The choice among options, which I can defend without the tool.

## Decision

**Proposed.** Awaiting team discussion after peer review and the partner's answers on data-use terms. If the partner approves third-party processing, or check 2 fails, this RFC gets revisited.

## Revision Log

| Source | Comment | Response | Change made |
|---|---|---|---|
| | | | |
