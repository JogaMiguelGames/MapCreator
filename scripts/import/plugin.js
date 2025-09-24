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

// --- Helper to create menu items ---
function createMenu(name, options = []) {
  const menuItem = document.createElement("div");
  menuItem.className = "menuItem";
  menuItem.textContent = name;

  const dropdown = document.createElement("ul");
  dropdown.className = "dropdown";

  options.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt.label;

    if (typeof opt.action === "function") {
      li.addEventListener("click", opt.action);
    }

    dropdown.appendChild(li);
  });

  menuItem.appendChild(dropdown);

  // toggle open
  menuItem.addEventListener("click", (e) => {
    e.stopPropagation(); // evita fechar outros menus
    menuItem.classList.toggle("open");
  });

  return menuItem;
}

// --- Render menus from plugins + defaults ---
function renderMenus() {
  const menuBar = document.getElementById("menuBar");
  if (!menuBar) return;
  menuBar.innerHTML = ""; // clear old

  // Default File menu
  const fileMenu = createMenu("File", [
    { label: "Save", action: () => document.getElementById("menuSave")?.click() },
    { label: "Open", action: () => document.getElementById("menuLoad")?.click() },
  ]);
  menuBar.appendChild(fileMenu);

  // Default Add menu
  const addMenu = createMenu("Add", [
    { label: "Create Cube", action: () => document.getElementById("menuCube")?.click() },
    { label: "Create Cylinder", action: () => document.getElementById("menuCylinder")?.click() },
    { label: "Create Sphere", action: () => document.getElementById("menuSphere")?.click() },
    { label: "Create Cone", action: () => document.getElementById("menuCone")?.click() },
    { label: "Create Plane", action: () => document.getElementById("menuPlane")?.click() },
    { label: "Create Camera", action: () => document.getElementById("menuCamera")?.click() },
  ]);
  menuBar.appendChild(addMenu);

  // Load plugin menus
  const plugins = loadPluginsFromStorage();
  plugins.forEach(plugin => {
    plugin.parsed.forEach(item => {
      if (item.type === "menuName") {
        menuBar.appendChild(createMenu(item.name));
      }
    });
  });
}

// --- Close all menus if clicked outside ---
document.addEventListener("click", () => {
  document.querySelectorAll(".menuItem.open").forEach(menu => {
    menu.classList.remove("open");
  });
});

// --- Load on startup ---
document.addEventListener("DOMContentLoaded", () => {
  renderMenus();

  const input = document.getElementById("pluginInput");
  if (input) {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) addPlugin(file);
    });
  }
});
