# USA CV Editing Examples

## Replace a name

Find a span containing the old name:

```html
<span class="t" ...>Ned Stark</span>
```

Change only the text:

```html
<span class="t" ...>Jane Smith</span>
```

## Replace a bullet

Good replacement:

```text
Led market research and synthesized findings for executive stakeholders
```

Avoid very long replacements that exceed the original line width.

## Move a line down

Change only the `top` value:

```html
style="left:72.000pt;top:310.000pt;..."
```

to:

```html
style="left:72.000pt;top:324.000pt;..."
```

## Add a similar line

Copy a nearby span:

```html
<span class="t" contenteditable="true" spellcheck="false" style="left:72pt;top:400pt;font-family:'TimesNewRomanPSMT';font-size:10pt;">Original line</span>
```

Paste below and increase top:

```html
<span class="t" contenteditable="true" spellcheck="false" style="left:72pt;top:414pt;font-family:'TimesNewRomanPSMT';font-size:10pt;">New line</span>
```

## Export checklist

1. Open the edited HTML in Chrome.
2. Confirm it looks correct visually.
3. Click `Export formatted PDF`.
4. Save as PDF.
5. Use Letter paper, not A4.
6. Use no margins.
7. Enable background graphics if needed.
