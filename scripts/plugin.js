// Botão para abrir a janela de importação
document.getElementById('pluginBtn').addEventListener('click', () => {
  document.getElementById('pluginFileInput').click();
});

// Quando o usuário seleciona um arquivo
document.getElementById('pluginFileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    try {
      // Criar um objeto vazio plugin e executar o script do arquivo em um escopo seguro
      const plugin = {};
      const wrappedCode = `(function(plugin){ ${content} })(plugin);`;

      // Avalia o código do plugin
      eval(wrappedCode);

      if (plugin.name) {
        alert(`The plugin ${plugin.name} has been imported!`);
      } else {
        alert('The plugin does not have a name property!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to import plugin: ' + err.message);
    }
  };

  reader.readAsText(file);
});
