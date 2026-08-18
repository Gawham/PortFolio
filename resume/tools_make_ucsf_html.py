#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path
import fitz

SRC = Path('UCSF')
OUT = Path('USA CV package')
ASSETS = OUT / 'assets'
OUT.mkdir(exist_ok=True)
ASSETS.mkdir(exist_ok=True)

PDFS = [
    ('ResearcherCV1-Nov2025.pdf', 'usa_researcher_cv.html', 'USA Researcher CV - UCSF Format'),
    ('ResearcherConsultingResume-Nov2025.pdf', 'usa_consulting_resume.html', 'USA Consulting Resume - UCSF Format'),
    ('ResearcherMedicalWritingResume-Nov2025.pdf', 'usa_medical_writing_resume.html', 'USA Medical Writing Resume - UCSF Format'),
]


def safe_name(name: str) -> str:
    return re.sub(r'[^A-Za-z0-9_.+-]+', '_', name).strip('_') or 'asset'


def color_hex(c):
    if c is None:
        return 'none'
    if isinstance(c, int):
        return f'#{(c >> 16) & 255:02x}{(c >> 8) & 255:02x}{c & 255:02x}'
    if isinstance(c, (tuple, list)) and len(c) >= 3:
        return '#%02x%02x%02x' % tuple(max(0, min(255, round(v * 255))) for v in c[:3])
    return '#000000'


def font_format(ext: str) -> str:
    return {'ttf': 'truetype', 'otf': 'opentype', 'woff': 'woff', 'woff2': 'woff2'}.get(ext.lower(), 'truetype')


def extract_fonts(doc: fitz.Document, prefix: str):
    css, seen = [], set()
    for page in doc:
        for font in page.get_fonts(full=True):
            xref = font[0]
            try:
                name, ext, _typ, data = doc.extract_font(xref)
            except Exception:
                continue
            if not data or ext == 'n/a':
                continue
            family = name.split('+')[-1]
            key = (family, ext)
            if key in seen:
                continue
            seen.add(key)
            fname = f'{prefix}_{safe_name(family)}.{ext}'
            (ASSETS / fname).write_bytes(data)
            css.append(
                f"@font-face{{font-family:'{html.escape(family)}';src:url('assets/{fname}') format('{font_format(ext)}');font-weight:normal;font-style:normal;}}"
            )
    return css


def path_from_drawing_item(item):
    op = item[0]
    if op == 'l':
        p1, p2 = item[1], item[2]
        return f'M {p1.x:.3f} {p1.y:.3f} L {p2.x:.3f} {p2.y:.3f}'
    if op == 're':
        r = item[1]
        return None
    if op == 'c':
        p1, p2, p3, p4 = item[1], item[2], item[3], item[4]
        return f'M {p1.x:.3f} {p1.y:.3f} C {p2.x:.3f} {p2.y:.3f} {p3.x:.3f} {p3.y:.3f} {p4.x:.3f} {p4.y:.3f}'
    if op == 'qu':
        q = item[1]
        return f'M {q.ul.x:.3f} {q.ul.y:.3f} L {q.ur.x:.3f} {q.ur.y:.3f} L {q.lr.x:.3f} {q.lr.y:.3f} L {q.ll.x:.3f} {q.ll.y:.3f} Z'
    return None


