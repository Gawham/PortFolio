#!/usr/bin/env python3
"""Generate editable 1:1 HTML copies from the reference PDFs/DOCX files.

The DOCX references are first converted to PDF with LibreOffice so page breaks,
tabs, rules, and wrapping are preserved. Then Poppler pdftohtml creates an
absolute-positioned HTML layer with correct Unicode text plus a background image
containing the non-text vector artwork/rules. The text paragraphs are marked
contenteditable.
"""
from __future__ import annotations

import html
import re
import shutil
import subprocess
from pathlib import Path

import fitz

ROOT = Path('.')
OUT = ROOT / 'editable_html'
ASSETS = OUT / 'assets'
CONVERTED = ROOT / 'converted_pdf'
OUT.mkdir(exist_ok=True)
ASSETS.mkdir(exist_ok=True)
CONVERTED.mkdir(exist_ok=True)

ZOOM = '1.333333'  # 72pt PDF units -> 96 CSS pixels, so pages print at real size.


def safe_name(name: str) -> str:
    return re.sub(r'[^A-Za-z0-9_.+-]+', '_', name).strip('_') or 'asset'


def convert_docx_references() -> None:
    targets = [
        Path('internationa/Resume Template - SheetsResume.com - 2025.docx'),
        Path('internationa/Student Resume Template - SheetsResume.com - 2025.docx'),
    ]
    expected = [CONVERTED / (p.stem + '.pdf') for p in targets]
    if all(p.exists() for p in expected):
        return
    soffice = shutil.which('soffice') or '/Applications/LibreOffice.app/Contents/MacOS/soffice'
    if not Path(soffice).exists():
        raise RuntimeError('LibreOffice soffice not found; cannot convert DOCX references to PDF.')
    subprocess.run([soffice, '--headless', '--convert-to', 'pdf', '--outdir', str(CONVERTED), *map(str, targets)], check=True)


def normalize_font_families(css_html: str) -> str:
    """Map PDF subset font names to normal system font families.

    Embedded PDF subset fonts use custom glyph encodings; using them directly in
    a browser garbles otherwise-correct Unicode text. System equivalents keep
    the text readable/editable while preserving the source layout closely.
    """
    def family_for(raw: str) -> str:
        fam = raw.strip().strip('"\'')
        base = fam.split('+')[-1]
        if 'TimesNewRoman' in base:
            return "'Times New Roman', Times, serif"
        if 'CourierNew' in base:
            return "'Courier New', monospace"
        if 'Constantia' in base:
            return "Constantia, Georgia, serif"
        if 'Garamond' in base:
            return "Garamond, 'Times New Roman', serif"
        if 'Caladea' in base:
            return "Caladea, 'Times New Roman', serif"
        if 'Wingdings' in base:
            return "Wingdings, Symbol, serif"
        if 'Symbol' in base:
            return "Symbol, serif"
        if 'Arial' in base:
            return "Arial, sans-serif"
        return "'Times New Roman', Times, serif"

    return re.sub(r'font-family:([^;{}]+);', lambda m: f"font-family:{family_for(m.group(1))};", css_html)


def color_hex(c):
    if c is None:
        return 'none'
    if isinstance(c, int):
        return f'#{(c >> 16) & 255:02x}{(c >> 8) & 255:02x}{c & 255:02x}'
    if isinstance(c, (tuple, list)) and len(c) >= 3:
        return '#%02x%02x%02x' % tuple(max(0, min(255, round(v * 255))) for v in c[:3])
    return '#000000'


