// lang.js
document.addEventListener("DOMContentLoaded", () => {
  // Detecta idioma do navegador
  const userLang = navigator.language || navigator.userLanguage;

  // Dicionário de traduções
  const translations = {
    "File": "Arquivo",
    "Save": "Salvar",
    "Open": "Abrir",
    "Add": "Adicionar",
    "Create Cube": "Criar Cubo",
    "Create Sphere": "Criar Esfera",
    "Create Plane": "Criar Plano",
    "Create Camera": "Criar Câmera",
    "Run": "Executar",
    "Stop": "Parar",
    "Script View": "Visualizar Script",
    "Import Plugin": "Importar Plugin",
    "Add Cube": "Adicionar Cubo",
    "Add Sphere": "Adicionar Esfera",
    "Add Plane": "Adicionar Plano",
    "Add Camera": "Adicionar Câmera",
    "Wireframe": "Wireframe",
    "Import Texture": "Importar Textura",
    "Sky Color:": "Cor do Céu:",
    "Scale X:": "Escala X:",
    "Scale Y:": "Escala Y:",
    "Scale Z:": "Escala Z:",
    "Position X:": "Posição X:",
    "Position Y:": "Posição Y:",
    "Position Z:": "Posição Z:",
    "Rotation X:": "Rotação X:",
    "Rotation Y:": "Rotação Y:",
    "Rotation Z:": "Rotação Z:",
    "Color HEX:": "Cor HEX:",
    "Scripting": "Scripts",
    "Run Script": "Executar Script",
    "Type a command...": "Digite um comando...",
    "Back": "Voltar"
  };

  // Só traduz se idioma for pt-BR
  if (userLang && userLang.toLowerCase().startsWith("pt-br")) {
    // Função para percorrer e substituir textos
    function translateText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmed = node.nodeValue.trim();
        if (translations[trimmed]) {
          node.nodeValue = translations[trimmed];
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // traduz placeholders, titles, aria-labels
        if (node.placeholder && translations[node.placeholder]) {
          node.placeholder = translations[node.placeholder];
        }
        if (node.title && translations[node.title]) {
          node.title = translations[node.title];
        }
        if (node.getAttribute("aria-label") && translations[node.getAttribute("aria-label")]) {
          node.setAttribute("aria-label", translations[node.getAttribute("aria-label")]);
        }
        node.childNodes.forEach(translateText);
      }
    }

    translateText(document.body);
  }
});
