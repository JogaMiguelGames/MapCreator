// scripts/import/plugin.js
(function() {
  const pluginBtn = document.getElementById('pluginBtn');
  const pluginInput = document.getElementById('pluginFileInput');

  if (!pluginBtn || !pluginInput) return;

  // Inicializa array de plugins no localStorage se não existir
  if (!localStorage.getItem('mapCreator.plugins')) {
    localStorage.setItem('mapCreator.plugins', JSON.stringify([]));
  }

  // Função para adicionar plugin
  function addPluginFromText(text) {
    const pluginObj = {};

    // Procura linha "variavel = menuButton"
    const matchVar = text.match(/(\w+)\s*=\s*menuButton/);
    if (!matchVar) {
      alert("Plugin file must contain 'variable = menuButton'");
      return;
    }

    const variable = matchVar[1];

    // Procura variável.name = "NomeDoMenu"
    const matchName = text.match(new RegExp(variable + '\\.name\\s*=\\s*(.+)'));
    let name;
    if (matchName) {
      name = matchName[1].replace(/['"]/g,'').trim();
    } else {
      name = variable.charAt(0).toUpperCase() + variable.slice(1);
    }

    pluginObj.variable = variable;
    pluginObj.name = name;

    // Cria menu item
    const addMenuBtn = document.getElementById('addMenuBtn');
    if (!addMenuBtn) return;

    const li = document.createElement('li');
    li.textContent = pluginObj.name;
    li.setAttribute('role','menuitem');
    li.setAttribute('tabindex','-1');

    // Quando clicar, executa o plugin
    li.addEventListener('click', () => {
      try {
        const wrappedCode = `(function(plugin){ ${text} })(plugin);`;
        eval(wrappedCode);
        alert(`Plugin "${pluginObj.name}" executed!`);
      } catch(err) {
        console.error(err);
        alert('Error executing plugin: ' + err.message);
      }
      addMenuBtn.classList.remove('open');
      addMenuBtn.setAttribute('aria-expanded','false');
    });

    addMenuBtn.querySelector('.dropdown').appendChild(li);

    // Salva no localStorage
    const savedPlugins = JSON.parse(localStorage.getItem('mapCreator.plugins'));
    savedPlugins.push(text);
    localStorage.setItem('mapCreator.plugins', JSON.stringify(savedPlugins));
  }

  // Ao clicar no botão, abre seletor de arquivos
  pluginBtn.addEventListener('click', () => {
    pluginInput.click();
  });

  // Quando escolher arquivo
  pluginInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.plugin')) {
      alert('Only .plugin files are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      addPluginFromText(e.target.result);
    };
    reader.readAsText(file);

    // Limpa input para poder importar o mesmo arquivo novamente
    pluginInput.value = '';
  });

  // --- Recarrega plugins do localStorage ao abrir a página ---
  function loadPlugins() {
    const savedPlugins = JSON.parse(localStorage.getItem('mapCreator.plugins'));
    if (!savedPlugins) return;

    for (const text of savedPlugins) {
      addPluginFromText(text);
    }
  }

  loadPlugins();
})();
