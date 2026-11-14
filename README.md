# OxyNest

**Build Life Beyond Earth.**

OxyNest is an educational Moon base-building game designed for children aged 5–12. Players explore for resources, build a settlement and discover how air, water, food and power depend on one another. The aim is to make space-settlement ideas understandable through decisions and visible results.

## Start playing

1. On this GitHub page, choose **Code → Download ZIP**.
2. Extract the ZIP completely.
3. Open **index.html**, or **game/index.html**, in a desktop browser.
4. Choose English or Chinese. A space nickname is optional; a real name is not needed.
5. Choose an age level and select **Build my base** or **Guided missions**.

No installation, account or internet connection is required for the game itself. NASA reference links open external websites. There is no background music. The project currently provides downloadable source; a hosted game URL has not been published.

Repository: https://github.com/Jiazhen222/OxyNest-SpaceApps

## Choose a mode

| Mode | What to expect |
| --- | --- |
| **Build my base** | Freely choose buildings, run production, explore, complete supply orders and expand your outpost. This is the default experience. |
| **Guided missions** | Follow the mascot's prompts through mining, construction, questions and space events. Four missions introduce the main systems. |

The two modes save separately for each age level. Switching modes does not replace the other base.

## Play Build my base

There is no required building order. This is one possible way to begin:

1. **Choose a building.** Tap an empty plot to see facilities, costs and uses. A solar panel helps supply power; a Processor provides resource-conversion routes. You begin with 16 game rocks.
2. **Explore for materials.** Use **Go outside** for rocks or **Mine ice** for ice. Tap deposits to gather cargo, clear dust when needed, and watch suit air. Returning banks the collected materials. If suit air runs out, the astronaut returns with the cargo.
3. **Start production.** Tap a suitable building and choose a batch. Check its materials and power cost before starting. Different buildings can work at the same time, including while you explore.
4. **Collect the result.** When **Collect** appears above a building, collect its completed batch. A new batch must be started manually.
5. **Choose how to use supplies.** Open **Orders and supplies**. Keep air, water and food for your crew, or deliver the listed goods to earn expansion credits and stars. Credits are fictional game rewards, not real money.
6. **Develop your base.** Upgrade facilities, move or swap them between six plots, and expand the outpost when you have enough credits and buildings. You can build more than one facility of the same type.

### What each facility does

| Facility | Purpose in the game |
| --- | --- |
| Solar panel | Produces power through charging jobs. |
| Battery | Improves power collected from solar jobs. |
| Processor | Converts rocks into air packs or ice into water packs using power. |
| Oxygen maker | Uses water and power to produce air packs. |
| CO2 cleaner | Improves the cabin-air meter. |
| Water recycler | Reclaims used water with power. |
| Greenhouse | Uses water and power to produce food and used water. |
| Radiation shelter | Supports radiation protection. |

Production takes short game intervals, typically 5–10 seconds before upgrade bonuses. These are game timers, not real construction or processing times.

### Understand the resources

The top meters describe the crew's condition and reserves. Warehouse packs are separate items: collecting packs does not automatically fill the matching crew meter. Use the supply controls to replenish reserves, or save those packs for deliveries.

Collecting production and returning with cargo use small amounts of crew supplies. Check reserves before repeatedly taking these actions. If power is low, charge with a solar panel. If materials are missing, explore or choose another affordable activity. Supplies do not drain simply because you leave the game closed, and there is no offline resource penalty.

Tap resource explanations and the **?** help button when a symbol or next action is unclear. The **Knowledge book** collects short learning cards.

### How to succeed

Establish your outpost by meeting all three goals:

- Reach **Outpost Level 3**.
- Complete **6 deliveries**.
- Produce at least **6 packaged supplies**: air, water or food.

Level 2 requires 16 credits and at least two buildings. Level 3 requires another 40 credits and at least four buildings. You can choose different production routes and repeat deliveries. After reaching the milestone, choose **Keep building** or **Save and leave**.

## Play Guided missions

Follow the large prompt, mascot and highlighted target. The first mission introduces rock collection, a battery and lunar night. Later missions add ice, processing, food, protection and further building choices.

Wrong choices reduce survival and provide an explanation. Correct choices reward progress; solving a question after an error earns a smaller reward. At zero survival, **MISSION FAILED** offers **Try again** or **Quit**. Trying again restores reserves while keeping buildings, materials and learned cards. There is no character death.

| Level | Guided experience |
| --- | --- |
| Explorer, ages 5–7 | Two choices, no event countdown and mostly icon-based information. |
| Engineer, ages 8–10 | Simple numbers and a slower event countdown that can be paused. |
| Commander, ages 11–12 | More choices, units, shorter countdowns and chained events. |

## Save, exit and restart

Progress is saved in localStorage in the current browser. **Quit** returns to the menu; **Continue** resumes the saved game. After returning to the menu, you can close the browser tab. Starting over requires confirmation.

Saves stay on that browser and device. Clearing browser storage removes them. File URLs, localhost and different ports can have separate saves. If browser storage is blocked, the game displays a warning and progress may be temporary. No player data is uploaded to a server.

## NASA resources and educational scope

NASA resources inform the learning content about lunar conditions, life support, water recovery, food production and radiation. See [NASA_DATA.md](NASA_DATA.md) for the references used by the current game and [CREDITS.md](CREDITS.md) for other resources and AI assistance.

Rocks, meters, costs, outputs, rewards, power labels and timers are simplified game rules. They are not verified engineering specifications. Fourteen learning cards have supplied NASA references; two retain fact placeholders and hide their source button. Source wording still requires review; a NASA-domain link does not verify a claim. This is a desktop prototype; child-usability studies and mobile-specific optimization have not been completed.

OxyNest is an independent student project and is not endorsed by NASA.

## Run and check the code

Developers can use Node.js 24 or later. No third-party npm packages are required.

```sh
npm test
npm run build
npm start
```

Open the localhost address printed by the server. Stop it with Ctrl+C. The build writes only the playable game and local fonts to dist/.

The focused suite checks content, saves, recovery, mining progression and the settlement economy. Optional desktop browser checks use an installed Microsoft Edge or Google Chrome:

```sh
npm run test:colony
npm run test:browser
```

Game source is in game/js/, layout in game/index.html and game/css/, and bilingual text in game/js/i18n.js. Tests and development tools are included for reproducibility. Static checks do not establish scientific accuracy or real-child usability.
