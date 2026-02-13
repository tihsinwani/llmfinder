# LLM Finder

LLM Finder is an interactive model advisor that helps developers choose the right LLM using:

- a multiple-choice Q&A wizard,
- manual filters,
- benchmark + cost-aware ranking,
- and a live model catalog refresh.

## Key capabilities

- **Interactive questionnaire**: users answer step-by-step multiple-choice questions and get model recommendations.
- **Manual override controls**: use case, deployment type, context length, budget.
- **Hybrid catalog**:
  - built-in curated seed models for stable baseline behavior,
  - optional live refresh from OpenRouter model catalog for newly launched models.
- **Ranking output**: top 5 model recommendations with rationale and score.

## Project structure

- `index.html` — app layout, Q&A wizard, control panel, recommendation panel, model table.
- `styles.css` — responsive styles for cards, wizard options, controls, and data table.
- `script.js` — model dataset, live sync, Q&A state machine, and recommendation logic.
- `ARCHITECTURE.md` — architecture, data flow, and live-sync design notes.
- `.github/workflows/deploy-pages.yml` — GitHub Pages deployment workflow.

## Local run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Validation

```bash
node --check script.js
```

## GitHub Pages deployment

1. Push repository to GitHub.
2. In **Settings → Pages**, choose **GitHub Actions** as source.
3. Push to `main`, `master`, or `work` (as configured in workflow).
4. Open `https://<username>.github.io/<repo>/`.

## Live model updates (important)

- The app tries to fetch live model metadata from `https://openrouter.ai/api/v1/models`.
- If live fetch fails (network/CORS/rate limit), the app falls back to the built-in seed catalog.
- For production-grade "always up-to-date" behavior, add a scheduled backend job that snapshots providers into a versioned JSON artifact and serves that reliably.

