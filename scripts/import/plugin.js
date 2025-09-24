(function(){
  // Inicializa o objeto global de plugins
  window.mapCreator = window.mapCreator || {};
  mapCreator.plugins = mapCreator.plugins || [];

  const pluginBtn = document.getElementById("pluginBtn");
  const pluginInput = document.getElementById("pluginFileInput");
  const menuBar = document.getElementById("menuBar");

  if (!pluginBtn || !pluginInput || !menuBar) return;

  // Função para salvar plugins no localStorage
  function savePlugins() {
    localStorage.setItem("mapCreator.plugins", JSON.stringify(mapCreator.plugins));
  }

  // Função para renderizar menus dos plugins
  function renderPlugins() {
    // Remove menus antigos
    document.querySelectorAll(".pluginMenu").forEach(e => e.remove());

    mapCreator.plugins.forEach(p => {
      if(!p.name || !p.variable) return;

      const menuItem = document.createElement("div");
      menuItem.className = "menuItem pluginMenu";
      menuItem.tabIndex = 0;
      menuItem.innerHTML = `<span>${p.name}</span>`;
      const dropdown = document.createElement("ul");
      dropdown.className = "dropdown";
      menuItem.appendChild(dropdown);

      // Adiciona ao menuBar
      menuBar.appendChild(menuItem);

      // Clique abre/fecha
      menuItem.addEventListener("click", (e)=>{
        e.stopPropagation();
        const opened = menuItem.classList.toggle("open");
        menuItem.setAttribute("aria-expanded", opened ? "true":"false");
      });

      // Fechar ao clicar fora
      document.addEventListener("click", (e)=>{
        if(!menuItem.contains(e.target)){
          menuItem.classList.remove("open");
          menuItem.setAttribute("aria-expanded","false");
        }
      });
    });
  }

  // Função para adicionar plugin
  function addPlugin(file) {
    if (!file.name.endsWith(".plugin")) {
      alert("Only .plugin files are allowed!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e)=>{
      const text = e.target.result;
      const pluginObj = {};

      try {
        // Procura linha "variable = menuButton"
        const match = text.match(/(\w+)\s*=\s*menuButton/);
        if(match){
          pluginObj.variable = match[1];
          pluginObj.name = pluginObj.variable.charAt(0).toUpperCase() + pluginObj.variable.slice(1);
        } else {
          alert("Plugin file must contain 'variable = menuButton'");
          return;
        }

        mapCreator.plugins.push(pluginObj);
        savePlugins();
        renderPlugins();
        alert(`Plugin "${pluginObj.name}" imported!`);

      } catch(err){
        console.error(err);
        alert("Failed to import plugin: "+err.message);
      }
    };

    reader.readAsText(file);
  }

  // Botão abre input
  pluginBtn.addEventListener("click", ()=> pluginInput.click());

  // Input seleciona arquivos
  pluginInput.addEventListener("change", (e)=>{
    const files = Array.from(e.target.files);
    files.forEach(file => addPlugin(file));
  });

  // Carrega plugins do localStorage ao iniciar
  const saved = localStorage.getItem("mapCreator.plugins");
  if(saved){
    try {
      mapCreator.plugins = JSON.parse(saved);
      renderPlugins();
    } catch(err){ console.error(err); }
  }

})();
