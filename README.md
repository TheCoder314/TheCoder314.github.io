# Aarit Dixit — personal site

Home page for my projects, served at **https://thecoder314.github.io/**.
R.A.M.P.A.T. lives in its own repository and is served at **https://thecoder314.github.io/rampat/**.

## Files

```
index.html              home page
style.css               shared styles for every page
main.js                 small behaviours (drawing animation, copy email)
projects/               one page per project; copy _template.html to start a new one
assets/img/             images, plus rampat-plan.svg (drawn from the R.A.M.P.A.T. CAD)
```

## Add a project

1. Copy `projects/_template.html` to `projects/your-project.html` and fill in the bracketed text.
2. Put its images in `assets/img/`.
3. In `index.html`, copy one of the `<article class="proj">` blocks (see the `ADDING ANOTHER PROJECT` comment).
   Each `<figure class="slide">` inside it is one image in that project's auto-playing gallery.
4. Tag the new project's tools in the "What I work with" list by adding a letter to `data-p`, plus a filter button.

A project with its own repository (like R.A.M.P.A.T.) can skip step 1 and link the card
straight to `https://thecoder314.github.io/<repo-name>/`.

## Publish

This repository must be named exactly `TheCoder314.github.io`.
Settings → Pages → Deploy from a branch → `main`, `/ (root)`.

## Analytics

GoatCounter (no cookies): https://ad314159.goatcounter.com
Clicks on elements with a `data-goatcounter-click` attribute are counted as events.

## License

Site content © Aarit Dixit. Project files are licensed separately in each project's repository.
