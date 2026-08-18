# IIM CV Editor Skill

Use this skill when editing `CV package/iim_editor.html` or helping a user modify the IIM-style CV package.

## Files

- Main editor: `CV package/iim_editor.html`
- Static CV: `CV package/india.html`
- Assets: `CV package/assets/`
- Package guide: `CV package/AGENTS.md`

## Core rule

For content changes, edit the JSON data model, not the rendered HTML.

The JSON lives inside:

```html
<script type="application/json" id="defaultData">
...
</script>
```

The left-side input box in the browser uses this same schema.

## JSON schema overview

Top-level keys:

- `profile`
- `sectionTitles`
- `education`
- `workExperience`
- `fellowships`
- `publications`
- `achievements`
- `conferences`
- `otherDetails`

### profile

```json
{
  "name": "ANKIT SARAF",
  "subtitle": "Male, 32",
  "address": "...",
  "phone": "...",
  "email": "..."
}
```

### education item

```json
{
  "institution": "IIM Ahmedabad",
  "degree": "Ph.D Programme in Management",
  "gpa": "3.459/4.33",
  "year": "--",
  "hallmarks": "2015 - Present"
}
```

### workExperience item

```json
{
  "organization": "Organization Name",
  "dates": "Month Year-Month Year",
  "title": "Role Title",
  "bullets": ["Bullet one", "Bullet two"]
}
```

### fellowship item

```json
{
  "name": "Fellowship Name",
  "dates": "Month-Month Year",
  "pageBreakBefore": false,
  "bullets": ["Bullet one"]
}
```

Set `pageBreakBefore` to `true` when an item should start page 2.

## Inline formatting

Inside strings:

- `**bold**` becomes bold in visual mode
- `[label](url)` becomes a visual link
- ATS mode strips these into plain text

Do not use raw HTML inside JSON strings unless specifically requested.

## Adding content safely

When adding a new role:

1. Add one object to `workExperience`.
2. Keep dates short.
3. Use concise bullet strings.
4. Preview both modes.
5. Check export PDF still fits.

When adding long publications/conferences:

1. Add strings to the relevant array.
2. Prefer one publication per string.
3. If page 2 overflows, shorten text or reduce font size only as a last resort.

## Removing content safely

Remove entire objects or strings from arrays. Ensure JSON remains valid:

- no trailing commas
- balanced braces/brackets
- strings remain quoted

## Formatting preservation rules

The IIM design is dense. Preserve it by avoiding unnecessary CSS changes.

Most important CSS classes:

- `.page`: fixed A4 page and padding
- `.section-title`: grey section bars
- `.edu-table`: table sizing
- `.entry`: entry vertical spacing
- `.entry-head`: organization/date row
- `.entry-role`: role title
- `.bullets`: bullet spacing
- `.footer`: contact footer

## Margins

Do not change print margins through `@page` unless the user explicitly asks. Keep:

```css
@page { size:A4; margin:0 }
```

Change visual margins through `.page` padding:

```css
.page {
  padding:20pt 27pt 34pt 27pt;
}
```

Order is:

```text
padding: top right bottom left
```

Safe margin edits:

- more side margin: increase right/left padding
- more top margin: increase top padding
- more footer room: increase bottom padding

Any margin increase may cause overflow. Check both pages after changing.

## Page overflow workflow

If content spills beyond page boundaries:

1. Shorten bullets first.
2. Remove low-value bullets.
3. Move fellowship content to page 2 using `pageBreakBefore`.
4. Slightly reduce `.page` font-size if absolutely necessary.
5. Slightly reduce `.entry` and `.bullets li` margins if needed.

Avoid changing page width/height.

## Export PDF behavior

The export button should produce the original-looking formatted PDF, not the plain ATS text page.

Expected button:

```text
Export formatted ATS PDF
```

Expected behavior:

- opens a clean print-only window
- includes only the formatted resume pages
- uses A4 size
- uses zero margins
- keeps grey bars/table borders
- text remains selectable

If the export appears broken:

1. Ensure `@page{size:A4;margin:0}` exists.
2. Ensure `.page` has fixed A4 dimensions in print CSS.
3. Ensure the print-only export window includes `visualMount.innerHTML`.
4. Tell the user to choose A4, Save as PDF, and enable background graphics.

## ATS mode

ATS mode uses `buildATSText(data)`. It should be plain text and readable top-to-bottom.

Do not make ATS mode rely on visual HTML tables. It should come directly from JSON.

## Browser note

Use Chrome for best export consistency. Safari may handle page breaks and background printing differently.
