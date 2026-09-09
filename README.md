# CurriculumVitae

[Curriculum vitae](https://varadiell.github.io/CurriculumVitae/)

Static resume — no framework, no build step, no runtime dependency.

- `index.html` — content, with `data-i18n` keys on every translatable node
- `css/custom.css` — design tokens, dark/light themes, responsive + A4 print stylesheet
- `js/i18n.js` — FR/EN dictionary
- `js/main.js` — language and theme switching, live age/experience, scroll reveal, animated background

Language (FR/EN) and theme (dark/light) are picked from the browser on first visit,
then remembered in `localStorage`. Keyboard: `L` switches language, `T` switches theme.

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 4173
```

### Print / PDF

Use the print button, `P`, or the browser's print command. The PDF uses the
selected language (FR/EN) and a dedicated A4 layout: one column, selectable
text, Arial, clear section headings, and visible contact URLs. Small decorative
logos accompany technical skills and company names; their labels remain real
text. These images load eagerly so printing does not depend on scrolling first.
The portrait, interface icons, decorative backgrounds and website footer are
omitted. The job title is larger than the name. Experience and education
entries stay together when possible; content flows onto additional
pages if the resume grows. The current content fits two pages at 100% scale.

Choose **Save as PDF**, **A4**, **portrait**, **100% scale**, and turn off the
browser's **headers and footers** to avoid adding a date, URL and page numbers.
Background graphics are optional. Printing also works from the dark theme or
with an active search; search highlighting and badge interaction are restored
after printing or cancelling.

The layout follows [Greenhouse's resume parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse)
by keeping one text column and contact details in the document body. The small
logos never replace text; they have empty alternative text to avoid duplicate
labels in extraction. Graphics can still affect some ATS parsers.
This improves ATS readability, but parsing varies between vendors. To check an
export, select/copy its text into a plain-text editor: name, contact details,
skills, experiences, education and languages should appear in reading order.
Check both languages in print preview after changing the content.
