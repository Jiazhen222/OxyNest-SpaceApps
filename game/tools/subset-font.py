"""Cut the bundled Chinese font down to the characters the game uses.

Usage (from the OxyNest-Kids folder):
    node tools/font-chars.js
    python tools/subset-font.py path/to/NotoSansSC-Regular.otf path/to/NotoSansSC-Bold.otf

Needs: pip install fonttools brotli
The full fonts come from https://github.com/notofonts/noto-cjk (Sans/SubsetOTF/SC), SIL Open Font License 1.1.
Writes fonts/NotoSansSC-Regular.subset.woff2 and fonts/NotoSansSC-Bold.subset.woff2.
"""
import os
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'fonts')


def cut(src, out, chars):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']      # keep kerning and Chinese punctuation features
    opts.name_IDs = ['*']             # keep the name table, including the licence fields
    opts.name_languages = ['*']
    opts.name_legacy = True
    opts.notdef_outline = True
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(options=opts)
    sub.populate(text=chars)
    sub.subset(font)
    subset.save_font(font, out, opts)
    missing = [ch for ch in chars if ord(ch) not in font.getBestCmap()]
    return os.path.getsize(out), missing


def main(argv):
    if len(argv) != 3:
        print(__doc__)
        return 2
    with open(os.path.join(FONTS, 'subset-chars.txt'), encoding='utf-8') as f:
        chars = f.read()
    for src, name in ((argv[1], 'NotoSansSC-Regular.subset.woff2'), (argv[2], 'NotoSansSC-Bold.subset.woff2')):
        size, missing = cut(src, os.path.join(FONTS, name), chars)
        note = f'; not in the font: {"".join(missing)!r}' if missing else ''
        print(f'fonts/{name}: {size / 1024:.0f} KB, {len(chars)} characters requested{note}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
