# LLM Finder Architecture

## 1) System overview

LLM Finder is a **client-only static application**.

- Runtime: browser
- Hosting target: GitHub Pages (or any static host)
- Backend/database: none

This design keeps deployment simple, minimizes operational cost, and makes the app portable.

## 2) Architecture style

The app follows a small, modular-in-file architecture:

- **Data layer (in-memory)**: model catalog + use-case profiles in `script.js`.
- **Domain logic layer**: filtering and scoring functions.
- **Presentation layer**: DOM rendering to table and recommendation cards.
- **Interaction layer**: form inputs and button event handlers.

## 3) Primary modules

### `index.html`

Defines:
- filter controls,
- recommendations panel,
- model index table,
- script/style entry points.

### `styles.css`

Defines:
- visual theme tokens,
- responsive grid layout for controls,
- card/table styling.

### `script.js`

Contains:
- model dataset (`models`),
- use-case configs (`useCases`),
- scoring helpers (`avgPrice`, `normalizedCost`, `modelScore`),
- rendering functions (`renderTable`, recommendation rendering),
- user action wiring (recommend button click).

## 4) Data model

Each model entry uses a flat object shape:

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

Use-case profiles specify:

- `label`
- `weights` (MMLU/GSM8K/HumanEval/Cost)
- `key` (semantic strength tag)

## 5) Recommendation pipeline

1. Read user constraints from the UI.
2. Filter models by deployment and minimum context window.
3. Compute composite score for each remaining model.
4. Sort descending by score.
5. Return/display top N (currently 5).

### Scoring composition

- Benchmark subtotal from weighted MMLU, GSM8K, HumanEval.
- Cost score from budget-normalized cost estimate.
- Bonus if model strengths align with selected use case.
- Minor bonus for open-stack friendliness tags.

## 6) Rendering/data flow

- On load:
  - use-case options are generated dynamically,
  - model table is rendered from dataset.
- On recommend action:
  - filtered + ranked list is computed,
  - recommendations panel is re-rendered.

All state is ephemeral and held in memory.

## 7) Non-functional characteristics

### Performance

- Small dataset and O(n log n) ranking per interaction.
- Negligible CPU/memory footprint for current scale.

### Reliability

- No external runtime dependencies or network calls.
- Works offline once static assets are loaded.

### Security

- No auth, no secrets, no backend attack surface.
- Static hosting reduces operational risk surface.

## 8) Trade-offs

### Benefits

- Very easy deployment and maintenance.
- Fast iteration for UI/heuristic changes.
- No infrastructure required.

### Limitations

- Data is static and must be manually updated.
- No user accounts, persistence, or telemetry.
- Scoring is heuristic rather than learned/personalized.

## 9) Extension plan

To evolve toward production-grade model advisory:

1. Move model catalog to versioned JSON with metadata sources.
2. Add update pipeline (scheduled benchmark refresh).
3. Introduce backend API for larger catalogs and search.
4. Add evaluators for user-uploaded prompts/tasks.
5. Add model policy constraints (region, compliance, licensing).

