#!/usr/bin/env python3
"""Inspect, fill, and check editable PPTX decks without installing dependencies."""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
import tempfile
import unicodedata
from pathlib import Path
from zipfile import ZipFile

from lxml import etree
from pptx import Presentation
from pptx.chart.data import CategoryChartData

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
PARSER = etree.XMLParser(resolve_entities=False, no_network=True)


def xml(data):
    """Parse an OOXML part without resolving external entities."""
    return etree.fromstring(data, PARSER)


def slides(archive):
    """Return slide part names in presentation order."""
    rels = xml(archive.read("ppt/_rels/presentation.xml.rels"))
    targets = {r.get("Id"): r.get("Target") for r in rels}
    presentation = xml(archive.read("ppt/presentation.xml"))
    result = []
    for slide in presentation.findall("p:sldIdLst/p:sldId", NS):
        target = targets[slide.get("{" + NS["r"] + "}id")]
        # Slide relationships are package-local; reject escaping or remote paths.
        if not target or ":" in target or ".." in target.split("/"):
            raise ValueError("Unsupported slide relationship target")
        result.append(target.lstrip("/") if target.startswith("/") else "ppt/" + target)
    return result


def text_shapes(root):
    """Yield text-bearing drawing objects, including members of nested groups."""
    for shape in root.xpath("//p:sp | //p:graphicFrame", namespaces=NS):
        identity = shape.find("p:nvSpPr/p:cNvPr", NS)
        if identity is None:
            identity = shape.find("p:nvGraphicFramePr/p:cNvPr", NS)
        if identity is not None:
            yield shape, identity


def inspect(path):
    """Return a reproducible inventory of slide geometry and editable text slots."""
    pages = []
    with ZipFile(path) as archive:
        pres = xml(archive.read("ppt/presentation.xml"))
        size = pres.find("p:sldSz", NS)
        for number, part in enumerate(slides(archive), 1):
            root = xml(archive.read(part))
            slots = []
            for shape, identity in text_shapes(root):
                for pi, paragraph in enumerate(shape.findall(".//a:p", NS)):
                    runs = paragraph.findall("a:r", NS)
                    text = "".join(paragraph.xpath(".//a:t/text()", namespaces=NS))
                    if not text:
                        continue
                    slots.append({
                        "shape_id": int(identity.get("id")), "shape_name": identity.get("name"),
                        "paragraph": pi, "text": text,
                        "runs": [{"run": ri, "text": "".join(run.xpath("a:t/text()", namespaces=NS))} for ri, run in enumerate(runs)],
                    })
            pages.append({"slide": number, "part": part, "slots": slots})
        fonts = set()
        for name in archive.namelist():
            if name.startswith("ppt/") and name.endswith(".xml"):
                root = xml(archive.read(name))
                fonts.update(root.xpath("//@typeface"))
    return {"slide_count": len(pages), "width_emu": int(size.get("cx")), "height_emu": int(size.get("cy")), "fonts": sorted(fonts), "slides": pages}


def read_spec(path):
    """Validate the authored JSON fields before touching an Office file."""
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or set(value) - {"selected_slides", "replacements", "edits", "charts"}:
        raise ValueError("Spec accepts selected_slides, replacements, edits, charts only")
    replacements = value.get("replacements", {})
    if not isinstance(replacements, dict) or any(not isinstance(k, str) or not k or not isinstance(v, str) for k, v in replacements.items()):
        raise ValueError("replacements must map nonempty strings to strings")
    edits = value.get("edits", [])
    if not isinstance(edits, list):
        raise ValueError("edits must be an array")
    for edit in edits:
        if not isinstance(edit, dict) or set(edit) - {"slide", "shape_id", "paragraph", "run", "expected_text", "text"}:
            raise ValueError("Unknown edit fields")
        if any(type(edit.get(key)) is not int or edit[key] < minimum for key, minimum in (("slide", 1), ("shape_id", 1), ("paragraph", 0))):
            raise ValueError("Each edit needs positive slide/shape_id and zero-based paragraph")
        if "run" in edit and (type(edit["run"]) is not int or edit["run"] < 0):
            raise ValueError("run must be a zero-based integer")
        if not isinstance(edit.get("text"), str) or not isinstance(edit.get("expected_text"), str):
            raise ValueError("Each edit needs text and exact expected_text strings")
    return value


