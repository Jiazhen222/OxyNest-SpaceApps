# Noto Sans SC

The game bundles subsetted Regular and Bold Noto Sans SC fonts for Chinese text, loaded locally without a network request.

Source: https://github.com/notofonts/noto-cjk (Sans/SubsetOTF/SC/NotoSansSC-Regular.otf and NotoSansSC-Bold.otf).

License: SIL Open Font License 1.1, preserved in [OFL.txt](OFL.txt). The original copyright and font metadata remain in the font files.

coverage.json records actual cmap characters and SHA-256 hashes. The game checker verifies that both files match this record and cover the interface text. After changing Chinese text, regenerate subset-chars.txt with game/tools/font-chars.js and use game/tools/subset-font.py with the original OTF fonts. The font-subsetting tools require Python fonttools and brotli; they are not required to play the game.
