#!/usr/bin/env python3
"""Trim Literata for blog.soards.me.

Requires: python3 -m pip install fonttools brotli
Inputs:  Fontsource latin variable files (already latin-subset, 230 glyphs):
  https://cdn.jsdelivr.net/fontsource/fonts/literata:vf@latest/latin-wght-normal.woff2
  https://cdn.jsdelivr.net/fontsource/fonts/literata:vf@latest/latin-wght-italic.woff2
Outputs: public/fonts/Literata-400-700.woff2  (variable, wght 400-700, ~37 KB)
         public/fonts/Literata-Italic-400.woff2 (static 400 italic, ~21 KB)
Usage:   python3 scripts/trim-fonts.py <normal.woff2> <italic.woff2> [outdir]
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

normal, italic = sys.argv[1], sys.argv[2]
out = Path(sys.argv[3] if len(sys.argv) > 3 else "public/fonts")
out.mkdir(parents=True, exist_ok=True)

f = instancer.instantiateVariableFont(TTFont(normal), {"wght": (400, 700)})  # keep 400-700 range
f.flavor = "woff2"; f.save(out / "Literata-400-700.woff2")

f = instancer.instantiateVariableFont(TTFont(italic), {"wght": 400})  # pin to static 400
f.flavor = "woff2"; f.save(out / "Literata-Italic-400.woff2")

for p in sorted(out.glob("Literata-*.woff2")):
    print(p, p.stat().st_size, "bytes")
