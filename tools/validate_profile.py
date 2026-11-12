#!/usr/bin/env python3
"""Validate the public profile without network access or third-party packages."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
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
# Check local links and image paths across the Pages site and all case studies.
class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        if tag not in {"a", "img", "script", "link"}:
            return
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.refs.append(value)

def verify_local_ref(source: Path, ref: str) -> None:
    if ref.startswith(("https:", "http:", "mailto:", "tel:", "data:", "#", "//")):
        return
    clean = unquote(ref.split("#", 1)[0].split("?", 1)[0])
    if not clean:
        return
    if clean.startswith("/"):
        errors.append(f"Root-relative URL may be incorrect on project Pages: {source.relative_to(root)} -> {ref}")
        return
    local = (source.parent / clean).resolve()
    try:
        local.relative_to(root.resolve())
    except ValueError:
        errors.append(f"Link escapes repository root: {source.relative_to(root)} -> {ref}")
        return
    if not local.is_file():
        errors.append(f"Broken local link: {source.relative_to(root)} -> {ref}")

pages = [root / "docs/index.html", *sorted((root / "docs/projects").glob("*.html"))]
for page in pages:
    parser = LinkParser()
    parser.feed(page.read_text(encoding="utf-8"))
    for ref in parser.refs:
        verify_local_ref(page, ref)

for document in sorted((root / "docs/projects").glob("*.md")):
    body = document.read_text(encoding="utf-8")
    for ref in re.findall(r'\[[^\]]+\]\(([^)]+)\)', body):
        verify_local_ref(document, ref)
    for ref in re.findall(r'<img[^>]*src="([^"]+)"', body):
        verify_local_ref(document, ref)

required_cases = ["agent-shadow-brain", "civic-twin", "procureguard-ai"]
for name in required_cases:
    for path in [f"docs/projects/{name}.md", f"docs/projects/{name}.html",
                 f"assets/case-{name}.svg", f"assets/flow-{name}.svg"]:
        if not (root / path).is_file():
            errors.append(f"Missing project case-study artifact: {path}")

for err in errors:
    print("ERROR", err)
print(f"Validated {len(svg_files)} SVG assets, README links and portfolio sections")
if errors:
    sys.exit(1)
