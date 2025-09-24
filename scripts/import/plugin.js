// scripts/import/plugin.js
(function() {
  const pluginBtn = document.getElementById('pluginBtn');
  const pluginInput = document.getElementById('pluginFileInput');

  if (!pluginBtn || !pluginInput) return;

  // Load saved plugins from localStorage
  const savedPlugins = JSON.parse(localStorage.getItem('mapCreator.plugins') || '[]');

  savedPlugins.forEach(pluginCode => {
    try {
      importPluginFromCode(pluginCode);
    } catch (err) {
      console.error('Failed to load saved plugin:', err);
    }
  });

  pluginBtn.addEventListener('click', () => {
    pluginInput.click();
  });

  pluginInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.plugin')) {
      alert('Only .plugin files are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;

      try {
        importPluginFromCode(content);

        savedPlugins.push(content);
        localStorage.setItem('mapCreator.plugins', JSON.stringify(savedPlugins));

        alert(`Plugin imported successfully!`);
      } catch (err) {
        console.error(err);
        alert('Failed to import plugin: ' + err.message);
      }
    };

    reader.readAsText(file);
  });

  function importPluginFromCode(code) {
    // Criamos o plugin e tornamos menuButton global dentro do eval
    const plugin = {};
    window.menuButton = plugin; // ⚠️ Aqui: menuButton global

    try {
      eval(code); // plugin .plugin pode acessar menuButton diretamente
    } finally {
      delete window.menuButton; // limpamos após execução
    }

    if (!plugin.name) {
      throw new Error('Plugin must have a name property!');
    }

    createPluginMenu(plugin);
  }

  function createPluginMenu(plugin) {
    const menuBar = document.getElementById('menuBar');
    if (!menuBar) return;

    const menuItem = document.createElement('div');
    menuItem.className = 'menuItem';
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('tabindex', '0');
    menuItem.setAttribute('aria-haspopup', 'true');
    menuItem.setAttribute('aria-expanded', 'false');

    const span = document.createElement('span');
    span.textContent = plugin.name;
    menuItem.appendChild(span);

    const dropdown = document.createElement('ul');
    dropdown.className = 'dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.setAttribute('aria-label', plugin.name + ' menu');

    menuItem.appendChild(dropdown);
    menuBar.appendChild(menuItem);

    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const opened = menuItem.classList.toggle('open');
      menuItem.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });

    menuItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuItem.click();
      }
    });

    document.addEventListener('click', (e) => {
      if (!menuItem.contains(e.target)) {
        menuItem.classList.remove('open');
        menuItem.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
