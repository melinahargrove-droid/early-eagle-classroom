from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "v6-test"
SW = APP / "sw.js"
TEXT_EXTS = {".html", ".js", ".css"}
# Conservative static-path matcher. Dynamic template literals are intentionally skipped.
LOCAL_REF = re.compile(
    r'''["']((?:(?:\.\.?/|/)?[A-Za-z0-9][A-Za-z0-9._%+() /-]*\.(?:html|js|css)))(?:[?#][^"']*)?["']''',
    re.IGNORECASE,
)
CORE_ENTRY = re.compile(r"['\"](\./[^'\"]+)['\"]")


def normalize_target(source: Path, raw: str) -> Path | None:
    value = raw.strip()
    if not value or "${" in value or "{{" in value:
        return None
    if value.startswith(("http://", "https://", "data:", "blob:", "javascript:", "mailto:", "tel:")):
        return None
    if value.startswith("/"):
        target = APP / value.lstrip("/")
    else:
        target = source.parent / value
    try:
        return target.resolve()
    except OSError:
        return None


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def main() -> int:
    if not APP.is_dir():
        print("ERROR: v6-test directory is missing.")
        return 1

    source_files = sorted(
        p for p in APP.rglob("*") if p.is_file() and p.suffix.lower() in TEXT_EXTS
    )
    missing: list[tuple[Path, str, Path]] = []
    discovered_html: set[Path] = set()

    for source in source_files:
        try:
            text = source.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print(f"WARNING: skipped non-UTF-8 file {rel(source)}")
            continue
        for raw in LOCAL_REF.findall(text):
            target = normalize_target(source, raw)
            if target is None:
                continue
            try:
                target.relative_to(APP.resolve())
            except ValueError:
                continue
            if target.suffix.lower() == ".html":
                discovered_html.add(target)
            if not target.exists():
                missing.append((source, raw, target))

    sw_text = SW.read_text(encoding="utf-8") if SW.exists() else ""
    precached = set()
    for raw in CORE_ENTRY.findall(sw_text):
        target = normalize_target(SW, raw)
        if target is not None:
            precached.add(target)

    uncached = sorted(
        target for target in discovered_html
        if target.exists() and target not in precached
    )

    print(f"Scanned {len(source_files)} V6 HTML/JS/CSS files.")
    print(f"Found {len(discovered_html)} static local HTML destinations.")

    if uncached:
        print("\nOffline review (warning only): local HTML destinations not in service-worker CORE:")
        for target in uncached:
            print(f"  - {rel(target)}")

    if missing:
        print("\nERROR: missing static local references:")
        for source, raw, target in missing:
            print(f"  - {rel(source)} -> {raw} (expected {rel(target)})")
        return 1

    print("\nPASS: no missing static local HTML/JS/CSS references found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
