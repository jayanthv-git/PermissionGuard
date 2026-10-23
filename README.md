# PermissionGuard

PermissionGuard is a local full-stack demonstration of agent action policy checks, human approval, and audit history. The React interface calls a Python FastAPI service. The service evaluates requests and stores policies, requests, approvals, and audit entries in SQLite so they survive page reloads and app restarts.

The service is intentionally bound to `127.0.0.1`. It has no login or external action adapters: it does not send email, change IAM roles, mutate external databases, or execute commands. Treat it as a local hackathon prototype, not a production security gateway.

## Start the full app

Requirements: Node.js 18+, npm, and Python 3.10+.

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install -r permissionguard-requirements.txt
npm run dev
```

`npm run dev` starts the API on `http://127.0.0.1:8010` and the website on the Vite address printed in Terminal, usually `http://127.0.0.1:5173/`. Keep that Terminal window open. Press Control+C to stop both.

The first backend start seeds the local database from `permissionguard_seed.json`. SQLite data is saved in `permissionguard.sqlite3`. Use **Settings → Reset Demo Data** to restore the original sample records. To use a different database file, set `PERMISSIONGUARD_DB` before starting the app.

API documentation is available at `http://127.0.0.1:8010/docs`; the health endpoint identifies the service as PermissionGuard.

## What is connected

- The frontend loads agents, policies, requests, approvals, audit events, metrics, and activity from the API.
- The API evaluates proposed actions, creates pending approvals when required, and records every evaluation in the audit history.
- Policy enable/disable changes, human approval/denial, and demo reset are written transactionally to SQLite.
- The frontend refreshes server state after changes and polls for updates every five seconds.
- The live health check distinguishes this PermissionGuard API from the older GestureLink API.

## Current limits

- This is a local-only demo. It has no authentication, multi-user identity, role enforcement for reviewers, TLS, deployment configuration, or external policy-enforcement middleware.
- Policy behavior is implemented explicitly in `permissionguard_api.py`. The conditions shown in the policy UI are descriptive and are not parsed as a general-purpose policy language.
- Approving a request changes its authorization decision and writes an audit record. It does not issue an authorization token or perform the requested operation.
- Initial records are fictional seed data. Metrics and activity counts include those seed records until the demo data is reset.

## Older GestureLink project files

This folder retains the separate GestureLink AI backend and model files (`app.py`, gesture data/model files, and `README_GestureLink_legacy.md`). The PermissionGuard launcher does not start that service, load its model, connect to MQTT, or control hardware.
