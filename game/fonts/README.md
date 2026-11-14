# Fonts

**Noto Sans SC** (Regular and Bold), used for all Chinese text, as the design brief asks.

- Source: Google's Noto CJK project, <https://github.com/notofonts/noto-cjk>, files `Sans/SubsetOTF/SC/NotoSansSC-Regular.otf` and `NotoSansSC-Bold.otf` (downloaded 2026-11-13).
- Licence: SIL Open Font License 1.1, in [OFL.txt](OFL.txt). The licence allows bundling and subsetting; the font name and copyright are kept inside the files.
- The full fonts are about 17 MB, so the game ships a **subset**: only the 803 characters the game uses (every character of the Chinese text in `js/i18n.js`, basic Latin, digits and common punctuation). That makes them 154 KB (Regular) and 158 KB (Bold), loaded from this folder with no network request.

## After changing the Chinese text

New Chinese characters are not in the subset yet. `node tools/check.js` reports them. To rebuild:

```sh
node tools/font-chars.js        # writes fonts/subset-chars.txt from js/i18n.js
pip install fonttools brotli
python tools/subset-font.py path/to/NotoSansSC-Regular.otf path/to/NotoSansSC-Bold.otf
```

A character that is missing still shows, in the computer's own Chinese font (for example a child's Chinese nickname).
