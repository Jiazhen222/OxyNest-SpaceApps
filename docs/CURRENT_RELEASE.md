# Current Publication — November 14, 2026

This update replaces game/ with the current local Moon settlement implementation after the owner's authorization. The earlier B delivery and research-only stages remain in normal Git history. No timestamps have been backdated.

## Included changes

- Autonomous settlement is the default mode; guided missions remain optional with separate saves.
- Production jobs, supply orders, warehouse resupply, facility upgrades, plot moves and outpost progression are included.
- Mining-site progression and tool upgrades support exploration.
- Contextual help, bilingual text and locally bundled font coverage are included. Background music is absent.
- Save validation and recovery preserve buildings and materials when retrying a failed mission.
- Focused game tests and local build/server/browser tools are included.

## Evidence and limits

The public checkout passes 32 Node tests: nine historical research tests, six content/assets/integrity checks, four mining-progression tests, five state/recovery tests and eight economy tests. Its build and static game checker pass. The checker reports 638 text keys per language, 16 choices and 16 learning cards. Fourteen cards contain supplied NASA links; two retain placeholders. Counts and source-domain checks do not verify scientific accuracy.

The autonomous browser sequence passes eight checks with no console errors, failed requests or external requests. It covers fresh starts, a player-selected building order, production persistence and collection, plot moves, production while exploring, separate mode saves and Chinese rendering. Its expansion check uses an explicitly stocked fixture. A separate economy test demonstrates a route to the milestone from actual starting resources and permitted mining hauls.

Historical research data is preserved rather than replaced with later engine-specific data. Its unresolved food metric remains documented and does not power this game's runtime. Source wording and placeholders still require scientific review. Child usability, full Engineer/Commander campaigns and mobile-specific optimization are not established by these checks.

This is a source publication, not a scientific certification, website deployment or final submission. No accounts, cloud saves, telemetry, personal browser profiles or local save data are included. A targeted common-secret signature scan found no matches in the published code and documentation; this is not a comprehensive security guarantee.

## Source records

CURRENT_GAME_MANIFEST.json identifies current game files. GAME_SOURCE_MANIFEST.json and GAME_DELIVERY.md describe the earlier unmodified handoff. They are historical, not claims that the current game is unchanged. The original snapshot is available at commit e55dbbcdbb272dfb590db81d5eaf1924b44d2364.

The dated QA and security documents describe their respective integration passes. Statements in those historical documents that no publication had occurred refer to those earlier passes. This document and the root README describe the current public release.

The public checkout's guided browser sequence also passes all 16 checks, including all four Explorer missions, failure recovery, interrupted construction, duplicate-reward protection, help overlays, level initialization and desktop font/layout checks. It records no console errors, failed requests or external requests. Together the two independent browser sequences pass 24 checks. Higher levels are initialized but their full campaigns are not covered.