def make_india_absolute(pdf_path: Path, out_name: str, title: str) -> None:
    """Use PyMuPDF for the India PDF because its embedded Constantia/Garamond
    fonts decode cleanly and give a closer 1:1 match than pdftohtml fallback.
    """
    doc = fitz.open(pdf_path)
    font_css, seen = [], set()
    for page in doc:
        for xref, _ext, _type, _basefont, _name, _enc, _ in page.get_fonts(full=True):
            try:
                name, font_ext, _font_type, data = doc.extract_font(xref)
            except Exception:
                continue
            if not data or font_ext == 'n/a':
                continue
            family = name.split('+')[-1]
            if family in seen:
                continue
            seen.add(family)
            fname = f'india_abs_{safe_name(family)}.{font_ext}'
            (ASSETS / fname).write_bytes(data)
            font_css.append(f"@font-face{{font-family:'{family}';src:url('assets/{fname}') format('truetype');font-weight:normal;font-style:normal;}}")

    parts = [f'''<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>
{chr(10).join(font_css)}
html,body{{margin:0;padding:0;background:#e9e9e9;}}
body{{-webkit-font-smoothing:antialiased;}}
.pdf-page{{position:relative;margin:24px auto;background:white;box-shadow:0 1px 9px rgba(0,0,0,.28);overflow:hidden;}}
.drawings{{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;}}
.pdf-img{{position:absolute;z-index:2;}}
.t{{position:absolute;z-index:3;white-space:pre;line-height:1;transform-origin:left top;}}
.t:focus{{outline:1px dotted #7aa7ff;}}
@media print{{html,body{{background:white;}}.pdf-page{{margin:0;box-shadow:none;page-break-after:always;}}}}
</style></head><body>''']

    for pi, page in enumerate(doc, start=1):
        w, h = page.rect.width, page.rect.height
        parts.append(f'<section class="pdf-page" style="width:{w:.3f}pt;height:{h:.3f}pt" aria-label="{html.escape(title)} page {pi}">')
        parts.append(f'<svg class="drawings" viewBox="0 0 {w:.3f} {h:.3f}" preserveAspectRatio="none">')
        for dr in page.get_drawings():
            fill = color_hex(dr.get('fill')) if dr.get('fill') is not None else 'none'
            stroke = color_hex(dr.get('color')) if dr.get('color') is not None else 'none'
            sw = dr.get('width') or 0
            for item in dr.get('items', []):
                if item[0] == 're':
                    r = item[1]
                    parts.append(f'<rect x="{r.x0:.3f}" y="{r.y0:.3f}" width="{r.width:.3f}" height="{r.height:.3f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw:.3f}"/>')
                elif item[0] == 'l':
                    p1, p2 = item[1], item[2]
                    parts.append(f'<line x1="{p1.x:.3f}" y1="{p1.y:.3f}" x2="{p2.x:.3f}" y2="{p2.y:.3f}" stroke="{stroke if stroke != "none" else fill}" stroke-width="{sw or 0.5:.3f}"/>')
        parts.append('</svg>')

        text_dict = page.get_text('dict')
        img_i = 0
        for b in text_dict['blocks']:
            if b['type'] == 1:
                ext = b.get('ext', 'png')
                img_name = f'india_abs_p{pi}_img{img_i}.{ext}'
                (ASSETS / img_name).write_bytes(b['image'])
                x0, y0, x1, y1 = b['bbox']
                parts.append(f'<img class="pdf-img" src="assets/{img_name}" style="left:{x0:.3f}pt;top:{y0:.3f}pt;width:{x1-x0:.3f}pt;height:{y1-y0:.3f}pt" alt="">')
                img_i += 1
        for b in text_dict['blocks']:
            if b['type'] != 0:
                continue
            for line in b['lines']:
                for s in line['spans']:
                    txt = s.get('text', '')
                    if not txt:
                        continue
                    x0, y0, x1, y1 = s['bbox']
                    fam = s.get('font', 'Garamond')
                    style = f"left:{x0:.3f}pt;top:{y0:.3f}pt;width:{x1-x0:.3f}pt;height:{y1-y0:.3f}pt;font-family:'{fam}', Garamond, serif;font-size:{s.get('size', 10):.3f}pt;color:{color_hex(s.get('color', 0))};"
                    parts.append(f'<span class="t" contenteditable="true" spellcheck="false" style="{style}">{html.escape(txt)}</span>')
        parts.append('</section>')
    parts.append('</body></html>')
    (OUT / out_name).write_text('\n'.join(parts), encoding='utf-8')


def pdf_to_editable_html(pdf_path: Path, out_name: str, title: str, prefix: str) -> None:
    pdftohtml = shutil.which('pdftohtml') or '/opt/homebrew/bin/pdftohtml'
    if not Path(pdftohtml).exists():
        raise RuntimeError('pdftohtml not found.')

    out_prefix = ASSETS / f'{prefix}_page'
    # Clean old generated background files for this prefix.
    for old in ASSETS.glob(f'{prefix}_page*'):
        old.unlink()

    subprocess.run(
        [pdftohtml, '-q', '-c', '-s', '-noframes', '-fontfullname', '-zoom', ZOOM, str(pdf_path), str(out_prefix)],
        check=True,
    )
    generated_html = out_prefix.with_suffix('.html')
    raw = generated_html.read_text(encoding='utf-8')

    extra_css = f"""
<style>
html,body{{margin:0;padding:0;background:#e9e9e9;}}
body{{-webkit-font-smoothing:antialiased;}}
.pdf-page{{margin:24px auto;background:white;box-shadow:0 1px 9px rgba(0,0,0,.28);overflow:hidden;}}
.pdf-page img:first-child{{position:absolute;left:0;top:0;z-index:1;user-select:none;pointer-events:none;}}
.pdf-page p{{z-index:2;}}
.pdf-page a{{color:inherit;text-decoration:none;}}
p[contenteditable="true"]:focus{{outline:1px dotted #7aa7ff;}}
@media print{{html,body{{background:white;}}.pdf-page{{margin:0;box-shadow:none;page-break-after:always;}}}}
</style>
"""

    raw = normalize_font_families(raw)
    raw = raw.replace('\uf0b7', '•').replace('\uf04a', '☺')
    raw = re.sub(r'<title>.*?</title>', f'<title>{html.escape(title)}</title>', raw, flags=re.S)
    raw = raw.replace('</head>', extra_css + '</head>')
    raw = re.sub(r'<body[^>]*>', '<body>', raw, count=1)
    raw = re.sub(r'<div id="(page\d+-div)" style="([^"]+)">', r'<div id="\1" class="pdf-page" style="\2">', raw)
    raw = re.sub(r'<p ', '<p contenteditable="true" spellcheck="false" ', raw)
    raw = re.sub(r'src="([^"/]+\.png)"', r'src="assets/\1"', raw)

    (OUT / out_name).write_text(raw, encoding='utf-8')


def main() -> None:
    convert_docx_references()
    make_india_absolute(Path('india.pdf'), 'india.html', 'India CV - 1:1 Editable Copy')
    pdf_to_editable_html(CONVERTED / 'Resume Template - SheetsResume.com - 2025.pdf', 'international_cv.html', 'International CV - 1:1 Editable Copy', 'international')
    pdf_to_editable_html(CONVERTED / 'Student Resume Template - SheetsResume.com - 2025.pdf', 'international_student_cv.html', 'International Student CV - 1:1 Editable Copy', 'student')
    print('Wrote 1:1 editable HTML files to editable_html/')


if __name__ == '__main__':
    main()
