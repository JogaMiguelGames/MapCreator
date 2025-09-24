// ================== Plugin Import System ==================
const pluginBtn = document.getElementById('pluginBtn');

// File input for a single plugin
const pluginFileInput = document.getElementById('pluginFileInput');
// File input for a whole plugin folder
const pluginFolderInput = document.getElementById('pluginFolderInput');

pluginBtn.addEventListener('click', () => {
  if (pluginFileInput) {
    // Open file picker for a single plugin
    pluginFileInput.click();
  } else if (pluginFolderInput) {
    // Open folder picker for multiple plugins
    pluginFolderInput.click();
  } else {
    alert("No plugin input element found in the HTML!");
  }
});

// Function to import and validate a plugin file
function importPluginFile(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    try {
      const plugin = {};

      // Run the plugin code inside an isolated scope
      const wrappedCode = `(function(plugin){ ${content} })(plugin);`;
      eval(wrappedCode);

      // Validate plugin.name
      if (!plugin.name) {
        alert(`The file ${file.name} does not define a "name" property!`);
        return;
      }

      // Validate plugin.version if present
      let versionText = '';
      if (plugin.version !== undefined) {
        const versionStr = plugin.version.toString();
        if (/^[0-9.]+$/.test(versionStr)) {
          versionText = versionStr;
        } else {
          alert(`Invalid version in plugin "${plugin.name}". Only numbers and dots are allowed.`);
          return;
        }
      }

      alert(`✅ Plugin "${plugin.name}" imported successfully!` + 
            (versionText ? ` Version: ${versionText}` : ''));

    } catch (err) {
      console.error(err);
      alert(`❌ Failed to import plugin ${file.name}: ${err.message}`);
    }
  };

  reader.readAsText(file);
}

// Listener for single file input
if (pluginFileInput) {
  pluginFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) importPluginFile(file);
  });
}

// Listener for folder input
if (pluginFolderInput) {
  pluginFolderInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
      if (file.name.endsWith(".js")) {
        importPluginFile(file);
      }
    }
  });
}
