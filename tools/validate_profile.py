#!/usr/bin/env python3
"""Validate the public profile without network access or third-party packages."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parent.parent
errors = []
svg_files = sorted((root / "assets").glob("*.svg"))
if not svg_files:
    errors.append("No SVG assets found")
for file in svg_files:
    try:
        node = ET.parse(file).getroot()
        if node.tag != "{http://www.w3.org/2000/svg}svg":
            errors.append(f"{file.relative_to(root)}: root tag is not SVG")
    except (ET.ParseError, OSError) as exc:
        errors.append(f"{file.relative_to(root)}: {exc}")

readme = (root / "README.md").read_text(encoding="utf-8")
for ref in re.findall(r'''(?:src|href)\s*=\s*["'](\./[^"']+)["']''', readme):
    path = (root / ref.split("#", 1)[0].removeprefix("./")).resolve()
    try:
        path.relative_to(root.resolve())
    except ValueError:
        errors.append(f"Unsafe README path: {ref}")
        continue
    if not path.is_file():
        errors.append(f"Missing relative README asset: {ref}")
for path in ["docs/index.html", "docs/style.css", "docs/app.js",
             "docs/ENABLE_PAGES.md", "tools/refresh.mjs"]:
    if not (root / path).is_file():
        errors.append(f"Missing required site file: {path}")
for path in ["data/public-projects.json", "data/github-stats.json"]:
    try:
        data = json.loads((root / path).read_text(encoding="utf-8"))
        if data.get("login") != "theihtishaam":
            errors.append(f"{path}: unexpected login")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{path}: {exc}")
html = (root / "docs/index.html").read_text(encoding="utf-8")
for section in ["id=\"work\"", "id=\"journey\"", "id=\"sites\"", "id=\"contact\""]:
    if section not in html:
        errors.append(f"Missing site section: {section}")
for err in errors:
    print("ERROR", err)
print(f"Validated {len(svg_files)} SVG assets, README links and portfolio sections")
if errors:
    sys.exit(1)
