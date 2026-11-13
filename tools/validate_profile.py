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
svg_files = sorted((root / "assets").rglob("*.svg"))
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
for section in ["id=\"work\"", "id=\"stack\"", "id=\"sites\"", "id=\"contact\""]:
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

# Validate the mirrored npm download snapshot and animated spider-web setup.
try:
    root_npm = json.loads((root / "data/npm-metrics.json").read_text(encoding="utf-8"))
    site_npm = json.loads((root / "docs/npm-metrics.json").read_text(encoding="utf-8"))
    if root_npm.get("package") != "@theihtisham/agent-shadow-brain":
        errors.append("Incorrect npm package ID")
    if root_npm.get("downloads") != site_npm.get("downloads"):
        errors.append("GitHub Pages npm stats differ from root stats")
    if not isinstance(root_npm.get("downloads"), int):
        errors.append("Download total must be an integer")
except (OSError, ValueError) as exc:
    errors.append(f"npm metric data: {exc}")
web_html = (root / "docs/index.html").read_text(encoding="utf-8")
for snippet in ["id=\"spider-web\"", "src=\"./spider-web.js\""]:
    if snippet not in web_html:
        errors.append(f"Missing spider-web integration: {snippet}")
for name in required_cases:
    case_html = (root / "docs/projects" / (name + ".html")).read_text(encoding="utf-8")
    if 'id="spider-web"' not in case_html:
        errors.append(f"Spider web missing in {name} HTML")
    if 'src="../spider-web.js"' not in case_html:
        errors.append(f"Spider web script missing in {name} HTML")

# Verify the public-project catalogue is bundled in GitHub Pages.
site_html = (root / "docs/index.html").read_text(encoding="utf-8")
for required in ['src="./catalogue.js"', 'id="repo-search"', 'id="repo-sort"',
                 'id="repo-show-more"', 'data-filter="official"', 'data-filter="featured"']:
    if required not in site_html:
        errors.append(f"Missing repository terminal element: {required}")
for filename in ["docs/public-projects.json", "docs/github-stats.json"]:
    if not (root / filename).is_file():
        errors.append(f"Missing offline first-party catalogue data: {filename}")
try:
    index = json.loads((root / "data/public-projects.json").read_text(encoding="utf-8"))
    mirrored = json.loads((root / "docs/public-projects.json").read_text(encoding="utf-8"))
    if index != mirrored:
        errors.append("Public-project mirror differs from root source")
    official_count = sum(1 for p in index.get("repositories", [])
                         if p.get("sourceOwner", "theihtishaam") == "theihtishaam")
    if official_count != index.get("officialRepositoryCount"):
        errors.append("Official project count excludes or includes the wrong repositories")
    rootstats = json.loads((root / "data/github-stats.json").read_text(encoding="utf-8"))
    sitestats = json.loads((root / "docs/github-stats.json").read_text(encoding="utf-8"))
    if rootstats != sitestats:
        errors.append("GitHub statistics mirror differs from root source")
except (OSError, ValueError, TypeError) as err:
    errors.append(f"Cannot verify public project mirror: {err}")

# Ensure README auto-project list updates do not misattribute original repositories.
if readme.count("<!-- AUTO_PUBLIC_PROJECTS_START -->") != 1 or readme.count("<!-- AUTO_PUBLIC_PROJECTS_END -->") != 1:
    errors.append("README requires exactly one auto-project start and end marker")
else:
    auto = readme.split("<!-- AUTO_PUBLIC_PROJECTS_START -->", 1)[1].split("<!-- AUTO_PUBLIC_PROJECTS_END -->", 1)[0]
    for item in json.loads((root / "data/public-projects.json").read_text(encoding="utf-8")).get("repositories", []):
        if item.get("sourceOwner") != "theihtishaam":
            continue
        if f"https://github.com/theihtishaam/{item.get('name')}" not in auto:
            errors.append(f"Official public repository absent from README catalogue: {item.get('name')}")

latest_start = "<!-- AUTO_LATEST_REPOSITORIES_START -->"
latest_end = "<!-- AUTO_LATEST_REPOSITORIES_END -->"
if readme.count(latest_start) != 1 or readme.count(latest_end) != 1:
    errors.append("README requires one pair of latest repository markers")
else:
    latest = readme.split(latest_start, 1)[1].split(latest_end, 1)[0]
    latest_names = re.findall(r'href="https://github\.com/theihtishaam/([^"/]+)"', latest)
    snapshot = json.loads((root / "data/public-projects.json").read_text(encoding="utf-8"))
    official = [repo for repo in snapshot.get("repositories", [])
                if repo.get("sourceOwner") == "theihtishaam" and repo.get("createdAt")]
    official.sort(key=lambda repo: repo["name"].casefold())
    official.sort(key=lambda repo: repo["createdAt"], reverse=True)
    if latest_names != [repo["name"] for repo in official[:3]]:
        errors.append("Latest repositories differ from the public creation-date order")

for err in errors:
    print("ERROR", err)
print(f"Validated {len(svg_files)} SVG assets, README links and portfolio sections")
if errors:
    sys.exit(1)
