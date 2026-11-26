"""Keep the repository sitemap aligned with the Markdown wiki pages."""

import argparse
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

BASE_URL = "https://ruchirchawdhry.github.io/copier-electron-svelte/"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
PAGE_NAME = re.compile(r"[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*")
ROOT = Path(__file__).resolve().parents[1]


def sitemap() -> bytes:
    names = {path.stem for path in (ROOT / "wiki").glob("*.md") if not path.name.startswith("_")}
    if "Home" not in names or not all(PAGE_NAME.fullmatch(name) for name in names):
        raise ValueError("Wiki pages must include Home and use hyphenated ASCII names")

    ET.register_namespace("", NS)
    root = ET.Element(f"{{{NS}}}urlset")
    urls = [BASE_URL, *(BASE_URL + name.lower() + "/" for name in sorted(names - {"Home"}))]
    for url in urls:
        ET.SubElement(ET.SubElement(root, f"{{{NS}}}url"), f"{{{NS}}}loc").text = url
    ET.indent(root, space="  ")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True) + b"\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail when sitemap.xml is stale")
    args = parser.parse_args()
    path = ROOT / "sitemap.xml"
    content = sitemap()
    if args.check:
        if not path.exists() or path.read_bytes() != content:
            print("sitemap.xml is stale. Run: python3 scripts/generate_sitemap.py", file=sys.stderr)
            return 1
    else:
        path.write_bytes(content)
    print(f"Validated {len(list((ROOT / 'wiki').glob('[!_]*.md')))} wiki routes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
