// --- Botão para importar plugin ---
document.getElementById('pluginBtn').addEventListener('click', () => {
  document.getElementById('pluginFileInput').click();
});

// --- Input para selecionar arquivo ---
document.getElementById('pluginFileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    try {
      const plugin = {};

      // Criamos a função execute para o plugin
      plugin.execute = (filename) => {
        fetch(filename)
          .then(resp => {
            if (!resp.ok) throw new Error('File not found: ' + filename);
            return resp.text();
          })
          .then(code => {
            try {
              eval(code); // Executa o JS do arquivo
            } catch (err) {
              console.error('Error executing plugin file:', err);
            }
          })
          .catch(err => console.error(err));
      };

      // Executa o código do próprio arquivo .plugin
      const wrappedCode = `(function(plugin){ ${content} })(plugin);`;
      eval(wrappedCode);

      // Valida plugin.name
      if (!plugin.name) {
        alert('The plugin does not have a name property!');
        return;
      }

      let versionText = '';
      if (plugin.version !== undefined) {
        const versionStr = plugin.version.toString();
        if (/^[0-9.]+$/.test(versionStr)) {
          versionText = versionStr;
        } else {
          alert('Invalid plugin version! Must contain only numbers and dots.');
          return;
        }
      }

      alert(`The plugin ${plugin.name} has been imported!` + (versionText ? ` version: ${versionText}` : ''));

      // Agora você pode chamar: plugin.execute('plugin.js') dentro do .plugin

    } catch (err) {
      alert('Failed to import plugin: ' + err.message);
    }
  };

  reader.readAsText(file);
});
