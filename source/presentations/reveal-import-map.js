const revealJSVersion = "5.2.1";
const revealJSBaseURL = `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/${revealJSVersion}`;

const revealJSStylesheets = [
  `${revealJSBaseURL}/reset.min.css`,
  `${revealJSBaseURL}/reveal.min.css`,
  `${revealJSBaseURL}/theme/black.min.css`,
  `${revealJSBaseURL}/plugin/highlight/monokai.min.css`,
];

const revealJSImportMap = {
  imports: {
    "reveal.js": `${revealJSBaseURL}/reveal.esm.min.js`,
    "reveal.js/plugin/highlight": `${revealJSBaseURL}/plugin/highlight/highlight.esm.min.js`,
    "reveal.js/plugin/markdown": `${revealJSBaseURL}/plugin/markdown/markdown.esm.min.js`,
    "reveal.js/plugin/notes": `${revealJSBaseURL}/plugin/notes/notes.esm.min.js`,
  },
};

let insertAfter = document.currentScript;

for (const href of revealJSStylesheets) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  insertAfter.after(stylesheet);
  insertAfter = stylesheet;
}

const importMap = document.createElement("script");
importMap.type = "importmap";
importMap.textContent = JSON.stringify(revealJSImportMap);
insertAfter.after(importMap);
