// Open folder selection when clicking the button
document.getElementById('pluginBtn').addEventListener('click', () => {
  document.getElementById('pluginFolderInput').click();
});

// Load plugin.js from the selected folder
document.getElementById('pluginFolderInput').addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  // Find plugin.js in the folder
  const pluginFile = files.find(f => f.name.toLowerCase() === "plugin.js");
  if (!pluginFile) {
    alert("plugin.js not found in the folder!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;

    try {
      const plugin = {};

      // Add execute function to run other JS files in the same folder
      plugin.execute = (filename) => {
        const fileToExecute = files.find(f => f.name === filename);
        if (!fileToExecute) {
          console.error("File not found in folder:", filename);
          return;
        }

        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          try {
            eval(ev.target.result); // execute the JS code
          } catch(err) {
            console.error("Error executing file:", err);
          }
        };
        fileReader.readAsText(fileToExecute);
      };

      // Execute plugin.js
      const wrappedCode = `(function(plugin){ ${content} })(plugin);`;
      eval(wrappedCode);

      if (!plugin.name) {
        alert("The plugin does not have a 'name' property!");
        return;
      }

      alert(`Plugin "${plugin.name}" imported successfully!`);

    } catch (err) {
      console.error(err);
      alert("Failed to import plugin: " + err.message);
    }
  };

  reader.readAsText(pluginFile);
});
