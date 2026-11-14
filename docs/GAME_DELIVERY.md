# B Game Delivery

This release adds the Kids game received from teammate B on November 13, 2026, published on November 14, 2026. It is the received mission-guided game, not the later autonomous base-management version.

## Included files

Eighteen files from the font-inclusive OxyNest-Kids.zip are preserved byte-for-byte under game/. The only omitted archive file is .claude/launch.json, a local editor launch configuration. Archive and file SHA-256 values are recorded in GAME_SOURCE_MANIFEST.json.

Open game/index.html in a desktop browser after downloading and extracting the repository. Bundled fonts and assets support offline play. The original sound effects and retry behavior are retained. No live website deployment is included.

## Validation

- The received game checker reports 514 text keys per language, 16 choices, 16 learning cards, zero errors and zero warnings.
- Fourteen cards contain a team-supplied NASA source; two retain fact placeholders. These counts do not verify the scientific claims or source contents.
- JavaScript syntax checks pass for the five game scripts.
- The separate research regression suite passes nine tests. The research structure issue documented in VALIDATION_STATUS.md remains unresolved.
- This publication does not include a complete browser playthrough or certify a security audit of the received game.

## Scope

Later gameplay, production orders, free-layout management, UI changes and integration fixes are excluded. Original statements in game/README.md are preserved as part of B's handoff; event-specific descriptions are not independently verified by this publication. See CREDITS.md for tools and assistance.

## Incremental validation update

Six regression checks have been added outside the preserved game source. Run npm run check:game for the received checker and these tests, or npm test for all 15 research and game checks. All pass at this update. These checks examine source contracts and assets; they are not a complete browser playthrough. No gameplay implementation files were changed in this update.
