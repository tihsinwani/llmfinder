# LLM Finder

LLM Finder is an interactive static web app that helps teams choose the right LLM for a specific workload.
It supports both **open-source** and **closed-source** model options and now uses a guided multiple-choice Q&A flow.

## What this app does

- Runs an interactive recommendation wizard with multiple-choice questions.
- Scores and ranks models based on workload, deployment preference, privacy constraints, context needs, budget, and latency goals.
- Shows recommendations with plain-English rationale.
- Maintains a live-updating model index from `models.json` with auto-refresh.

## Current feature set

- Guided Q&A flow (6 questions) for more structured recommendations.
- Recommendation cards with score, reasons, and cost/deployment context.
- Live model feed behavior:
  - auto refresh every 15 minutes,
  - manual refresh button,
  - fallback to embedded catalog if feed fetch fails.
- Responsive modern UI suitable for GitHub Pages.

## Project structure

- `index.html` — interactive layout (hero, Q&A wizard, recommendations, live table).
- `styles.css` — modern dark UI theme and responsive styling.
- `script.js` — questionnaire engine, ranking/scoring logic, and model feed refresh logic.
- `models.json` — model catalog feed source used by the app.
- `ARCHITECTURE.md` — detailed architecture and data flow.
- `.github/workflows/deploy-pages.yml` — automatic GitHub Pages deployment.

## Quick start

### Run locally

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

### Validate JavaScript syntax

```bash
node --check script.js
```

## Keep model data up to date

To keep recommendations current with new model launches:

1. Add/update entries in `models.json`.
2. Commit and push changes.
3. GitHub Pages redeploys and the app starts serving updated feed data.

The UI fetches the model feed with cache-busting and periodically refreshes without needing a page reload.

## Deployment

This repository includes a GitHub Actions workflow that publishes to GitHub Pages.

1. Push this repository to GitHub.
2. In repository settings, go to **Pages**.
3. Set **Build and deployment** source to **GitHub Actions**.
4. Push to `main` to deploy updates.

## Notes

- Data in `models.json` should be treated as curated snapshots.
- Recommendations are heuristic and should be validated against your own prompts/tasks before production rollout.
