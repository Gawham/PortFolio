# Examples — IIM CV Editor

## Add a work experience

Add this object inside the `workExperience` array:

```json
{
  "organization": "Example University, City",
  "dates": "Jan 2024-Present",
  "title": "Research Manager",
  "bullets": [
    "**Led** a cross-functional research project with 12 team members",
    "Developed monitoring dashboards and quality control workflows",
    "Prepared reports for senior stakeholders and partner organizations"
  ]
}
```

## Add a linked item

```json
"[Project Name](https://example.com)- Managed rollout, coordination, and reporting across partner teams"
```

Visual output: blue underlined `Project Name`.

ATS output: `Project Name- Managed rollout...`

## Add a fellowship on page 2

```json
{
  "name": "Intern, Example Organization",
  "dates": "May-June 2024",
  "pageBreakBefore": true,
  "bullets": [
    "Built training resources for new fellows",
    "Coordinated outreach with schools and partner organizations"
  ]
}
```

## Shorten an overflowing bullet

Bad:

```json
"Responsible for designing, coordinating, implementing, monitoring, evaluating, and presenting a very large multi-stakeholder project across many different teams and organizations with many different outputs and deliverables"
```

Better:

```json
"**Led** design, coordination, monitoring, and reporting for a multi-stakeholder project"
```

## Adjust side margins

Find `.page` in CSS:

```css
.page {
  padding:20pt 27pt 34pt 27pt;
}
```

Increase left/right margins:

```css
.page {
  padding:20pt 32pt 34pt 32pt;
}
```

Then check if the PDF still fits.

## Make content fit better

Slightly reduce spacing:

```css
.entry{margin:5.2pt 0 0}
.bullets li{margin:1.9pt 0}
```

Reduce carefully. Too little spacing hurts readability.

## Export checklist

Before final export:

1. Click `What we see`.
2. Confirm page 1 and page 2 look right.
3. Click `What ATS sees`.
4. Confirm text order is correct.
5. Click `Export formatted ATS PDF`.
6. In browser print dialog choose Save as PDF.
7. Use A4 paper and enable background graphics if grey bars disappear.
