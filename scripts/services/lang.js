// lang.js
document.addEventListener("DOMContentLoaded", () => {
  const userLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();

  // Dicionários de traduções
  const translations = {
    pt: {
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
      "Wireframe": "Grade (Wireframe)",
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
      "🔙 Back": "🔙 Voltar"
    },
    es: {
      "File": "Archivo",
      "Save": "Guardar",
      "Open": "Abrir",
      "Add": "Añadir",
      "Create Cube": "Crear Cubo",
      "Create Sphere": "Crear Esfera",
      "Create Plane": "Crear Plano",
      "Create Camera": "Crear Cámara",
      "Run": "Ejecutar",
      "Stop": "Detener",
      "Script View": "Vista de Script",
      "Import Plugin": "Importar Plugin",
      "Add Cube": "Añadir Cubo",
      "Add Sphere": "Añadir Esfera",
      "Add Plane": "Añadir Plano",
      "Add Camera": "Añadir Cámara",
      "Wireframe": "Malla (Wireframe)",
      "Import Texture": "Importar Textura",
      "Sky Color:": "Color del Cielo:",
      "Scale X:": "Escala X:",
      "Scale Y:": "Escala Y:",
      "Scale Z:": "Escala Z:",
      "Position X:": "Posición X:",
      "Position Y:": "Posición Y:",
      "Position Z:": "Posición Z:",
      "Rotation X:": "Rotación X:",
      "Rotation Y:": "Rotación Y:",
      "Rotation Z:": "Rotación Z:",
      "Color HEX:": "Color HEX:",
      "Scripting": "Scripts",
      "Run Script": "Ejecutar Script",
      "Type a command...": "Escribe un comando...",
      "🔙 Back": "🔙 Atrás"
    }
  };

  // Decide o idioma
  let selectedLang = "en"; // padrão inglês
  if (userLang.startsWith("pt")) selectedLang = "pt";
  else if (userLang.startsWith("es")) selectedLang = "es";

  // Se idioma for pt ou es, traduz
  if (selectedLang !== "en") {
    const dict = translations[selectedLang];

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
  }
});
