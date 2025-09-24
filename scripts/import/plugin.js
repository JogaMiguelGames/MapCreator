// scripts/import/plugin.js
(function() {
  const pluginBtn = document.getElementById('pluginBtn');
  const pluginInput = document.getElementById('pluginFileInput');

  if (!pluginBtn || !pluginInput) return;

  // Estrutura para guardar plugins carregados
  window.mapCreator = window.mapCreator || {};
  mapCreator.plugins = mapCreator.plugins || [];

  // Função para criar um menu no menuBar
  function createPluginMenu(plugin) {
    const menuBar = document.getElementById('menuBar');
    if (!menuBar) return;

    const newMenu = document.createElement('div');
    newMenu.classList.add('menuItem');
    newMenu.setAttribute('role', 'menuitem');
    newMenu.setAttribute('tabindex', '0');
    newMenu.setAttribute('aria-haspopup', 'true');
    newMenu.setAttribute('aria-expanded', 'false');

    const menuTitle = document.createElement('span');
    menuTitle.textContent = plugin.name;
    newMenu.appendChild(menuTitle);

    const dropdown = document.createElement('ul');
    dropdown.classList.add('dropdown');
    dropdown.setAttribute('role', 'menu');
    newMenu.appendChild(dropdown);

    // Exemplo de item no dropdown
    const item = document.createElement('li');
    item.textContent = plugin.version ? `Version: ${plugin.version}` : 'Plugin';
    item.setAttribute('role', 'menuitem');
    dropdown.appendChild(item);

    menuBar.appendChild(newMenu);

    // Event listeners
    newMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const opened = newMenu.classList.toggle('open');
      newMenu.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!newMenu.contains(e.target)) {
        newMenu.classList.remove('open');
        newMenu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Função para salvar plugin no localStorage
  function savePlugin(plugin) {
    mapCreator.plugins.push(plugin);
    localStorage.setItem('mapCreatorPlugins', JSON.stringify(mapCreator.plugins));
  }

  // Função para carregar plugins do localStorage
  function loadPlugins() {
    const saved = localStorage.getItem('mapCreatorPlugins');
    if (!saved) return;
    try {
      const plugins = JSON.parse(saved);
      plugins.forEach(p => createPluginMenu(p));
      mapCreator.plugins = plugins;
    } catch (err) {
      console.error('Failed to load plugins from localStorage', err);
    }
  }

  // Evento do botão
  pluginBtn.addEventListener('click', () => {
    pluginInput.click();
  });

  pluginInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.plugin')) {
      alert('Only .plugin files are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;

      try {
        const plugin = {};
        const wrappedCode = `(function(plugin){ ${content} })(plugin);`;
        eval(wrappedCode);

        if (!plugin.name) {
          alert('Plugin must have a name!');
          return;
        }

        createPluginMenu(plugin);
        savePlugin(plugin);

        alert(`Plugin "${plugin.name}" imported successfully!` + (plugin.version ? ` Version: ${plugin.version}` : ''));

      } catch (err) {
        console.error(err);
        alert('Failed to import plugin: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Carrega plugins salvos automaticamente
  loadPlugins();
})();
