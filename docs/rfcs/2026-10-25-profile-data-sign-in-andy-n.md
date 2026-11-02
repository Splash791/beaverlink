# RFC: Profile Data Source and Sign-In for BeaverLink

[Project ID]: BeaverLink

Andy Nguyen <nguyea28@oregonstate.edu>

| Field | Value |
| --- | --- |
| Author | Andy Nguyen |
| Date | 2026-10-25 |
| Status | Proposed |
| Decision Date | |
| Deciders | |
| Superseded By | |

## Problem and Context

BeaverLink recommends who attendees should meet at OSU Alumni Association events and explains why each match makes sense. Those recommendations are only as good as the profile data behind them. To match a student interested in healthcare with an alum in healthcare recruiting, we need each user's major, industry, job, and goals. The team has to decide where that profile data comes from and how users sign in to BeaverLink.

The obvious source is OSU Connections, the Alumni Association's existing profile platform, which runs on Gravyty's Graduway software. Our partner didn't require it, but since it's the platform the Alumni Association already uses, the team wants to build on it so users don't have to re-enter information they already have. On Oct 22, Nikki, our Gravyty contact, confirmed there's a REST API for profile data with no extra cost from Gravyty, but OSU has to set up API access on its side. She also shared Graduway's SSO feature, but it isn't clear yet whether outside apps like BeaverLink can use it to sign users in. Whether we can store the data in our own database is still pending with Gravyty's legal team.

This decision is hard to reverse. Where profiles come from determines our database schema, how users are identified, and our sign-in flow, and every other part of the app (matching, the event questionnaire, saved connections) depends on those. Switching sources later would mean a data migration and reworking authentication, likely after real users have accounts. It also commits the team to a third party whose timeline we don't control.

The team wants to start building soon, and the schema and sign-in approach need to be settled first. If OSU's side takes months, that process needs to start now. If we do nothing, users create separate BeaverLink accounts and fill out profiles from scratch. That works, but the extra friction could keep people from signing up before an event, and BeaverLink would duplicate data the Alumni Association already has.

## Options

### Option A: Pull Profiles from the OSU Connections API

BeaverLink keeps its own user accounts, but when someone registers, the backend looks them up in OSU Connections by email through the Graduway API and imports their profile fields.

**Benefits:** Users skip some of the profile setup, and the data matches what the Alumni Association already maintains.

**Costs:** OSU has to set up API access, and we don't control how long that takes. Storing the data is still pending legal review. Email lookup can miss people, since OSU Connections accounts can use any email. Users without an OSU Connections profile need a fallback anyway.

**Right choice if:** OSU enables API access soon and legal approves storage.

### Option B: OSU SSO with BeaverLink Profiles

Users sign in with their OSU login, and BeaverLink stores its own profile data, entered by the user.

**Benefits:** No separate password, and identity is tied to a real OSU account.

**Costs:** It requires OSU IT approval to register the app, and most alumni no longer have an active OSU login. It also doesn't solve the profile data problem.

**Right choice if:** BeaverLink were for current students only.

### Option C: Auto-Fill Profiles from Resumes or LinkedIn Exports

Users upload a resume or their LinkedIn data export, and BeaverLink extracts the relevant fields for them to review.

**Benefits:** No dependency on Gravyty or OSU, and it works for anyone.

**Costs:** Parsing is error-prone, resumes hold more personal information than we need, and not everyone has a current resume on hand.

**Right choice if:** OSU Connections access falls through entirely.

### Option D: Hybrid with a Swappable Data Source

BeaverLink uses its own accounts and a profile schema we control. Profiles can be filled from more than one source: manual entry and resume parsing now, and the OSU Connections API once OSU enables it. Each source fills the same internal profile format.

**Benefits:** Development isn't blocked on OSU, and we can add the API later without changing the schema or sign-in. It can also offer Google and LinkedIn sign-in, matching OSU Connections.

**Costs:** It's more upfront design work, since each source needs a mapping layer. We might build parts we never use if the API never comes through.

**Right choice if:** API access is likely but its timeline is uncertain, which is our situation now.

