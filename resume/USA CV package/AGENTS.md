# AGENTS.md — USA CV Package

This package contains high-fidelity editable HTML extractions of the UCSF/USA resume examples.

## Main files

- `index.html` — package landing page
- `usa_researcher_cv.html` — two-page researcher CV
- `usa_consulting_resume.html` — one-page consulting resume
- `usa_medical_writing_resume.html` — two-page medical writing resume
- `assets/` — embedded fonts and page images required by the HTML files
- `source_pdfs/` — original UCSF PDF references

## Editing model

These USA templates are fixed-layout PDF extractions. Unlike the IIM JSON editor, each text run is positioned exactly on the page and is directly editable in the preview.

To edit:

1. Open an HTML file in Chrome.
2. Click the text you want to change.
3. Type the replacement text.
4. Use `Export formatted PDF` and choose Save as PDF.

## Preserving layout

Because this is fixed-layout extraction, the safest edits are same-length or shorter text replacements.

Good edits:

- Replace a name with a similar-length name.
- Replace a bullet with a shorter bullet.
- Replace dates with similar-length dates.
- Replace school/company names without greatly increasing length.

Risky edits:

- Long paragraphs in short fields.
- Multi-line additions inside a single positioned text span.
- Changing page width/height.
- Removing assets.

## Adding entries

These files are not JSON-driven. To add a new entry, duplicate nearby HTML spans or edit the source PDF/Word document and re-run extraction.

Best practice:

1. Prefer replacing existing sample entries.
2. If you must add a new line, copy a nearby `<span class="t" ...>` line.
3. Adjust only `top`, `left`, and text content.
4. Keep font-family/font-size consistent with nearby entries.
5. Re-check print export.

## Removing entries

Remove the relevant `<span class="t" ...>text</span>` elements. If there are bullet symbols on separate spans, remove those too.

Do not remove the page `<section>` or required CSS.

## Margins and page size

These templates are US Letter size:

```css
@page { size: letter; margin: 0; }
.pdf-page { width: 612pt; height: 792pt; }
```

To preserve the original UCSF PDF layout:

- keep `@page size:letter`
- keep `@page margin:0`
- keep `.pdf-page` width/height fixed
- export with Letter paper and no margins

Do not use A4 for this USA set.

## Exporting

Use Chrome for best results.

1. Click `Export formatted PDF`.
2. Choose `Save as PDF`.
3. Paper size: Letter.
4. Margins: None.
5. Enable background graphics if grey bars/logo/watermark do not appear.

## Assets

The `assets/` folder contains extracted fonts and page images, including UCSF footer/logo and watermark images. Keep it next to the HTML files.

## Re-extraction

The extraction script is at repository root:

```bash
python3 tools_make_ucsf_html.py
```

It reads from `UCSF/*.pdf` and rewrites `USA CV package/`.
