# Data review and open issues

All nine datasets exist locally. Historical handoff statements about three missing datasets are superseded by the current inventory. Imported data and revised checker remain byte-identical to their local source files.

## Scientific provenance

Source-attached context is not independently verified by this integration. Existing `NASA_VERIFIED_CONTEXT_GAME_BALANCE_ASSUMPTION` labels and `last_verified` dates are author assertions requiring source-content review. No network or scientific validation is implied by the automated checks.

- `recipes.json` and `wheel.json`: yields, costs, timing, effects and weights are game-design assumptions.
- `modules.json`: costs, kW, capacities, wear and construction times require game-balance classification.
- `consumption.json`: metabolic baselines and ISS recovery claims require exact source/section confirmation; ISS system performance must not be represented as a guaranteed lunar module efficiency.
- `alarms.json` and `failure_chains.json`: thresholds are provisional game rules, not universal lethal limits. Career cumulative radiation is not an acute fatality criterion.
- `destinations.json`: lunar equatorial temperature/night approximations must not be presented as verified Shackleton-rim conditions. A fictional base placement is not an established NASA base.
- `quiz.json`: answers about cabin atmosphere and mission procedures require mission-specific review before publication.
- `reality_vs_game.json`: provides useful distinctions, but its verification classifications are not certification.

## Integration issues to resolve

Recipe module references must match B's final registry; do not invent aliases silently. Wheel effect keys and failure decision tags have no received engine contract. Resource inventory keys include regolith, water_ice, wastewater, nutrients and mars_co2; availability and conversion are pending B. Mars recipe gating is described in notes rather than a machine-readable destination restriction.

The supplied dashboard contains static historical content and branding. It is retained as reference material and is not the production game. Original security and submission documents do not constitute final-code review or approved submission claims.
