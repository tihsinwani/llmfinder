# LLM Finder Architecture

## 1) System overview

LLM Finder is a **client-only static application**.

- Runtime: browser
- Hosting target: GitHub Pages (or any static host)
- Backend/database: none

The app uses a guided Q&A interface and a refreshable JSON model feed for near-real-time catalog updates after repository changes are deployed.

## 2) Architecture style

The app follows modular-in-file organization:

- **Data layer**: `models.json` feed + fallback in-memory dataset in `script.js`.
- **Domain logic layer**: scoring and ranking functions.
- **Presentation layer**: Q&A UI, recommendation cards, model table rendering.
- **Interaction layer**: quiz navigation and model feed refresh events.

## 3) Primary modules

### `index.html`

Defines:
- hero and model feed status badges,
- multiple-choice questionnaire section,
- recommendations section,
- model index table.

### `styles.css`

Defines:
- modern dark visual design with gradient background,
- interactive option cards and action controls,
- responsive behavior for questionnaire and table layout.

### `script.js`

Contains:
- fallback model dataset,
- quiz question configuration,
- scoring helpers (`avgPrice`, `normalizedCost`, `modelScore`),
- quiz renderer and navigation,
- recommendation generation,
- model feed refresh logic (auto + manual).

### `models.json`

Provides:
- canonical model catalog loaded at runtime,
- lightweight feed format that can be updated independently of app logic.

## 4) Data model

Each model entry uses flat fields:

- `name`
- `type` (`open` or `closed`)
- `provider`
- `contextK`
- `mmlu`
- `gsm8k`
- `humaneval`
- `inputPerMillion`
- `outputPerMillion`
- `strengths[]`

## 5) Recommendation pipeline

1. User answers a 6-step multiple-choice Q&A.
2. Answers are converted into recommendation constraints/preferences.
3. Candidate models are filtered by deployment, privacy, and context requirements.
4. Candidates are scored via benchmark + cost + fit + latency preferences.
5. Top 5 models are rendered with rationale.

## 6) Live feed update flow

1. App starts and requests `models.json` with cache-busting.
2. If fetch succeeds, table and ranking source update to feed data.
3. If fetch fails, app falls back to embedded catalog.
4. Auto-refresh runs every 15 minutes.
5. User can trigger immediate refresh from the UI.

## 7) Non-functional characteristics

### Performance
- Small dataset and O(n log n) ranking over current catalog size.

### Reliability
- No backend dependencies.
- Graceful fallback when feed retrieval fails.

### Security
- No secrets or server-side runtime.
- Static hosting minimizes attack surface.

## 8) Extension plan

To move toward continuous model freshness:

1. Add scheduled workflow to update `models.json` from trusted sources.
2. Attach source links + timestamp metadata per model.
3. Add user-facing filter controls for region/compliance/licensing.
4. Persist user sessions/preferences locally.
