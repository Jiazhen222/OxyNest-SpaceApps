# Kids Integration QA Report

Date: November 13, 2026. Scope: the active kids/ source and its generated desktop game. Windows, Node.js 24.16.0 and isolated headless Edge 157.0.4341.46. These results supersede the earlier simulation's report for the active entry.

## Executed results

| Check | Observed result |
| --- | --- |
| Node tests | 81 passed, zero failed: 76 preserved simulation/tooling regressions and five dedicated Kids tests |
| Kids static checks | 515 matching text keys in each language; 16 choices; 16 cards; zero errors or warnings; supplied font subset covers UI text |
| Build | Active Kids HTML, CSS, JavaScript and local fonts copied into dist; old source, archives and developer documents excluded |
| Browser checks | 12 checks passed under a repository subpath; see runtime/browser-smoke-report.json |
| Browser errors and requests | Zero captured errors, failed requests or requests outside the local origin in the exercised flow |
| Legacy UI contract | Preserved November 12 index passes the separate v0.10.0 hook check |
| Desktop layout | No page-level horizontal overflow at 1440, 1280 and 1024 pixels; initial desktop play view visually inspected |

The Kids tests cover valid preferences and save loading, corrupt/oversized/incompatible saves, failure recovery without resource rollback, safe source links and fixed age-level settings. The previous 76 tests must not be described as 76 tests of the new gameplay.

## Browser behavior exercised

The run starts from a clean isolated profile, switches languages, reloads preferences, normalizes a nickname and enters Explorer. It makes one wrong dust choice, checks the survival reduction and retry, then completes the first mission through visible controls. It leaves after a rewarded answer and during battery construction, resumes, and verifies that rewards and building costs are not duplicated. It reopens a completed summary and checks that no extra badge is granted.

The same run completes all four Explorer missions, including suit-air guidance, night, ice mining, air leak, both processing recipes, greenhouse, storm, meteorites, oxygen and the final solar choice. It uses the real engine/UI and real clicks, with known correct answers as test oracles. No injected resources are used to complete those missions.

A separate zero-survival save fixture verifies MISSION FAILED, Quit returning to the menu, failure remaining recoverable on re-entry, and Try again preserving buildings, rocks, ice and cards. Engineer and Commander initialize with their own settings. Chinese language and bundled font loading pass. An incompatible save fixture safely starts a new game.

## Integration fixes verified or reviewed

- Retry now restores reserve meters and preserves the current base instead of loading B's earlier session snapshot.
- Construction and upgrades commit a single purchase before their visual countdown; interruption cannot discard its payment.
- Choice markers prevent a completed guided answer from paying twice. Event markers guard repeated guided start/end effects.
- Summary badges are not repeated simply by reopening a completed summary.
- Save validation and safe link handling reject malformed values and executable schemes.
- Nickname, Quit and the stats row no longer overlap in the inspected desktop view.
- The last rock spot checks suit air before automatic return, so the safe-return lesson is not bypassed by completing the pile.

## Limits and remaining review

Engineer and Commander were initialized and their settings checked; their complete campaigns, event timeout/pause interaction and every Commander chain were not executed in this browser run. All free-build combinations, removals/upgrades and every possible interruption boundary were not exhaustively tested. The upgrade transaction was code-reviewed but its interruption did not receive a dedicated end-to-end scenario in this run.

Actual child usability, the three-second comprehension target, reading level, accessibility with assistive technology, other browsers and real mobile devices remain unverified. Mobile-specific optimization was deferred. The interface supports storage failure reporting, but storage denial was not exercised by this browser run. File URL play is supported by the static architecture; the recorded browser checks used local HTTP.

Fourteen cards have team-supplied source links and two have placeholders. Static checks verify selected references and link format, not source content, scientific accuracy or NASA endorsement. The active meters and numbers are simplified game rules. D's content approval and a release review remain open. The legacy parameter gate remains blocked and is not a scientific audit of the Kids version.

Original B ZIPs and extracted originals remain preserved with receipt hashes. No GitHub commit/push, public repository, deployment, submission or presentation recording was made in this pass.

## Latest mining and progression pass

The current build removes all audio controls and audio script loading, adds pre-action resource explanations and a separate visible help panel, adds three unlockable mining sites and three tool upgrade tracks, and records an explicit four-mission campaign finish. See PLAY_UPDATE_2026-11-13.md. The combined suite passes 85 tests (76 legacy and nine Kids/progression tests). Sixteen final browser checks pass with zero errors, failed requests or external requests. The browser also bought a drill through the workshop in a seeded free-play fixture, chose the ridge, broke a harder deposit in two clicks and returned its five-rock yield. This is distinct from the four campaign missions completed without injected resources. Existing limits on full Engineer/Commander campaigns and real-child usability remain.

## Autonomous settlement revision

The default mode now supports free building, duplicate facilities, production and collection, chosen supply orders, warehouse resupply, plot moves and outpost expansion. Guided saves and settlement saves are separate. The combined Node suite passes 93 tests, including eight dedicated economy tests. Eight autonomous browser checks and the separate 16 guided checks pass. The browser expansion milestone uses a labeled stocked fixture; a separate pure economy test proves reachability from starting resources and permitted mining hauls. New job and delivery IDs protect against duplicate collection/replay, and stored job recipes are checked against their building. No cloud service or automatic upload is added. See SETTLEMENT_MODE_2026-11-13.md for rules and limits.
