// ================== Plugin Import System ==================
const pluginBtn = document.getElementById('pluginBtn');
const pluginFileInput = document.getElementById('pluginFileInput');
const pluginFolderInput = document.getElementById('pluginFolderInput');

// Where new menu items will be added
const menuBar = document.getElementById('menuBar');

pluginBtn.addEventListener('click', () => {
  if (pluginFileInput) {
    pluginFileInput.click();
  } else if (pluginFolderInput) {
    pluginFolderInput.click();
  } else {
    alert("No plugin input element found in the HTML!");
  }
});

// Parse and apply .plugin commands
function importPluginFile(file) {
  if (!file.name.endsWith(".plugin")) {
    alert(`❌ File "${file.name}" is not a valid .plugin file.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    try {
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l);

      // Storage for declared menu buttons
      const buttons = {};

      for (const line of lines) {
        // Example: myButton = menuButton
        if (/^\w+\s*=\s*menuButton$/i.test(line)) {
          const varName = line.split("=")[0].trim();
          const button = document.createElement("div");
          button.className = "menuItem";
          button.textContent = "(unnamed)";
          button.dataset.pluginVar = varName;

          // Add empty dropdown list
          const dropdown = document.createElement("ul");
          dropdown.className = "dropdown";
          button.appendChild(dropdown);

          menuBar.appendChild(button);
          buttons[varName] = { element: button, dropdown };

        // Example: myButton.name = SomeText
        } else if (/^\w+\.name\s*=\s*.+$/i.test(line)) {
          const [left, right] = line.split("=");
          const varName = left.split(".")[0].trim();
          const newName = right.trim();

          if (buttons[varName]) {
            buttons[varName].element.firstChild.textContent = newName;
          }

        } else {
          console.warn("Unrecognized plugin command:", line);
        }
      }

      if (Object.keys(buttons).length > 0) {
        alert(`✅ Plugin "${file.name}" loaded and menu items created!`);
      } else {
        alert(`⚠️ Plugin "${file.name}" did not create any menu items.`);
      }

    } catch (err) {
      console.error(err);
      alert(`❌ Failed to import plugin ${file.name}: ${err.message}`);
    }
  };

  reader.readAsText(file);
}

// Listener for single plugin
if (pluginFileInput) {
  pluginFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) importPluginFile(file);
  });
}

// Listener for plugin folder
if (pluginFolderInput) {
  pluginFolderInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (!files.length) return;
    for (const file of files) {
      importPluginFile(file);
    }
  });
}
