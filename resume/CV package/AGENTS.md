# AGENTS.md — CV Package Editing Guide

This package contains a browser-based editor for the IIM-style CV.

Primary file:

- `iim_editor.html` — live editor, visual preview, ATS preview, formatted PDF export

Supporting files:

- `assets/` — fonts and assets required by the editor/static CV
- `india.html` — static editable copy of the IIM CV

## How the editor works

`iim_editor.html` stores the resume content as JSON inside:

```html
<script type="application/json" id="defaultData">
...
</script>
```

At runtime, the left-side input box displays this JSON. Editing the JSON updates the visual resume and the ATS view.

The user's edits are also saved to browser `localStorage`, so if you edit `defaultData` in the HTML file but the browser still shows old content, click **Reset** in the editor or clear local storage.

## Editing values

Edit content in the left JSON panel. Keep valid JSON:

- strings must use double quotes
- arrays use `[ ... ]`
- objects use `{ ... }`
- no trailing commas

Example entry:

```json
{
  "organization": "Azim Premji University (APU), Bengaluru",
  "dates": "May-August 2020",
  "title": "Project Manager",
  "bullets": [
    "**Led** project planning and coordination across teams"
  ]
}
```

Supported inline formatting in content strings:

- `**bold text**` renders bold visually and plain text in ATS view
- `[Link Text](https://example.com)` renders as a blue link visually and plain text in ATS view

## Adding entries

To add a work experience, add a new object to `workExperience`:

```json
{
  "organization": "New Organization",
  "dates": "Jan 2024-Present",
  "title": "New Role",
  "bullets": [
    "First responsibility or achievement",
    "Second responsibility or achievement"
  ]
}
```

To add fellowships/internships, add to `fellowships`:

```json
{
  "name": "Fellowship Name",
  "dates": "June-August 2024",
  "pageBreakBefore": false,
  "bullets": ["What you did"]
}
```

Use `"pageBreakBefore": true` to force that fellowship to begin on page 2.

## Removing entries

Remove the entire object from the relevant array. Be careful with commas.

Correct:

```json
"workExperience": [
  { "organization": "A", "dates": "2020", "title": "Role", "bullets": [] },
  { "organization": "B", "dates": "2021", "title": "Role", "bullets": [] }
]
```

If removing the second item, also remove the comma after the first item if it becomes the last item.

## Preserving formatting

The visual format is dense and designed to fit two A4 pages. To preserve the original IIM look:

1. Keep bullet text concise.
2. Prefer 2-5 bullets per major role.
3. Avoid very long institution names in the education table.
4. Keep dates short, e.g. `June 2013-June 2015`.
5. Do not add large paragraphs without bullets.
6. Use `pageBreakBefore` for fellowships if page 1 overflows.

The CSS controlling page density is in the `<style>` block of `iim_editor.html`.

Important classes:

- `.page` — A4 page size, base font, page padding
- `.section-title` — grey section bars
- `.edu-table` — education table
- `.entry` — each work/fellowship block
- `.entry-head` — organization/date row
- `.entry-role` — role/title row
- `.bullets` — bullet list spacing
- `.footer` — bottom contact line

## Margins and page size

The current export is configured for A4 with zero browser print margins:

```css
@page { size:A4; margin:0 }
```

The visual page itself uses:

```css
.page {
  width:595.32pt;
  min-height:841.92pt;
  padding:20pt 27pt 34pt 27pt;
}
```

These values match A4 dimensions. To change margins while preserving format:

- increase/decrease `.page` padding, not `@page` margin
- keep `@page margin:0`
- keep `.page` width/height fixed to A4

Recommended safe edits:

- More left/right whitespace: change `padding:20pt 27pt 34pt 27pt` to `padding:20pt 32pt 34pt 32pt`
- More top whitespace: increase first padding value
- More footer room: increase bottom padding value

After changing padding, check that content still fits two pages.

## Handling overflow

If page 1 overflows:

1. Shorten bullet text.
2. Move a fellowship to page 2 by setting `pageBreakBefore: true`.
3. Reduce bullet count.
4. As a last resort, slightly reduce `.page` font-size.

Current compact settings are intentionally tuned to keep the original content close to two pages.

Avoid shrinking font-size too much, because the PDF will stop matching the original IIM reference.

## Export behavior

The button **Export formatted ATS PDF** opens a clean print-only window containing only the formatted resume. In the print dialog, choose **Save as PDF**.

Export goals:

- visual format similar to `india.pdf`
- selectable text
- ATS-readable ordering
- no editor sidebar in output
- no logo

For best PDF export:

- use Chrome
- choose `Save as PDF`
- paper size: A4
- margins: none/default zero if available
- enable background graphics if the grey bars do not appear

## ATS view

The **What ATS sees** mode is generated from the same JSON. It strips visual styling, markdown, and links into plain text.

When changing structure, make sure both visual and ATS views remain correct.

## Do not delete

Do not delete:

- `assets/` folder
- font files in `assets/`
- the `defaultData` JSON script tag
- the JavaScript functions below the JSON

The editor requires all of these.
