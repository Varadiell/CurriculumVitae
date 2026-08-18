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
