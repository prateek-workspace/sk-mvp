# sk-prephub Backend (FastAPI) — Quick start

This folder contains a minimal FastAPI scaffold to get development started.

Quick start (development)

1. Create a Python virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy the env example and edit values:

```bash
cp .env.example .env
# edit .env
```

3. Run the app with uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

The server exposes a health endpoint at `/api/v1/health`.

Next steps

- Implement DB models in `app/db/models.py` (or generate from your Supabase migrations).
- Add auth dependency to validate Supabase JWTs in `app/deps.py`.
- Scaffold `app/api/v1` modules following `roadmap.md`.
