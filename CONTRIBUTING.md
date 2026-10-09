# Contributing to BeaverLink

## Setup and commands

TBD once the stack is picked. Owner: TBD

## Workflow

- Branch features off `dev` and PR them back into `dev`.
- Name branches `<type>/<short-description>` (`feat/`, `fix/`, `chore/`, `docs/`), e.g. `feat/match-scoring`. Commits use the matching `feat:`, `fix:`, `chore:` prefixes.
- `dev` merges into `main` by PR once `dev` is validated and reviewed.
- Every PR links its GitHub Projects item.
- No direct pushes to `dev` or `main`. One approval to merge.
- CI must pass. If it fails and you have a reason to merge anyway, put the reason at the top of the PR description.
- Just say somewhere on your PR that you manually reviewed and tested the code works on top of an agent validating it.

## Code review

- Review requested PRs in a timely manner.
- Prefix optional suggestions with `nit:`. Everything else blocks merge.
