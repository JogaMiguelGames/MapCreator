// scripts/lang.js
document.addEventListener("DOMContentLoaded", () => {
  const userLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();

  let langFile = null;
  if (userLang.startsWith("pt")) langFile = "resources/langs/pt-br.json";
  else if (userLang.startsWith("es")) langFile = "resources/langs/es.json";

  if (langFile) {
    fetch(langFile)
      .then(response => response.json())
      .then(dict => {
        function translateText(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const trimmed = node.nodeValue.trim();
            if (dict[trimmed]) node.nodeValue = dict[trimmed];
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.placeholder && dict[node.placeholder]) {
              node.placeholder = dict[node.placeholder];
            }
            if (node.title && dict[node.title]) {
              node.title = dict[node.title];
            }
            if (node.getAttribute("aria-label") && dict[node.getAttribute("aria-label")]) {
              node.setAttribute("aria-label", dict[node.getAttribute("aria-label")]);
            }
            node.childNodes.forEach(translateText);
          }
        }
        translateText(document.body);
      })
      .catch(err => console.error("Erro ao carregar tradução:", err));
  }
});
