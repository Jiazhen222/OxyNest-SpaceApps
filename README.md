# OxyNest Research

**Build Life Beyond Earth.** Previously named Beyond Earth: Settler.

This repository publishes the initial OxyNest research datasets, supplied source references and local data-validation tools. It contains no playable game, B gameplay implementation, game assets, later integration code or deployment workflow.

**Research snapshot recorded:** November 4, 2026. **Publication:** November 14, 2026. The publication date is not the project start date. Later gameplay work is outside this repository's current scope; this is a selected research release, not a complete chronological history of all project work.

## Contents

| Dataset | Research topic |
| --- | --- |
| `data/alarms.json` | Proposed alert metrics and game thresholds |
| `data/consumption.json` | Crew consumption context and resource assumptions |
| `data/destinations.json` | Moon and Mars reference content |
| `data/failure_chains.json` | Proposed causal chains and game outcomes |
| `data/modules.json` | Habitat and life-support module concepts |
| `data/quiz.json` | Initial educational questions |
| `data/recipes.json` | Proposed processing inputs and outputs |
| `data/wheel.json` | Proposed event content and effects |
| `data/reality_vs_game.json` | Distinctions between reference context and game assumptions |

These are the earlier source datasets, not the versions later adapted for a game engine. Source-localized fields remain preserved. The public documentation is in English, and the optional projection tool generates English JSON without altering the supplied source files.

`docs/SOURCE_LINKS.md` lists 29 distinct supplied reference links. `docs/SOURCE_MANIFEST.json` records hashes and the original local research revision. `docs/DATA_REVIEW.md` is the historical review accompanying that snapshot; its references to missing gameplay contracts describe the research stage, not the status of other project versions.

`data.html` is a plain research inventory prepared for this publication. It contains links to the datasets, with no gameplay, scripts or scientific-value dashboard.

## Run local checks

Use Node.js 24 or later. No third-party npm packages are required.

```sh
npm test
node tools/check-data.js
node tools/check-structure.cjs
npm run prepare:data
```

The research regression suite passes **nine tests**. The parsing/source-format stage reports **9/9 JSON files** and **65/65 NASA-domain-formatted source fields**. That is URL-format checking, not source-content verification.

The supplemental structure check intentionally remains **nonzero** for an unresolved initial reference: `chain_food_starvation_collapse` uses `food_days_left` without a declared metric contract. Accordingly, `npm run check:data` exits 1. No threshold or engine alias has been invented to make this historical snapshot appear fully integrated.

`npm run prepare:data` writes nine English projections under ignored `runtime/data/`. IDs, numerical parameters, source URLs and ordering are preserved. These generated files are not a game build.

## Research limits

Supplied citations, classification labels and `last_verified` dates are source-author assertions that still require review. This publication does not verify scientific values, current source availability, NASA hardware performance, gameplay behavior or release eligibility.

Processing yields, rewards, construction costs, timing and event effects include game-design assumptions. Scientific context must be distinguished from those assumptions before using the data in a learning experience. See `docs/DATA_REVIEW.md` and `docs/VALIDATION_STATUS.md`.

NASA references are provided for education. OxyNest is an independent student project and is not endorsed by NASA. No website deployment, collaborator invitation or final submission is included in this release.

Repository: https://github.com/Jiazhen222/OxyNest-SpaceApps
