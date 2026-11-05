# BeaverLink

BeaverLink recommends who OSU students and alumni should meet at OSU Alumni Association networking events, and explains why each match makes sense.

Status: backend scaffold (`GET /health`) plus a front-end-only demo login (no real authentication yet). See [docs/requirements.md](docs/requirements.md) and [docs/design.md](docs/design.md).

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

## Frontend

A Vite + React + TypeScript demo with a front-end-only login (no backend integration). Needs Node 22 or newer.

```bash
cd frontend
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

Demo accounts (password `demo1234` for all):

- `student@oregonstate.edu` — student
- `alumni@oregonstate.edu` — alumnus
- `organizer@oregonstate.edu` — event organizer (admin)

Checks (the same ones CI runs):

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

> Demo auth only. Accounts live in `src/auth/demoUsers.ts` with a plaintext
> password and must be replaced with real authentication before any real use.

## Docs

- [Requirements](docs/requirements.md)
- [Design](docs/design.md)
- [Risks](docs/risks.md)
- [Contributing](CONTRIBUTING.md)