def make_html(pdf_path: Path, out_name: str, title: str):
    prefix = safe_name(Path(out_name).stem)
    doc = fitz.open(pdf_path)
    font_css = extract_fonts(doc, prefix)
    parts = [f'''<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>
{chr(10).join(font_css)}
html,body{{margin:0;padding:0;background:#e8e8e8;}}
body{{-webkit-font-smoothing:antialiased;}}
.toolbar{{position:sticky;top:0;z-index:50;background:#111827;color:white;font:14px Arial,sans-serif;padding:10px 14px;display:flex;gap:10px;align-items:center;}}
.toolbar button{{border:0;border-radius:8px;padding:8px 11px;font-weight:700;cursor:pointer;}}
.toolbar .primary{{background:#60a5fa;color:#06101f;}}
.toolbar small{{opacity:.8;}}
.pdf-page{{position:relative;margin:24px auto;background:white;box-shadow:0 1px 9px rgba(0,0,0,.28);overflow:hidden;}}
.drawings{{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;}}
.pdf-img{{position:absolute;z-index:2;user-select:none;pointer-events:none;}}
.t{{position:absolute;z-index:3;white-space:pre;line-height:1;transform-origin:left top;}}
.t[contenteditable="true"]:focus{{outline:1px dotted #2563eb;background:rgba(96,165,250,.08);}}
@page{{size:letter;margin:0;}}
@media print{{html,body{{background:white;}}.toolbar{{display:none;}}.pdf-page{{margin:0;box-shadow:none;page-break-after:always;break-after:page;}}.pdf-page:last-child{{page-break-after:auto;break-after:auto;}}}}
</style></head><body>
<div class="toolbar"><strong>{html.escape(title)}</strong><button class="primary" onclick="window.print()">Export formatted PDF</button><small>Click text to edit. Print/Save as PDF with Letter paper, margins none, background graphics on.</small></div>''']

    for pi, page in enumerate(doc, start=1):
        w, h = page.rect.width, page.rect.height
        parts.append(f'<section class="pdf-page" style="width:{w:.3f}pt;height:{h:.3f}pt" aria-label="{html.escape(title)} page {pi}">')
        parts.append(f'<svg class="drawings" viewBox="0 0 {w:.3f} {h:.3f}" preserveAspectRatio="none">')
        for dr in page.get_drawings():
            fill = color_hex(dr.get('fill')) if dr.get('fill') is not None else 'none'
            stroke = color_hex(dr.get('color')) if dr.get('color') is not None else 'none'
            # Skip UCSF blue diagonal SAMPLE watermark vector paths.
            if fill.lower() == '#178ccb' or stroke.lower() == '#178ccb':
                continue
            sw = dr.get('width') or 0
            close = bool(dr.get('closePath'))
            for item in dr.get('items', []):
                if item[0] == 're':
                    r = item[1]
                    parts.append(f'<rect x="{r.x0:.3f}" y="{r.y0:.3f}" width="{r.width:.3f}" height="{r.height:.3f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw:.3f}"/>')
                else:
                    d = path_from_drawing_item(item)
                    if d:
                        if close and not d.endswith('Z'):
                            d += ' Z'
                        parts.append(f'<path d="{d}" fill="{fill}" stroke="{stroke if stroke != "none" else fill}" stroke-width="{sw or 0.5:.3f}"/>')
        parts.append('</svg>')

        text_dict = page.get_text('dict')
        # Skip embedded UCSF footer/logo images for clean user-facing resumes.

        for b in text_dict['blocks']:
            if b.get('type') != 0:
                continue
            for line in b.get('lines', []):
                for s in line.get('spans', []):
                    txt = s.get('text', '')
                    if not txt:
                        continue
                    x0, y0, x1, y1 = s['bbox']
                    fam = s.get('font', 'TimesNewRomanPSMT').split('+')[-1]
                    flags = s.get('flags', 0)
                    italic = 'italic' if flags & 2 else 'normal'
                    weight = '700' if flags & 16 else '400'
                    style = (
                        f"left:{x0:.3f}pt;top:{y0:.3f}pt;width:{x1-x0:.3f}pt;height:{y1-y0:.3f}pt;"
                        f"font-family:'{html.escape(fam)}', 'Times New Roman', Arial, serif;font-size:{s.get('size', 10):.3f}pt;"
                        f"font-style:{italic};font-weight:{weight};color:{color_hex(s.get('color', 0))};"
                    )
                    parts.append(f'<span class="t" contenteditable="true" spellcheck="false" style="{style}">{html.escape(txt)}</span>')
        parts.append('</section>')
    parts.append('</body></html>')
    (OUT / out_name).write_text('\n'.join(parts), encoding='utf-8')


def main():
    for pdf, out, title in PDFS:
        make_html(SRC / pdf, out, title)
    (OUT / 'README.txt').write_text('''USA CV package\n\nOpen one of these HTML files in Chrome:\n\n- usa_researcher_cv.html\n- usa_consulting_resume.html\n- usa_medical_writing_resume.html\n\nClick text directly to edit. Use Export formatted PDF, then Save as PDF. Use Letter paper, no margins, and enable background graphics if grey bars/logos disappear.\n\nThe assets folder must stay next to the HTML files.\n''')
    index = '''<!doctype html><html><head><meta charset="utf-8"><title>USA CV Package</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:48px auto;line-height:1.5}a{display:block;margin:12px 0;font-size:20px}</style></head><body><h1>USA CV Package</h1><p>Editable UCSF/USA resume set. Open a template below.</p><a href="usa_researcher_cv.html">USA Researcher CV</a><a href="usa_consulting_resume.html">USA Consulting Resume</a><a href="usa_medical_writing_resume.html">USA Medical Writing Resume</a></body></html>'''
    (OUT / 'index.html').write_text(index)
    print(f'Wrote {OUT}')

if __name__ == '__main__':
    main()