def fill(source, spec_path, output):
    """Apply exact text edits while retaining untouched ZIP parts and formatting."""
    if source.resolve() == output.resolve() or output.exists():
        raise ValueError("Output must be a new path distinct from the source")
    spec = read_spec(spec_path)
    changes = {}
    found_tokens = set()
    with ZipFile(source) as archive:
        parts = slides(archive)
        selected = spec.get("selected_slides", list(range(1, len(parts) + 1)))
        if not isinstance(selected, list) or not selected or any(type(i) is not int or not 1 <= i <= len(parts) for i in selected) or len(set(selected)) != len(selected):
            raise ValueError("selected_slides must be a nonempty list of distinct existing slide numbers")
        pending = list(spec.get("edits", []))
        if any(edit["slide"] not in selected for edit in pending):
            raise ValueError("Edits must target retained slides")
        for number, part in enumerate(parts, 1):
            if number not in selected:
                continue
            root = xml(archive.read(part))
            changed = False
            for shape, identity in text_shapes(root):
                for pi, paragraph in enumerate(shape.findall(".//a:p", NS)):
                    runs = paragraph.findall("a:r", NS)
                    nodes = paragraph.findall(".//a:t", NS)
                    for edit in pending[:]:
                        if (edit["slide"], edit["shape_id"], edit["paragraph"]) != (number, int(identity.get("id")), pi):
                            continue
                        targets = nodes
                        if "run" in edit:
                            if edit["run"] >= len(runs):
                                raise ValueError(f"Run missing: {edit}")
                            targets = runs[edit["run"]].findall("a:t", NS)
                        current = "".join(n.text or "" for n in targets)
                        if current != edit["expected_text"] or not targets:
                            raise ValueError(f"Expected text mismatch on slide {number}, shape {identity.get('id')}, paragraph {pi}")
                        targets[0].text = edit["text"]
                        for node in targets[1:]:
                            node.text = ""
                        pending.remove(edit)
                        changed = True
                    # Tokens may span runs in source decks; explicit addresses handle those.
                    for node in nodes:
                        original = node.text or ""
                        pattern = "|".join(re.escape(k) for k in spec.get("replacements", {}))
                        if pattern:
                            def replacement(match):
                                found_tokens.add(match.group())
                                return spec["replacements"][match.group()]
                            node.text = re.sub(pattern, replacement, original)
                            changed |= node.text != original
            if changed:
                changes[part] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        if pending:
            raise ValueError(f"Edit address not found: {pending[0]}")
        unused = set(spec.get("replacements", {})) - found_tokens
        if unused:
            raise ValueError(f"Replacement tokens not found: {sorted(unused)}")
        if selected != list(range(1, len(parts) + 1)):
            root = xml(archive.read("ppt/presentation.xml"))
            listing = root.find("p:sldIdLst", NS)
            entries = list(listing)
            for item in entries:
                listing.remove(item)
            for number in selected:
                listing.append(entries[number - 1])
            changes["ppt/presentation.xml"] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        output.parent.mkdir(parents=True, exist_ok=True)
        # Build privately and publish only after all edits and chart validation succeed.
        with tempfile.TemporaryDirectory(prefix=".ppt-build-", dir=output.parent) as temp:
            draft = Path(temp) / "draft.pptx"
            with ZipFile(draft, "w") as target:
                for entry in archive.infolist():
                    target.writestr(entry, changes.get(entry.filename, archive.read(entry.filename)))
            apply_charts(draft, spec.get("charts", []))
            draft.rename(output)
    return {"output": str(output), "slides": len(selected), "edited_parts": sorted(changes), "charts": len(spec.get("charts", []))}


def apply_charts(path, edits):
    """Update native category charts and their embedded workbooks with python-pptx."""
    if not edits:
        return
    if not isinstance(edits, list):
        raise ValueError("charts must be an array")
    presentation = Presentation(path)
    for edit in edits:
        if not isinstance(edit, dict) or set(edit) != {"slide", "shape_id", "categories", "series"}:
            raise ValueError("Chart edit fields: slide, shape_id, categories, series")
        if type(edit["slide"]) is not int or not 1 <= edit["slide"] <= len(presentation.slides):
            raise ValueError("Chart slide is out of range (uses output slide order)")
        categories, series = edit["categories"], edit["series"]
        if not isinstance(categories, list) or not categories or any(not isinstance(c, str) for c in categories):
            raise ValueError("Chart categories must be nonempty strings")
        if not isinstance(series, list) or not series:
            raise ValueError("Chart series must be a nonempty array")
        data = CategoryChartData()
        data.categories = categories
        for item in series:
            if not isinstance(item, dict) or set(item) != {"name", "values"} or not isinstance(item["name"], str) or not isinstance(item["values"], list) or len(item["values"]) != len(categories):
                raise ValueError("Series name/values must align with categories")
            if any(type(n) not in (int, float) or not math.isfinite(n) for n in item["values"]):
                raise ValueError("Chart values must be finite numbers")
            data.add_series(item["name"], item["values"])
        def walk(shapes):
            for shape in shapes:
                yield shape
                if hasattr(shape, "shapes"):
                    yield from walk(shape.shapes)
        shape = next((s for s in walk(presentation.slides[edit["slide"] - 1].shapes) if s.shape_id == edit["shape_id"]), None)
        if shape is None or not shape.has_chart:
            raise ValueError("Chart shape_id not found")
        shape.chart.replace_data(data)
    presentation.save(path)


