# OxyNest Moon Base (kids version)

A desktop web game for children aged 5-12, made for NASA Space Apps 2026 (Johor Bahru, Challenge #3). The child builds a base on the Moon in side view, guided by Orbi, a small robot astronaut. There is no fighting: the "attacks" are space events (lunar night, solar storm, air leak, meteorites) that the child handles by choosing the right answer.

Plain HTML, CSS and JavaScript. No frameworks, no build step, no server, no accounts, no network requests. All art is drawn in code as SVG. Progress is saved in the browser (localStorage) only.

## Play

Double-click `index.html`. It works offline, straight from the folder (tested in Microsoft Edge from `file://`).

For the team's usual setup you can also serve the folder: `python -m http.server 8010`, then open `http://localhost:8010`.

## What the child sees

- **Start screen:** three big level cards and an optional space nickname (plain text only, never sent anywhere; the screen says "No real names!").
- **Game screen:** sky (stars, Sun, Earth), the Moon surface with a dome and 6 build slots, the soil pile (left) and the ice crater (right), a stats bar (Survival, Air, Power, Water, Food, Radiation, Rocks, Stars) and up to four big buttons: Go outside, Mine ice, Process, Knowledge book. Buttons appear only once they are needed.
- **One "Next step" banner** at the top (icon + a few words) with a bouncing arrow on the exact thing to tap. After 8 seconds without a tap, Orbi points again; the **?** button does the same on demand. During a question the arrow points at the question, never at an answer.
- **EN | 中文** at the top right of every screen (saved). Sound effects are made with Web Audio; the speaker button mutes them (saved).

## How a mission works

Every outcome is fixed (no random numbers anywhere). A wrong answer never blocks the game: survival drops a little (-8), Orbi explains gently, and the child tries again. A right answer raises survival (+10, or +4 after a wrong try), and gives stars (3, or 1) and rocks (2, or 1). After every answer something visibly changes: a meter, the base (lights, a patch on the dome, plants growing, the astronaut walking into the shelter) and Orbi's face. Then a learning card shows *What happened*, *Why*, *How NASA does it* and an everyday comparison. Cards collect in the Knowledge book.

If survival reaches zero, a **MISSION FAILED** pop-up offers **Try again** (the mission restarts; cards already learned stay in the book) or **Quit**.

| Mission | Steps | Cards |
| --- | --- | --- |
| 1 First night on the Moon (guided) | Dig rocks, build a battery, the lunar night | Moon dust, Suit air, Lunar night (+ Saving power for Commander) |
| 2 Ice and air | Mine ice, build the Processor, an air leak, rocks to air | Ice in the dark, Air leak, Air from rocks |
| 3 Green base, solar storm | Ice to water, build a greenhouse, build a radiation shelter, the solar storm | Water from ice, Space garden, Solar storm (+ Radiation adds up) |
| 4 Space rocks! | Build the oxygen maker, meteorites, then the child picks the last building | Space rocks, Air from water, and Sun power / Clean air / Recycled water |
| Free build | Build, upgrade (Lv 1-3) and move buildings out; every build or upgrade brings the next event | Practice cards |

Each mission ends with "Today you learned 3 things", the stars earned and a bronze, silver or gold Moon badge.

**Digging:** the astronaut walks to the soil pile while a suit-air ring shrinks; each tap digs. Moon dust slows digging until the child taps "Blow away the dust", and each emptied spot sends the astronaut farther away. Running out of suit air is not a failure: the astronaut walks home with what was dug. **Ice mining** works the same way in the dark crater. **The Processor** turns rocks into air and ice into water and uses power.

## Levels

The same game for everyone; only these settings change (`js/content.js` → `LEVELS`).

| | Explorer (5-7) | Engineer (8-10) | Commander (11-12) |
| --- | --- | --- | --- |
| Answers shown | 2 | 2 (3 in events) | 3, one tempting but wrong |
| Event countdown | none | 30 s, with Pause | 15 s |
| Text | shortest lines, no numbers (counts shown as dots) | simple numbers | units shown (kW, kWh, °C, %, s) |
| Digging | 2 taps a spot, slow air use, dust only on the first trip | 3 taps | 4 taps, more dust |
| Events | single | single | can chain (night → low battery, storm → wait, meteorites → air leak) |

## NASA facts

The game invents no NASA facts or numbers. 14 of the 16 cards use facts from the team's NASA data files (D's `data/*.json` in `../OxyNest/data/`), each with its nasa.gov source behind **Learn more** (with "Ask a grown-up before opening web pages"). The other 2 (Moon dust, Space rocks) show **[Fact to be added]** and no Learn more. The full list, with the data file each fact came from, is in [docs/FACTS.md](docs/FACTS.md) for D to check.

## Checks

```sh
node tools/check.js   # both languages complete, every reference resolves, Explorer text has no numbers,
                      # status colours only on meters, sources are nasa.gov, no network code, no random numbers,
                      # the bundled Chinese font has every character the text uses
node tools/facts.js   # rewrites docs/FACTS.md from the game files
```

## Files

| Path | What |
| --- | --- |
| `index.html` | The page (blocks all network requests with a Content-Security-Policy) |
| `css/game.css` | Layout and look (palette from the design brief) |
| `js/i18n.js` | **All text**, English and Chinese |
| `js/content.js` | Rules and content: levels, buildings, choices, cards and their sources, events, missions |
| `js/art.js` | All art as SVG: icons, Orbi, astronaut, buildings, Moon scene, badges |
| `js/sfx.js` | Sound effects (Web Audio) |
| `js/game.js` | The game |
| `fonts/` | Noto Sans SC subsets for Chinese, their licence and how to rebuild them |
| `tools/` | Checks, the facts list generator and the font subset tools |

## Notes and open points

- Chinese uses **Noto Sans SC**, bundled in `fonts/` as a 154 KB + 158 KB subset of the characters the game uses (SIL Open Font License 1.1). It loads from the folder, so it looks the same on every computer and needs no internet. After changing the Chinese text, `node tools/check.js` lists any new characters; [fonts/README.md](fonts/README.md) says how to rebuild the subset.
- The Chinese text was written with an SI tool and needs a native speaker's check.
- D to confirm the reworded NASA lines and fill the two placeholders (docs/FACTS.md).
- Best on a desktop or laptop screen; the 1280 × 720 stage scales to fit the window.
- NASA sources are cited for education. This is an independent student project, not endorsed by NASA.
