<!-- docs/rfcs/2026-10-25-recommendation-data-model.md -->

# RFC: Recommendation Data Model for BeaverLink

<!-- Decision record header. Leave Status as "Proposed" until your team decides.
     Then fill in the outcome and the decision date.
     The document stays where it is; this header is what makes it a record. -->

| Field | Value |
| --- | --- |
| Author | Brady Hanna |
| Date | 2026-10-25 |
| Status | Proposed |
| Decision Date | (fill when decided) |
| Deciders | BeaverLink Team |
| Superseded By | Not applicable |

## Problem and Context

BeaverLink will recommend connections between Oregon State University students and alumni using profiles, interests, career goals, surveys, and event attendance. PostgreSQL is the proposed database, but the team has not decided how to represent recommendation-related data.

Some data has stable relationships: users register for events, select interests, and receive recommendations. Other data may change as the partner refines survey questions or as possible OSU Connections integration is explored. The model must support reliable data validation, efficient matching queries, and changes without constant rework.

This choice affects API contracts, feature extraction, and migrations. It becomes harder to reverse once real profiles and responses are stored. Deferring it would allow mock-data experimentation, but delay database-backed workflows and testing.

## Options

### Option A: Normalized Relational Schema

Store users, events, registrations, interests, survey questions, and answers in related tables with primary and foreign keys.

**Benefits:** Strong integrity, predictable types, conventional SQL joins, and consistent inputs for matching.

**Costs:** New response shapes or external attributes may require more tables, joins, or migrations. A question-and-answer design can accommodate many new questions without changing the schema.

**Best when:** Matching attributes and survey response types are reasonably stable.

### Option B: Mostly JSONB

Store profile attributes and survey responses primarily in PostgreSQL JSONB documents. PostgreSQL supports JSONB operators and selected indexed searches [1, 3].

**Benefits:** Flexible optional fields; fewer migrations for evolving profile structures.

**Costs:** Field types, required keys, and answer categories need explicit validation. Queries and consistent feature extraction may become harder as documents diverge.

**Best when:** Most attributes vary substantially and are usually retrieved as whole documents.

### Option C: Do Nothing — Defer Persistent Modeling

Continue testing matching with synthetic Python objects or JSON files while awaiting clearer survey and integration requirements.

**Benefits:** Avoids designing around unconfirmed assumptions.

**Costs:** Delays persistence, relational integrity checks, API/database integration, and representative query testing.

**Best when:** A critical partner decision is imminent and persistent workflows are not needed in the next sprint.

### Option D: Hybrid Relational + JSONB

Keep core entities, standardized interests, event participation, and frequently queried matching attributes relational. Use validated JSONB for optional or experimental responses whose shape is unsettled.

**Benefits:** Retains relational integrity and consistent scoring features while allowing carefully bounded flexibility.

**Costs:** Requires clear rules about which representation is authoritative; duplication could create conflicting values.

**Best when:** Core relationships are known but some questions and integration fields remain uncertain, as with BeaverLink.

## Analysis

**Integrity and maintenance.** PostgreSQL constraints enforce valid relationships and prevent duplicate or orphaned records [2]. BeaverLink needs these protections for registrations and recommendations regardless of how optional answers are stored. JSONB does not automatically enforce an application-specific answer schema. A hybrid model can keep canonical identifiers and common attributes relational while validating optional JSONB fields through FastAPI. The team must define a single source of truth for every attribute.

**Query performance.** Initial matching will likely filter attendees by event and compare structured interests and goals. Relational indexes and joins are a natural fit. JSONB supports GIN indexing for certain operations, but not every predicate benefits equally [1, 3]. Neither approach has been benchmarked for BeaverLink; performance should be measured with representative synthetic datasets and EXPLAIN ANALYZE, not assumed.

**Changing requirements.** New survey questions do not always require migrations in a normalized question/answer system, but new answer formats might. JSONB can absorb unfamiliar fields more readily, shifting some complexity to runtime validation and analytics. PostgreSQL supports schema changes, although certain alterations can lock or rewrite data [4]. The hybrid approach reserves flexibility for genuinely unsettled fields without weakening the entire model.

**Recommendation quality.** Consistent, typed features help the matching engine distinguish absent responses from explicit choices and avoid inconsistent category names. Core interests and networking goals should be standardized. Free-text responses can remain available for future semantic matching without committing now to embeddings or vector search. FastAPI should expose a versioned, tested feature-extraction contract independent of how the raw data is stored.

