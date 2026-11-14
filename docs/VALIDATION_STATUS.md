# Initial Research Validation Status

Publication prepared on November 14, 2026 from the research revision recorded on November 4, 2026. The scope is research data and validation tooling only.

## Executed checks

| Check | Result |
| --- | --- |
| `npm test` | Nine passed, zero failed |
| `node tools/check-data.js` | Exit 0; nine JSON files parsed; 65 of 65 supplied source fields use an accepted NASA HTTPS hostname |
| `node tools/check-structure.cjs` | Exit 1; unresolved `food_days_left` metric in the initial food chain |
| `npm run prepare:data` | Nine English projections generated successfully |
| Initial-source integrity | All 17 exported data, tooling, test and configuration/review files match their recorded source revision hashes |
| Limited sensitive-data scan | No matched GitHub token, AWS access-key, private-key-header or common personal-email patterns in the selected files |

The test suite checks data projection and validator behavior, including malformed input and broken references. A passing regression suite does not mean the supplied data is scientifically verified or free of integration issues. The supplemental check's unresolved reference is a known expected result, rather than a passing integration claim.

## Publication boundaries

The dataset values and exported tools come from local revision `821c94b`, authored and committed November 4, 2026. That revision predates the received November 11 gameplay handoff. Hashes are in SOURCE_MANIFEST.json. The source manifest is provenance for a selected export; the full private Git history is not included.

The README, source-link inventory, this status note, package metadata and plain HTML research index were prepared for the November 14 public release. They are not represented as files created on November 4. No commit timestamp has been backdated.

Excluded: B gameplay code, browser game entry, simulation engine, UI assets, balance files from later gameplay versions, the Kids game, management economy, saves, ZIP distributions, screenshots, original handoff archives, private Drive folder references and local computer paths. This repository's history therefore does not represent the full OxyNest project history.

No final-code security audit, playable-game test or source-content/scientific review was performed for this research-only release. Later game-test counts are deliberately not carried into this repository.
