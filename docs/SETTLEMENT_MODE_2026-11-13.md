# Autonomous Moon Settlement

## Product decision

The owner selected base management as the main game, with mining and exploration supporting development. The default start is now Build my base. Guided missions remains a separately saved optional mode. Existing teaching progress is preserved; it does not have to be completed to unlock autonomy.

The design draws on village ownership from Clash of Clans, the approachable farming theme of Hay Day and free exploration from Genshin Impact. These are design references, not copied assets or an attempt to reproduce those games. Official references: https://supercell.com/en/games/clashofclans/ ; https://supercell.com/en/games/hayday/ ; https://genshin.hoyoverse.com/en/news/detail/5775 . The small production/order economy below is OxyNest's own implementation.

## The player chooses the route

A new settlement starts with 16 game rocks and access to rock and ice trips. All eight building types are available immediately when affordable. Six plots can hold different specializations or repeated production buildings. A player can start with a Processor, invest in solar energy, build a garden route or prioritize deliveries. No single build order is required.

Built facilities can be upgraded, moved to another plot or swapped. Moving keeps any running batch with its building. An occupied production facility cannot be removed until its batch is collected. Removing an idle facility uses the existing confirmation and partial rock refund. There are no adjacency bonuses or physical piping mechanics in this version.

In this mode, building and upgrading no longer trigger compulsory quizzes or automatic event attacks. First mining activities also do not block on a question. The player acts directly, and related cards are added to the optional Knowledge book through doing. Resource explanations and contextual help remain available. Guided mode retains the earlier questions and event choices.

## A concrete production loop

Tap a building to choose a production batch. The panel shows inputs, modeled power cost, outputs, and a short explanation. Ingredients and power are charged once when starting. One batch can occupy each building; different buildings can work at the same time. Higher building levels and outpost expansions shorten newly started jobs. Level-three production buildings also increase packaged output.

Solar panels recharge the power meter, with a battery collection bonus. Processors offer rock-to-air and ice-to-water routes. Oxygen makers use stored water to make air packs. Greenhouses use water and power to make food and used water; water recyclers reclaim that used water. CO2 cleaners improve the cabin-air meter rather than shipping inventory. The shelter remains a support building. All yields, durations, costs and bonuses are game rules, not scientific performance figures.

Finished batches display Collect above their building. They do not repeatedly generate goods until collected and restarted. Jobs continue while exploring and retain their finish timestamps when leaving the game. Each collected batch uses one point of modeled crew air, water and food; returning with cargo uses two. Empty reserves reduce survival only when these actions occur. Stored packs can restore the corresponding meter, so keeping supplies or shipping them is a real choice. Idle time does not destroy supplies, and there is no offline penalty. The game uses short 5–10 second base durations rather than real-hour construction waits.

Warehouse air, water and food can be used for the crew's meters or kept for delivery. This creates a choice between using and shipping supplies. Warehouse quantities are distinct from the cabin meters. The latter are simplified game indicators, not a newly certified life-support simulation.

## Orders and long-term progress

Orders and supplies shows six standing fictional requests. Players can choose any affordable request, repeat a preferred production route, and leave unavailable requests for later. Deliveries spend the listed goods and earn construction credits plus a star. Credits fund outpost expansion; they are not money or a payment mechanism. There is no online market or real player involved.

Outpost level one expands with 16 credits and at least two buildings. Level two expands with 40 credits and at least four buildings. Expansion accelerates new production jobs. The establishment milestone is level three, six deliveries and at least six packaged goods produced. It accepts different order combinations and production specializations.

The milestone offers Keep building or Save and leave, and records completion once. It does not require the player to follow a fixed chain of questions. Production, exploration and further layout changes remain optional afterward. No streak penalty, daily deadline, gacha or purchases have been added.

## Saves and implementation

kids/js/settlement.js contains the independent economy rules. Guided saves remain in the existing saves map; settlements use colonies, keyed by age level, inside the same local preference record. The state loader validates the colony warehouse, job queue, recipe-to-building correspondence and numeric bounds. Switching the start-screen mode does not overwrite the other mode's state. Older physical-simulation save keys remain untouched.

Each job has an ID and collection removes it, so a second collection cannot duplicate its output. Deliveries use a sequence token, rejecting replay of the same order action. Layout swaps update job positions atomically. Scores and saved data remain client-editable; no competitive integrity claim is made.

The pre-change Kids version is preserved under legacy/kids-before-settlement-2026-11-13. Both original B ZIPs remain unchanged. Current game files stay in kids/ and the allowlisted build in dist/. No GitHub synchronization, public repository, deployment, teammate message or submission was performed.

## Validation and remaining limits

The combined suite passes 93 Node tests, including eight dedicated economy tests for payments, affordability, timed collection, replay protection, layout changes, progression and invalid queues. Existing legacy and Kids regressions are retained and are not misreported as 93 tests of settlement gameplay.

The dedicated real-browser sequence is in tools/colony-browser.cjs and writes runtime/settlement-browser-report.json. It exercises a fresh autonomous start, a non-prescribed building order, persisted production, layout changes, production during an expedition, separate mode saves and Chinese rendering. A stocked fixture is used separately to reach the expansion milestone quickly; it must not be described as resources naturally earned in that browser playthrough. The dedicated economy tests also demonstrate a complete mixed production route from actual starting resources and permitted mining hauls, without adding warehouse stock. Eight settlement browser checks pass, while the separate 16-check guided regression also passes. Both runs captured zero errors, failed requests or external requests. The expansion UI and warehouse were inspected in an internal desktop QA capture.

The economy is a first small complete management loop. It does not include multiplayer trading, a large exploration map, offline automatic harvesting, elaborate decorations, adaptive NPCs or hundreds of upgrade tiers. Real child usability and retention have not been established by automated checks. The teaching source wording and two NASA fact placeholders still require D's review. No scientific facts were validated merely by using official-looking links.
