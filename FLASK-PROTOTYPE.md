# Earlier Flask prototype

The `backend/`, `frontend/`, and `tests/` directories preserve the earlier
PermissionGuard Flask + React prototype. They are independent of the current
FastAPI application described in the main README. Both simulate policy decisions;
this prototype does not execute proposed actions and keeps records in memory.

From the repository root, install the backend dependencies and start Flask:

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python backend/app.py
```

In another terminal, start the prototype frontend:

```sh
cd frontend
npm ci
npm run dev
```

The prototype API listens on `127.0.0.1:5000`; use the frontend at
`http://localhost:5173`. Run one frontend at a time to avoid port conflicts.

Checks from the repository root:

```sh
backend/.venv/bin/python -m pytest tests -q
npm --prefix frontend run build
npm --prefix frontend run lint
```

All five existing policy tests, the frontend build, and lint passed when this
previously uncommitted prototype was preserved on 2026-11-15.
