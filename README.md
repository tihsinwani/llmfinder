# LLM Finder

LLM Finder is a lightweight, static web app that helps developers choose the right LLM for a specific workload.
It indexes both **open-source** and **closed-source** models, compares benchmark snapshots, and returns ranked recommendations based on constraints.

The app is intentionally built as plain HTML/CSS/JavaScript so it can run on **GitHub Pages** with no backend.

## What this app does

- Maintains a curated model index with benchmark and pricing signals.
- Lets users filter by:
  - primary use case,
  - deployment preference (open/closed/any),
  - minimum context window,
  - budget.
- Scores models and returns the top recommendations with plain-English rationale.

## Current feature set

- Model index table with:
  - model/provider/type,
  - context window,
  - MMLU, GSM8K, HumanEval snapshots,
  - cost view (API estimate for closed models, self-hosted note for open models).
- Recommendation engine with use-case weighting and cost-awareness.
- Static frontend suitable for local hosting or GitHub Pages.

## Project structure

- `index.html` — page layout and semantic sections.
- `styles.css` — styling and responsive layout.
- `script.js` — model data, scoring logic, filter logic, and DOM rendering.
- `ARCHITECTURE.md` — detailed architecture and data flow.

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

## Deploy to GitHub Pages

Because this is a static app, deployment is straightforward:

1. Push this repository to GitHub.
2. In GitHub repository settings, enable **Pages**.
3. Set source to the default branch root (or `/docs` if you choose to relocate files).
4. Save and use the generated GitHub Pages URL.

## Recommendation approach (high-level)

Each model receives a composite score from:

- benchmark signals (MMLU, GSM8K, HumanEval),
- use-case-specific weight profile,
- cost normalization against budget,
- fit bonuses for matching declared strengths.

The app ranks candidates and displays the top 5.

## Notes on benchmark/cost data

- Values in `script.js` are curated snapshots for decision support and UI demonstration.
- Real-world performance can vary by prompt design, eval methodology, provider updates, and deployment setup.
- Treat recommendations as a **starting point**, then validate with your own workload tests.

## Suggested next improvements

- Add benchmark source links and update timestamps per model.
- Add side-by-side model comparison and sorting controls.
- Add export/import of model catalogs (JSON).
- Add scenario presets (agentic coding, RAG-heavy QA, multilingual support, etc.).

