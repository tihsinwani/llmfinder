# LLM Finder Architecture

## Overview

LLM Finder is a client-side static web app.

- Runtime: browser
- UI: HTML/CSS/vanilla JavaScript
- Hosting: GitHub Pages
- Backend: none (current version)

## Main modules

- `index.html`
  - Q&A wizard section
  - manual controls section
  - recommendations section
  - model index table
- `script.js`
  - seed model catalog
  - live model sync function
  - questionnaire state and rendering
  - scoring and recommendation pipeline
- `styles.css`
  - layout and component styling

## Recommendation flow

1. User answers multiple-choice Q&A or uses manual filters.
2. App builds profile constraints (use case, deployment, context, budget).
3. App filters the active model catalog.
4. App scores each candidate using weighted benchmark + cost + fit bonuses.
5. App renders top ranked recommendations.

## Live update flow

1. App loads with built-in seed catalog.
2. App requests `https://openrouter.ai/api/v1/models`.
3. Returned live models are normalized to the internal schema.
4. Live list is merged with seed list (de-duplicated by model name).
5. UI updates sync status + model table.

If live sync fails, app continues with seed data and remains usable.

## Data schema (normalized)

- `name`
- `type` (`open` | `closed`)
- `provider`
- `contextK`
- `mmlu`
- `gsm8k`
- `humaneval`
- `inputPerMillion`
- `outputPerMillion`
- `strengths[]`
- `source` (`seed` | `live`)

## Limitation and production recommendation

A browser-only live fetch is best-effort (network/CORS/provider availability).
For truly "always updated" data:

- introduce scheduled ingestion (GitHub Action cron or backend job),
- persist model snapshots in repo/object storage,
- serve stable JSON to the frontend.

