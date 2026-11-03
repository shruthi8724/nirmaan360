# Nirman360

Nirman360 is a construction project operations and risk-intelligence prototype. It brings project, material, resource, alert, analytics, and explainable rule-based risk data into one web dashboard.

> **Prototype status:** This repository contains a working web prototype, not a production-ready construction platform. The presentation also outlines future ideas such as a field mobile app, real-time updates, and machine-learning predictions; those are not implemented in this codebase.

## Demo

The screenshot below shows the dashboard with the application's built-in demo records, not live site data. The local SQLite database itself is excluded from Git and is not included here.

![Nirman360 dashboard showing project KPIs, project progress, and risk signals](docs/screenshots/dashboard.png)

## What is included

- Portfolio dashboard, project list, project details, and analytics views.
- Create, view, update, and delete workflows for projects, materials, and resources.
- Risk overview and per-project risk reevaluation using the backend's rule-based engine.
- Alerts and seeded India-focused construction demo data.
- FastAPI REST API with interactive OpenAPI documentation.
- SQLite by default, with PostgreSQL supported through `DATABASE_URL`.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy.
- **Database:** SQLite by default; PostgreSQL is optional.

## Requirements

- Python 3.10 or later.
- Node.js 20 or later and npm.

## Run locally

Open two terminals from the repository root.

### 1. Start the API

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The API is available at <http://127.0.0.1:8000>. Interactive API docs are at <http://127.0.0.1:8000/docs>, and the health check is at <http://127.0.0.1:8000/api/health>.

The app uses `sqlite:///./nirman360.db` when `DATABASE_URL` is not set. To use PostgreSQL, install the included driver and set the environment variable before starting the API:

```powershell
$env:DATABASE_URL = "postgresql+psycopg2://user:password@localhost:5432/nirman360"
```

Tables are created at startup. Demo data is inserted automatically when the database has no projects.

### 2. Start the frontend

```powershell
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` requests to the local API at `http://127.0.0.1:8000`.

### Production frontend build

```powershell
cd frontend
npm ci
npm run build
```

The generated site is written to `frontend/dist`. A production deployment must route `/api` requests to the FastAPI service; the Vite development proxy is not a production API gateway.

## API overview

| Area | Routes |
| --- | --- |
| Projects | `/api/projects` |
| Materials | `/api/materials` |
| Resources | `/api/resources` |
| Risk intelligence | `/api/risk-intelligence/overview`, `/api/risk-intelligence/reevaluate/{project_id}` |
| Analytics | `/api/analytics/dashboard-summary`, `/api/analytics/charts`, `/api/analytics/overview` |
| Alerts | `/api/alerts` |
| Demo data | `/api/seed` |

Use `/docs` for request schemas, filters, and the complete endpoint list.

> **Warning:** `POST /api/seed` drops and recreates all database tables before inserting demo data. Do not call it against data you need to keep.

## Repository layout

```text
backend/       FastAPI application, SQLAlchemy models, routers, and risk engine
frontend/      React + TypeScript web application
.github/       GitHub Actions and contribution templates
```

## Development and security notes

- The current API is a prototype: it does not implement user authentication or authorization.
- The backend currently permits cross-origin requests for development. Restrict CORS origins before exposing it in a production environment.
- Use a production database, backups, secret management, HTTPS, and a migration strategy before production deployment.
- The bundled SQLite database is local runtime data and is excluded from Git. A new local database is created automatically.
- The risk engine is deterministic and rule-based; its outputs are decision-support signals, not professional or safety advice.

### Dependency audit

The frontend dependency audit on **November 3, 2026** reported **5 vulnerability findings** (4 moderate and 1 high) involving Vite, React Router, esbuild, and `postcss-selector-parser`. The production-only audit reported 2 moderate React Router findings. Fixes offered by the audit include major-version upgrades, so they should be applied with compatibility changes and a fresh build rather than blindly forced.

Recheck the current findings before publishing or deploying:

```powershell
cd frontend
npm audit
npm audit --omit=dev
```

These are development and dependency-chain risks; this prototype should not be exposed to untrusted networks or used with sensitive data until the findings are addressed and the security notes above are resolved.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and pull-request guidance. Please report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
