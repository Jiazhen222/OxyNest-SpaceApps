# OxyNest

**Build Life Beyond Earth.**

A desktop educational Moon base-building game designed for ages 5–12. The current version combines autonomous settlement management with optional guided missions. English and Chinese are supported. There is no background music, account, backend or player analytics service. Progress is stored in the current browser.

## Play locally

Download and extract this repository, then open `game/index.html` in a desktop browser. Choose **Build my base** for autonomous management or **Guided missions** for the step-by-step campaign. These modes save separately. Use **Quit** to return to the menu.

For development, use Node.js 24 or later. No npm packages are required:

```sh
npm test
npm run build
npm start
```

Open the localhost address printed by the server. Browser saves are specific to their origin; opening the file directly and using localhost can show different saves.

## Build your settlement

Gather rocks and ice, choose among eight facility types, and manage six building plots. Start production, collect finished supplies, use them for your crew or fulfil fictional supply orders. Move buildings, upgrade facilities and earn credits for expansion. Production uses short game timers and does not impose an offline resource penalty.

Establish your outpost by reaching level three, completing six deliveries and producing at least six packaged supplies. You may keep building afterward. Resource explanations and an optional Knowledge book support learning. Guided missions retain questions and decision-based events. See [how to play](docs/KIDS_HOW_TO_PLAY.md) and [settlement rules](docs/SETTLEMENT_MODE_2026-11-13.md).

## Source layout

- `game/`: current integrated source, local fonts and content-checking tools.
- `tests/`: game-state, progression, economy, publication-integrity and historical research tests.
- `tools/`: local build/server, browser checks and research validators.
- `data/`: the preserved initial nine-dataset research snapshot; these files are historical references and are not loaded by the current game. Current playable rules and learning text are in `game/js/`.
- `docs/`: gameplay, source records, historical delivery notes and review limits.
- `dist/`: ignored generated playable build.

The original B delivery remains available in commit `e55dbbcdbb272dfb590db81d5eaf1924b44d2364`. `docs/GAME_SOURCE_MANIFEST.json` describes that historical delivery. `docs/CURRENT_GAME_MANIFEST.json` records the current source hashes. Later integration is explicitly a modification of B's delivery, not an unchanged original.

## Validation and limitations

The publication suite passes 32 Node tests, including eight economy tests. `npm run check:game` checks local text, references and font coverage; it does not verify scientific claims. Browser checks are available through `npm run test:colony` and `npm run test:browser`; see [current publication notes](docs/CURRENT_RELEASE.md) for results and scope.

Fourteen learning cards contain team-supplied NASA references; two retain fact placeholders. Scientific wording and remaining placeholders require review. Costs, yields, meters, rewards and timers are simplified game rules, not validated lunar equipment performance. Real-child usability and retention have not been established. Mobile-specific optimization remains outside this release.

The historical research structure check still reports an undeclared `food_days_left` metric, so `npm run check:data` exits nonzero. This historical dataset issue is separate from the current game build. The source-domain checks do not verify source content or scientific values. See `docs/DATA_REVIEW.md` and `docs/VALIDATION_STATUS.md`.

## Credits and publication

See [CREDITS.md](CREDITS.md) and `project-metadata.json` for tools and AI assistance. NASA resources provide educational context. OxyNest is an independent student project and is not endorsed by NASA.

Research preparation was recorded on November 4, 2026; the original B Kids handoff was received November 13; public updates began November 14. Publication dates are not claims about when development began.

Repository: https://github.com/Jiazhen222/OxyNest-SpaceApps

No GitHub Pages deployment or final challenge submission is included. There is currently no live game URL recorded for this repository.
