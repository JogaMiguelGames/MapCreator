document.getElementById('pluginBtn').addEventListener('click', () => {
  document.getElementById('pluginFileInput').click();
});

document.getElementById('pluginFileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    try {
      const plugin = {};

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

    } catch (err) {
      console.error(err);
      alert('Failed to import plugin: ' + err.message);
    }
  };

  reader.readAsText(file);
});
