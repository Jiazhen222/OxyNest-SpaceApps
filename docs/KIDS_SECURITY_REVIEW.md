# Kids Code Security Review

Scope: the active November 13 Kids source, local fonts, browser storage and the local build/server. This is a scoped code review, not a security certification. The former simulation's review is historical and does not certify the new code.

The active game has no third-party JavaScript dependencies, accounts, remote APIs or analytics endpoint. Its CSP blocks connect, media, object and frame sources, and local files supply the scripts, styles and fonts. User-triggered NASA links can navigate away to external sites; this is distinct from automatic network access. Font files retain the supplied SIL Open Font License.

Nickname text is bounded, normalized and escaped when inserted into HTML. The header uses textContent. Both language dictionaries are local controlled content. Source links are accepted only when HTTPS, without credentials, on nasa.gov or its subdomains. That permission does not verify the linked scientific content.

The new state validator bounds incoming localStorage size, rejects wrong containers and invalid meters, module types, levels, mission positions, book IDs and log entries, and only accepts known age-level keys. Invalid saves fall back safely. Values and scores remain client-editable, so this educational game makes no competitive integrity claim.

Construction, upgrades, choice rewards, event effects and summary badges were examined for interruption and duplicate application. Transaction markers limit replay within a resumed guided step. Restarting a failed mission deliberately preserves progress; it is a game recovery feature, not a server-authorized transaction system.

The local development server remains loopback-only and builds allowlisted game output. Original ZIPs, old source snapshots, project documentation and tests do not enter the served build. No GitHub credentials, browser profile or personal game save is packaged into dist. Storage denial produces a visible temporary-progress warning.

Remaining limits: dynamic HTML rendering exists and must continue to escape any new player input. Re-run the review if remote content, accounts, telemetry or dependencies are added. Source wording, placeholders and science approval remain open. No public deployment or submission was performed.

## Latest mining and progression pass

The current build removes all audio controls and audio script loading, adds pre-action resource explanations and a separate visible help panel, adds three unlockable mining sites and three tool upgrade tracks, and records an explicit four-mission campaign finish. See PLAY_UPDATE_2026-11-13.md. The combined suite passes 85 tests (76 legacy and nine Kids/progression tests). Sixteen final browser checks pass with zero errors, failed requests or external requests. The browser also bought a drill through the workshop in a seeded free-play fixture, chose the ridge, broke a harder deposit in two clicks and returned its five-rock yield. This is distinct from the four campaign missions completed without injected resources. Existing limits on full Engineer/Commander campaigns and real-child usability remain.

## Autonomous settlement revision

The default mode now supports free building, duplicate facilities, production and collection, chosen supply orders, warehouse resupply, plot moves and outpost expansion. Guided saves and settlement saves are separate. The combined Node suite passes 93 tests, including eight dedicated economy tests. Eight autonomous browser checks and the separate 16 guided checks pass. The browser expansion milestone uses a labeled stocked fixture; a separate pure economy test proves reachability from starting resources and permitted mining hauls. New job and delivery IDs protect against duplicate collection/replay, and stored job recipes are checked against their building. No cloud service or automatic upload is added. See SETTLEMENT_MODE_2026-11-13.md for rules and limits.
