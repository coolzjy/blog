const render = (text) =>
  hexo.render.renderSync({ text, engine: "markdown" }, { inline: true });

hexo.extend.tag.register(
  "figure",
  function ([caption], content) {
    return `<figure>${render(content)}<figcaption>${render(
      caption
    )}</figcaption></figure>`;
  },
  { ends: true }
);