### Option E: Do Nothing (Standalone Accounts, Manual Profiles)

Users create a BeaverLink account and fill out their profile and event questionnaire by hand, with no outside integrations.

**Benefits:** It's the simplest to build, with no third-party dependencies.

**Costs:** Signup friction could keep people from finishing profiles, which hurts match quality. Adding OSU Connections later would likely mean redesigning the schema.

**Right choice if:** The prototype only needs to prove the matching works.

## Analysis

**Dependency and timeline.** The biggest difference between options is what they wait on. Nikki confirmed that the Graduway API exists and Gravyty charges nothing extra, but OSU has to set up access (Gravyty email, Oct 22, 2026). The [Graduway API docs](https://apidoc.graduway.com/) show that access uses a single platform-level API key and platform ID, so whoever administers OSU Connections would likely need to enable it. If that's the Alumni Association, our partner's team may be able to do it directly. We haven't confirmed who that admin is. Options A and B can't be built or tested until OSU acts, while C, D, and E can start immediately. Any option that blocks on OSU puts the whole schedule at risk.

**Who can actually sign in.** BeaverLink needs alumni, since they're who students most want to meet. OSU-issued accounts don't last past graduation. ONID accounts stay active for only one year after graduation and are then deactivated and deleted ([OSU ONID account policy](https://oregonstate.teamdynamix.com/TDClient/KB/ArticleDet?ID=51559)). OSU Connections itself allows sign-up with any email, LinkedIn, or Google ([registration page](https://osuconnections.org/account/registration)). This rules out Option B as the main sign-in method. It also exposes a gap in Option A: the email a user gives BeaverLink may not match their OSU Connections account, so email lookup alone would miss people. Offering Google and LinkedIn sign-in would raise the match rate, but users would still need a way to confirm or link the right profile.

**Data quality.** The Graduway API is less useful for matching than we expected. Its user search endpoint returns name, email, phone, job title, company, affiliation, and a profile ID ([Graduway API docs](https://apidoc.graduway.com/)). Job function, industry, education, mentoring settings, and custom profile sections appear only in the update endpoint, not in search results, and there are no endpoints for groups or event registrations. Even with full access, Option A would tell us someone's job title and company, not their field, major, or whether they want to mentor. Those would still have to come from BeaverLink's own questionnaire. The documentation may not cover everything, so we plan to ask Gravyty whether these fields can be read.

**Security and privacy.** Every option stores personal information. A and D would hold data copied from OSU Connections, which depends on Gravyty's legal answer. Resumes contain more than we need, so we'd keep only the extracted fields. The Graduway API key is the bigger concern: the same key that reads profiles can update users, change their role to Admin, and delete them. It has to stay on the server, and we'd want to ask whether a read-only key is possible.

**Complexity, cost, and performance.** E is the simplest to build, and D takes the most upfront work because each source needs its own mapping. None of the options adds direct cost, since Gravyty charges nothing extra for the API. Performance is a minor factor: the API returns up to 500 users per request, so an import or live lookup at signup is fast for event-sized groups.

**Maintainability and reversibility.** This is where D stands out. A and B lock the schema and sign-in to one external system. If that system changes or access is revoked, the core of the app has to be redesigned. E is cheap now but expensive later, since adding OSU Connections would mean changing the schema after users exist. D costs more upfront because each source needs a mapping into our own profile format, but it turns the hard-to-reverse part, the schema and identity model, into something we control. The schema is decided once, and the sources stay reversible. The API's `?example=true` mode returns sample data without touching real records, so we can build and test the integration under D before OSU grants access.

**Uncertainty.** Three unknowns could change this analysis: whether OSU enables the API, whether Gravyty's legal team allows storing profile data, and which fields the API can read. If OSU says no, D still works with manual entry and resume parsing. If legal says we can't store data, the adapter can fetch profiles live instead of copying them.

## Recommendation and Verification Plan

I recommend **Option D: a hybrid with a swappable data source.** BeaverLink will use its own accounts, with Google and LinkedIn sign-in, and a profile schema the team controls. Profiles will be filled from manual entry and the event questionnaire first, with resume parsing as an optional shortcut. The OSU Connections API becomes an additional source once OSU enables access.

D is the only option that isn't blocked by OSU and still leaves room for the integration our partner wants. Since the API can't provide the fields matching depends on, our own questionnaire is needed under any option, and D builds around that instead of fighting it.

**How we'll know it worked:**

1. **Sources are swappable.** Each profile field records which source it came from. We'll build manual entry first, then a Graduway adapter tested against `?example=true`. *Passes if* adding the adapter requires no schema change or data migration.
2. **Adapter tests in CI.** Tests check that each adapter maps its source into our profile format, including missing and malformed fields. *Fails if* a mapping test breaks after a source changes.
3. **Signup is fast enough.** In usability testing with at least 5 users, *passes if* most complete their profile and questionnaire in under 5 minutes. If not, we prioritize resume parsing or the API.
4. **Profile matching works.** With real API access, we measure how often a BeaverLink email finds an OSU Connections profile. *If under about 70%,* we add a step for users to confirm or search for their own profile.
5. **The API key stays secret.** *Passes if* a secret scan in CI finds no key in the repo or frontend build.
6. **Resume data is minimized.** *Passes if* a test confirms the uploaded file is deleted after extraction.

**Triggers to revisit this decision:**

- If OSU hasn't enabled API access by the time we're building profile features, we continue without the adapter and tell our partner.
- If Gravyty's legal team says we can't store profile data, the adapter fetches profiles live instead.

## Constraints

**Data use and privacy.** Profile data copied from OSU Connections is the biggest constraint. Until Gravyty's legal team answers, we won't store real OSU Connections data. Student information connected to OSU may also fall under FERPA, so we'll confirm with our partner what counts as directory information before importing anything beyond name and job details. Users will consent before any profile data is pulled or matched.

**Third-party terms.** Using the Graduway API means following Gravyty's terms, which our partner's organization agrees to, not us. For LinkedIn, we'll only use [Sign In with LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2) and data exports users upload themselves, since LinkedIn's terms prohibit scraping profiles.

**Licensing.** We'll check the license of any resume parsing library before adopting it and avoid copyleft licenses unless our partner is fine with them.

**IP and confidentiality.** The project has no NDA. Our Team Charter permits sharing team-created documents, synthetic data, and public OSU information with AI tools, prohibits real student or alumni data unless separately authorized, never permits credentials, and requires explicit approval for nonpublic partner documents and meeting notes. Development will use synthetic profiles and the API's example mode, and the Graduway key stays out of AI tools and version control.

## Delegation and Validation

- **What I handed to AI tools.** I used Claude to help draft this RFC from my own research: my email exchange with Nikki at Gravyty that includes my questions and her answers, and our team's meeting notes. Claude also searched for supporting sources and summarized the Graduway API documentation after I pasted it in. I set the direction and approved each section before moving on.

- **What checks made that reasonable.** The main checks are human: every factual claim links to its source, the RFC gets two peer reviews and an instructor review, and the charter requires unanimous team approval for decisions involving authentication and personal data. In the repo today, CI runs `ruff` and `pytest` for the backend and `tsc`, lint, tests, and build for the frontend on every PR to `dev` and `main`, once those folders have code. Merging requires one approval and passing CI. The adapter tests and secret scanning in my verification plan don't exist yet.

- **Where I stopped and validated the result myself.** Several of Claude's first claims were guesses, and I corrected them. Claude assumed Graduway's SSO only covers logging into OSU Connections, which I changed to an open question. I checked the OSU Connections signup page myself and confirmed it accepts any email, LinkedIn, or Google. I read the Graduway API docs myself and confirmed the search endpoint returns job title and company but not job function or industry, which changed the analysis. Since this decision is hard to reverse, I opened each cited source to confirm the claims.

## Decision

Proposed. Because this decision involves authentication and personal data, our Team Charter requires unanimous team agreement, and it will be recorded in `docs/adr/`. The team will decide after peer review and after hearing back from Gravyty on storage and which profile fields the API can read, and from our partner on who administers OSU Connections and whether API access can be enabled.