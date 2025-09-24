// plugin.js

const PLUGIN_STORAGE_KEY = "mapCreator.plugins";

// --- Load all plugins from localStorage ---
function loadPluginsFromStorage() {
  const raw = localStorage.getItem(PLUGIN_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// --- Save plugin list back to localStorage ---
function savePluginsToStorage(plugins) {
  localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(plugins));
}

// --- Add new plugin (.plugin file) ---
function addPlugin(file) {
  if (!file.name.endsWith(".plugin")) {
    alert("Only .plugin files are allowed!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;

    // Example: "myVar = menuButton\nmyVar.name = File"
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
    const plugin = { name: file.name, content: content, parsed: [] };

    lines.forEach(line => {
      // Parse "variable = menuButton"
      if (/=\s*menuButton/i.test(line)) {
        const variable = line.split("=")[0].trim();
        plugin.parsed.push({ type: "menuButton", variable });
      }

      // Parse "variable.name = Something"
      if (/\.name\s*=/.test(line)) {
        const [varPart, namePart] = line.split("=");
        const variable = varPart.replace(".name", "").trim();
        const menuName = namePart.trim();
        plugin.parsed.push({ type: "menuName", variable, name: menuName });
      }
    });

    // Save to localStorage
    const plugins = loadPluginsFromStorage();
    plugins.push(plugin);
    savePluginsToStorage(plugins);

    renderMenus(); // update UI immediately
  };

  reader.readAsText(file);
}

// --- Render menus from plugins ---
function renderMenus() {
  const menuBar = document.getElementById("menuBar");
  if (!menuBar) return;
  menuBar.innerHTML = ""; // clear old

  const plugins = loadPluginsFromStorage();

  plugins.forEach(plugin => {
    plugin.parsed.forEach(item => {
      if (item.type === "menuName") {
        const menuItem = document.createElement("div");
        menuItem.className = "menuItem";
        menuItem.textContent = item.name;

        const dropdown = document.createElement("ul");
        dropdown.className = "dropdown";
        menuItem.appendChild(dropdown);

        // toggle open
        menuItem.addEventListener("click", () => {
          menuItem.classList.toggle("open");
        });

        menuBar.appendChild(menuItem);
      }
    });
  });
}

// --- Load on startup ---
document.addEventListener("DOMContentLoaded", () => {
  renderMenus();

  // Example: input for adding plugins
  const input = document.getElementById("pluginInput");
  if (input) {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) addPlugin(file);
    });
  }
});