**Privacy and cost.** Both relational fields and JSONB may contain personal information. JSONB is not permission to retain arbitrary OSU Connections data; access, retention, and data minimization need partner approval. Because each persistent option uses PostgreSQL, the main cost difference is development and maintenance effort rather than software licensing. No measured cost or throughput comparison currently exists.

**Reversibility.** Before real data exists, revising a schema is manageable. Later, changes may require backfills, compatibility work, and coordinated API updates. This makes a small, validated initial schema preferable to either premature over-design or indefinite deferral.

## Recommendation and Verification Plan

I recommend **Option D: a hybrid relational and JSONB schema**, with JSONB limited to optional or changing fields. Use relational tables for users, profiles, events, registrations, controlled interests, and standardized matching features. Record survey versions, validate all optional responses, and avoid storing the same fact in two authoritative places. This is a proposal, not a team-approved decision.

**Planned checks (not yet completed):**

1. **Schema prototype:** Insert synthetic users, events, interests, and varied survey answers. **Pass:** CRUD operations work; foreign keys and uniqueness constraints reject invalid records.
2. **Feature extraction:** Convert stored answers into typed features for the matching engine. **Pass:** Equivalent answers yield equivalent features; missing and malformed values are handled explicitly.
3. **Query evaluation:** Measure event-attendee retrieval with different synthetic data sizes using `EXPLAIN ANALYZE` and API timings. **Pass:** Results are correct and meet a latency target established with the team and partner.
4. **Schema evolution:** Add an optional question and a standardized interest. **Pass:** Existing records remain readable; no destructive migration is necessary for the optional field.
5. **Privacy review:** Identify permitted fields, visibility, retention, and any approved OSU Connections access. **Pass:** Partner requirements are documented and unauthorized access tests fail as intended.

If nearly all attributes become stable and standardized, reconsider Option A. If authorized external data is unusually variable, revisit the JSONB boundary. Any substantial later reversal should be recorded in a superseding RFC.

## Constraints

**Data and confidentiality:** Use synthetic profiles until the partner approves actual data collection and hosting. OSU Connections access and reuse are not confirmed. Apply data minimization, authorization, and deletion rules to both structured and JSONB content; do not expose confidential partner information in public repositories or AI prompts.

**Licensing and IP:** PostgreSQL uses the PostgreSQL License [5]. Project-partner agreements and third-party data terms may introduce additional restrictions that remain to be verified.

**Scope:** This RFC covers data representation, not database hosting, authentication, or the matching algorithm itself.

## Delegation and Validation

I used ChatGPT to help research PostgreSQL data modeling approaches, compare relational tables with JSONB, and organize the findings into an RFC. I provided context about BeaverLink's planned functionality, technology stack, and the assignment requirements. ChatGPT helped identify tradeoffs involving data integrity, query performance, flexibility, and maintainability, as well as suggest tests for evaluating the proposed hybrid schema.

I reviewed the recommendation in the context of BeaverLink's requirements. Since our matching system will rely on structured information such as career interests, networking goals, and survey responses, I wanted to ensure that the proposed design would support efficient queries without making future changes unnecessarily difficult. I also considered our potential integration with OSU Connections and the fact that we haven't finalized the information we'll collect from users.

Our repository currently has development guidelines and a proposed architecture, but we haven't implemented the database or established automated tests for it. Because of this, the validation plan focuses on future integration tests, schema constraints, and query performance comparisons rather than claiming that the design has already been tested. The final schema will need to be reviewed by the team before implementation.

## Decision

**Proposed:** Use normalized PostgreSQL tables for stable recommendation data and validated JSONB for optional, evolving attributes. Record a decision date and the deciders only after team review; supersede this record if a later decision replaces it.

## References

[1] PostgreSQL Global Development Group. [JSON Types](https://www.postgresql.org/docs/current/datatype-json.html).

[2] PostgreSQL Global Development Group. [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

[3] PostgreSQL Global Development Group. [GIN Indexes](https://www.postgresql.org/docs/current/gin.html).

[4] PostgreSQL Global Development Group. [ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html).

[5] PostgreSQL Global Development Group. [PostgreSQL License](https://www.postgresql.org/about/licence/).
