# USA CV Editor Skill

Use this skill when editing the UCSF/USA fixed-layout CV package.

## Package files

- `USA CV package/index.html`
- `USA CV package/usa_researcher_cv.html`
- `USA CV package/usa_consulting_resume.html`
- `USA CV package/usa_medical_writing_resume.html`
- `USA CV package/assets/`
- `USA CV package/source_pdfs/`

## Important distinction

These templates are fixed-position PDF extractions. They are not JSON-driven like the IIM editor.

Each text item is a positioned span:

```html
<span class="t" contenteditable="true" style="left:...;top:...;font-size:...">Text</span>
```

## Editing content

For normal user edits, open the HTML in Chrome and edit text directly on the page.

For code edits, change only the text inside existing `.t` spans when possible.

Avoid changing:

- page dimensions
- font assets
- print CSS
- image positions
- drawing SVG

## Adding content

Preferred method: replace existing sample content.

If a new line is required:

1. Copy a nearby `.t` span with matching font and size.
2. Paste it near the original span in the HTML.
3. Change the text.
4. Adjust the `top` value to move it down/up.
5. Adjust `left` only if alignment requires it.
6. Verify in Chrome and in PDF export.

For bullets, the bullet symbol and bullet text may be separate spans. Copy both when needed.

## Removing content

Remove the text span and any associated bullet/date spans. Keep the page section intact.

## Layout preservation rules

- Keep replacements similar length or shorter.
- Use the same number of lines where possible.
- Do not insert long text into a single positioned span unless there is enough horizontal space.
- Do not convert to flowing HTML unless the user explicitly wants a lower-fidelity semantic version.

## Margins and export

USA templates use US Letter:

```css
@page { size:letter; margin:0; }
```

The `.pdf-page` size should remain 612pt × 792pt.

Export settings:

- Browser: Chrome
- Destination: Save as PDF
- Paper: Letter
- Margins: None
- Background graphics: On, if needed

## Rebuild command

From repository root:

```bash
python3 tools_make_ucsf_html.py
```

This regenerates the package from the PDFs in `UCSF/`.
