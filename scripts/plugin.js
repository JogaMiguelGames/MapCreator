document.getElementById('pluginBtn').addEventListener('click', () => {
  document.getElementById('pluginFolderInput').click();
});

document.getElementById('pluginFolderInput').addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  // Procura pelo plugin.js dentro da pasta
  const pluginFile = files.find(f => f.name.toLowerCase() === "plugin.js");
  if (!pluginFile) {
    alert("plugin.js não encontrado na pasta!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;

    try {
      const plugin = {};

      // Função execute para ler outros arquivos JS dentro da mesma pasta
      plugin.execute = (filename) => {
        const fileToExecute = files.find(f => f.name === filename);
        if (!fileToExecute) {
          console.error("Arquivo não encontrado na pasta:", filename);
          return;
        }

        const fr = new FileReader();
        fr.onload = (ev) => {
          try {
            eval(ev.target.result); // executa o código JS
          } catch(err) {
            console.error("Erro ao executar arquivo:", err);
          }
        };
        fr.readAsText(fileToExecute);
      };

      // Executa o plugin.js lido
      const wrappedCode = `(function(plugin){ ${content} })(plugin);`;
      eval(wrappedCode);

      if (!plugin.name) {
        alert("O plugin não possui a propriedade 'name'!");
        return;
      }

      alert(`Plugin "${plugin.name}" importado com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Falha ao importar plugin: " + err.message);
    }
  };

  reader.readAsText(pluginFile);
});
