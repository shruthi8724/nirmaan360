# Contributing

Thanks for helping improve Nirman360. Keep changes focused, describe user-visible behavior, and avoid committing credentials, local databases, or generated build output.

## Set up the project

Follow the [local setup instructions](README.md#run-locally) to run the API and frontend.

## Before opening a pull request

Run the frontend production build:

```powershell
cd frontend
npm ci
npm run build
```

Check Python syntax:

```powershell
cd backend
python -m compileall -q .
```

Include a clear summary, verification steps, and screenshots for visual changes. Call out database schema or API changes and any configuration required to use them.

## Reporting issues

Use the GitHub issue templates for bug reports and feature requests. For security-sensitive reports, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
