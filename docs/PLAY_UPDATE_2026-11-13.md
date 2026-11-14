# Mining and Progression Update

## Player problem and resulting behavior

The original Kids adaptation behaved mainly like a sequence of guided questions. Players could not easily explain the meters, locate the end condition or see a reason to repeat mining. The question-mark handler also used a speech bubble that was deliberately hidden whenever a modal was open, so a click during a question appeared to do nothing.

The existing cartoon art and campaign are retained. Resource explanation buttons now teach each meter's purpose and a useful action before mining or answering. The question mark opens a separate, dismissible contextual panel over both the base and existing dialogs. Timed decisions and suit-air drain pause while that panel is open. It does not submit an answer or discard the underlying question.

All audio is disabled. The sound script and control are no longer loaded by the page, and legacy sound calls resolve to a silent adapter. There is no background music or playable sound-effect control.

## Mining choices and tool growth

The first trip remains directly accessible. Subsequent rock trips open a three-site selection panel. Near the dome is available initially; the ridge unlocks after 12 collected rocks and the deep field after 30. Unlocks use cumulative material brought home, so spending rocks does not relock a site. More distant tiers have higher rock yields, greater hardness and higher suit-air use. Sites have distinct rock colors and a persistent explored-site collection.

After the first mining trip, Tool workshop offers three upgrade tracks, each with three purchases. Each track costs 6, then 10, then 14 rocks. The drill increases work per tap and rock yield; the air saver reduces suit-air drain; the backpack increases capacity by six units per purchase. These are transparent game rules, not NASA hardware specifications.

Mining shows current site, bag/capacity, deposits completed and layer progress. Cargo stops at its capacity. Material only enters the base after returning. Existing dust, suit-air return and ice mechanics remain. The progress card is positioned above the mining area so it does not intercept rock clicks; an earlier test exposed this overlap and it was corrected.

Players can invest in tools instead of immediately following the next build instruction. This adds a repeatable collect, invest and explore loop without removing the optional mission arrow. More extensive mining systems such as an underground map, physics excavation or random loot have not been implemented and are not claimed.

## Success and optional continuation

A persistent mission card shows which of four missions is active, its concrete goal and step progress. The final campaign summary says Moon base ready and offers Finish expedition. It records campaign completion and returns to the menu, rather than silently moving into another required task.

Returning to a completed level opens explicitly labeled optional free play. Free building and tool growth are therefore extra activities after success, rather than an endless sequence the player must finish to win. Existing zero-survival behavior remains: no death, a failed mission with Try again or Quit, and retained buildings/materials on retry.

## Age settings

The three age levels share these systems. Explorer has two answer choices, no event timer and easier digging; Engineer has simple quantities and a slower pausable timer; Commander adds a shorter timer, units and event chains. The expansion adds agency across all levels rather than claiming three separate games. Mission and mining feedback use concise progress counts even in Explorer where they clarify goals; its resource HUD still favors icon quantities.

## Implementation and preservation

kids/js/progression.js contains deterministic costs, unlocks and inventory effects. The state loader supplies defaults to old valid saves and rejects malformed progression fields. All new interface text is in the bilingual dictionary. Chinese font subsets were rebuilt from the same licensed Noto CJK sources; coverage.json records actual cmap characters and hashes, checked against the active text.

The prior Kids source was preserved in legacy/kids-before-play-update-2026-11-13. B's original ZIPs and extracted originals remain unchanged. Earlier simulation source and browser save keys are untouched. No public publishing or GitHub synchronization was performed.

## Validation scope

The combined Node suite passes 85 tests: 76 legacy regressions, five Kids state tests and four mining-progression tests. New pure tests exercise cumulative unlocks, real tool effects, exact debits, insufficient resources, upgrade caps and old-save defaults. Static language, content and font checks pass. The browser report is generated in runtime/browser-smoke-report.json; consult its final recorded result for the exact scenarios rather than transferring earlier reports to modified code.

Explorer's four-mission browser walkthrough covers real mining and builds, contextual help before mining and over a question, wrong-answer retry, interrupted rewards/construction, badge idempotence, explicit campaign completion, failure recovery, language and desktop bounds. A seeded free-play fixture is used separately to test workshop purchasing and the ridge; it is not presented as naturally earned campaign resources.

Remaining limits include full Engineer/Commander campaigns, every free-build combination, real child usability and comprehensive accessibility/device testing. The supplied NASA wording and two missing facts still need team review. Static reference checks do not verify scientific accuracy or the three-second comprehension target.
