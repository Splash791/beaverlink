# Contributing to BeaverLink

## Development setup

Follow the README.md quickstart first. Beyond it:

- The backend virtual environment lives in `backend/.venv` (gitignored).
- No environment variables or local services are needed yet. When they are, list them here and add a `.env.example`; never commit `.env`.
- Use fake seed data only. Profiles are real people's personal data.

## Local checks

Run these in `backend/` before opening a PR. CI runs the same commands.

- Tests: `pytest`
- Lint: `ruff check .`
- Format: `ruff format .` (CI runs `ruff format --check .`)

## Branches and commits

- The default branch is `main`. Feature work branches off `dev` and PRs back into `dev`.
- Name branches `<type>/<short-description>` (`feat/`, `fix/`, `chore/`, `docs/`), e.g. `feat/match-scoring`.
- Commits use the matching prefix and say what changed and why, e.g. `feat: add match scoring for event surveys`.
- `dev` merges into `main` by PR once `dev` is validated and reviewed.
- No direct pushes or force-pushes to `dev` or `main`.

## Pull requests and review

- Every PR links its GitHub Projects item.
- Say somewhere on your PR that you manually reviewed and tested the code, on top of any agent validating it.
- One approval to merge. CI must pass. If it fails and you have a reason to merge anyway, put the reason at the top of the PR description.
- Review a requested PR within 3 days. Check open PRs daily, and ping in Discord if yours is waiting.
- Prefix optional suggestions with `nit:`. Everything else blocks merge.
- Squash-merge a PR with many commits for one change. A PR with a handful of clear commits can use a regular merge.

## Definition of Done

- Meets the Projects item's acceptance criteria.
- Tested manually; CI passes or the failure is justified in the PR.
- Reviewed, approved, and merged into `dev`.
- Docs in `docs/` updated in the same PR if behavior changed.
- No secrets or real personal data in the diff.

## Where other work lives

- Tasks and sprint items: the team's GitHub Projects board.
- Non-code work (assignments, notes, charter, retrospectives): the shared CS46x team folder in Google Drive. A designated teammate accepts it and submits it to Canvas when an assignment needs it.

## Contribution norms

- Blocked or behind? Say so in Discord the same day.
- You own AI-generated code in your PR the same as code you typed.

## Getting help

- Ask in the team Discord. Expect a reply within 24 hours on weekdays.
- Weekend replies are not required, but help when work is due is appreciated, and the team covers for anyone unavailable.
- Scope questions go to the project partner.