def validate(path):
    """Check ZIP integrity, native elements, unresolved tokens, and geometry risks."""
    inventory = inspect(path)
    presentation = Presentation(path)
    errors, risks = [], []
    charts, tables, texts = 0, 0, 0
    def walk(shapes):
        for shape in shapes:
            yield shape
            if hasattr(shape, "shapes"):
                yield from walk(shape.shapes)
    with ZipFile(path) as archive:
        broken = archive.testzip()
        if broken:
            errors.append(f"Corrupt ZIP entry: {broken}")
    for number, slide in enumerate(presentation.slides, 1):
        for shape in walk(slide.shapes):
            label = f"slide {number} shape {shape.shape_id}"
            if shape.left < 0 or shape.top < 0 or shape.left + shape.width > presentation.slide_width + 9144 or shape.top + shape.height > presentation.slide_height + 9144:
                risks.append(label + ": drawing extends beyond slide; inspect intended bleed")
            charts += int(shape.has_chart)
            tables += int(shape.has_table)
            frames = []
            if shape.has_text_frame:
                frames.append((shape.text_frame, shape.width, shape.height))
            if shape.has_table:
                for row_index, row in enumerate(shape.table.rows):
                    for col_index, cell in enumerate(row.cells):
                        if not cell.is_spanned:
                            frames.append((cell.text_frame, shape.table.columns[col_index].width, row.height))
            for frame, width, height in frames:
                texts += 1
                if re.search(r"\{\{[^{}]+\}\}", frame.text):
                    errors.append(label + ": unresolved template token")
                # Estimate only; actual text fit requires renderer/image inspection.
                available_width = max(1, (width - frame.margin_left - frame.margin_right) / 12700)
                available_height = max(1, (height - frame.margin_top - frame.margin_bottom) / 12700)
                estimate = 0
                for paragraph in frame.paragraphs:
                    if not paragraph.text:
                        continue
                    size = max([r.font.size.pt for r in paragraph.runs if r.font.size] or [paragraph.font.size.pt if paragraph.font.size else 18])
                    units = sum(1 if unicodedata.east_asian_width(c) in "WF" else 0.55 for c in paragraph.text)
                    lines = max(1, math.ceil(units * size / available_width))
                    estimate += lines * size * 1.18
                if estimate > available_height * 1.12:
                    risks.append(label + f": estimated text height {estimate:.0f}pt exceeds {available_height:.0f}pt; visually inspect")
    return {"file": str(path), "slide_count": len(presentation.slides), "dimensions_inches": [round(presentation.slide_width / 914400, 4), round(presentation.slide_height / 914400, 4)], "native_charts": charts, "native_tables": tables, "text_frames": texts, "fonts": inventory["fonts"], "errors": errors, "visual_review_required": risks, "fit_status": "geometry heuristic only; render every final slide"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for command in ("inspect", "validate"):
        item = sub.add_parser(command)
        item.add_argument("input", type=Path)
        item.add_argument("--output", type=Path)
    item = sub.add_parser("fill")
    item.add_argument("input", type=Path)
    item.add_argument("spec", type=Path)
    item.add_argument("output", type=Path)
    args = parser.parse_args()
    try:
        result = fill(args.input, args.spec, args.output) if args.command == "fill" else (inspect(args.input) if args.command == "inspect" else validate(args.input))
        rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
        if args.command != "fill" and args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(rendered, encoding="utf-8")
        else:
            print(rendered, end="")
        return 1 if result.get("errors") else 0
    except (ValueError, KeyError, OSError, etree.XMLSyntaxError) as error:
        print(f"deck {args.command} failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
