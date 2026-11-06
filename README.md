# BeaverLink

BeaverLink recommends who OSU students and alumni should meet at OSU Alumni Association networking events, and explains why each match makes sense.

Status: backend scaffold only (`GET /health`). See [docs/requirements.md](docs/requirements.md) and [docs/design.md](docs/design.md).

## Quickstart

Needs Git and Python 3.10 or newer.

```bash
git clone https://github.com/Splash791/beaverlink.git
cd beaverlink/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the tests and lint (the same checks CI runs):

```bash
pytest
ruff check .
ruff format --check .
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Then open http://127.0.0.1:8000/health. It should show `{"status":"ok"}`.

## Local database

Needs Docker and Node.js. From the repo root:

```bash
npx supabase start
```

This runs PostgreSQL 17 in Docker at `postgresql://postgres:postgres@127.0.0.1:54322/postgres`. Stop it with `npx supabase stop`.

## Docs

- [Requirements](docs/requirements.md)
- [Design](docs/design.md)
- [Risks](docs/risks.md)
- [Contributing](CONTRIBUTING.md)
