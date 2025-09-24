// plugin.js
(function(){
  const PLUGIN_STORAGE_KEY = "mapCreator.plugins";

  // --- Load all plugins from localStorage ---
  function loadPluginsFromStorage() {
    const raw = localStorage.getItem(PLUGIN_STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }

  // --- Save plugins ---
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
    reader.onload = function(e) {
      const content = e.target.result;
      const lines = content.split("\n").map(l=>l.trim()).filter(Boolean);
      const plugin = { name: file.name, content, parsed: [] };

      lines.forEach(line => {
        if (/=\s*menuButton/i.test(line)) {
          const variable = line.split("=")[0].trim();
          plugin.parsed.push({ type:"menuButton", variable });
        }
        if (/\.name\s*=/.test(line)) {
          const [varPart,namePart] = line.split("=");
          const variable = varPart.replace(".name","").trim();
          const menuName = namePart.trim();
          plugin.parsed.push({ type:"menuName", variable, name:menuName });
        }
      });

      const plugins = loadPluginsFromStorage();
      plugins.push(plugin);
      savePluginsToStorage(plugins);

      renderPlugins();
    };
    reader.readAsText(file);
  }

  // --- Create plugin menu item compatible with menuStrip.js ---
  function createPluginMenu(plugin) {
    const menuItem = document.createElement("div");
    menuItem.className = "menuItem";
    menuItem.textContent = plugin.name;
    menuItem.setAttribute("tabindex","0");
    menuItem.setAttribute("aria-haspopup","true");
    menuItem.setAttribute("aria-expanded","false");

    const dropdown = document.createElement("ul");
    dropdown.className = "dropdown";
    menuItem.appendChild(dropdown);

    // Click toggle
    menuItem.addEventListener("click",(e)=>{
      e.stopPropagation();
      const opened = menuItem.classList.toggle("open");
      menuItem.setAttribute("aria-expanded", opened ? "true":"false");
    });

    // Keyboard support
    menuItem.addEventListener("keydown",(e)=>{
      if(e.key==="Enter"||e.key===" ") { e.preventDefault(); menuItem.click(); }
    });

    return menuItem;
  }

  // --- Render default menus + plugin menus ---
  function renderPlugins() {
    const menuBar = document.getElementById("menuBar");
    if(!menuBar) return;

    // keep File/Add existing buttons
    const fileBtn = document.getElementById("fileMenuBtn");
    const addBtn = document.getElementById("addMenuBtn");

    // remove old plugin menus
    document.querySelectorAll(".menuItem.plugin").forEach(el=>el.remove());

    // load plugins
    const plugins = loadPluginsFromStorage();
    plugins.forEach(plugin=>{
      const pluginMenu = createPluginMenu(plugin);
      pluginMenu.classList.add("plugin");
      menuBar.appendChild(pluginMenu);
    });
  }

  // --- Close plugin menus when clicked outside ---
  document.addEventListener("click",()=>{
    document.querySelectorAll(".menuItem.plugin.open").forEach(menu=>{
      menu.classList.remove("open");
      menu.setAttribute("aria-expanded","false");
    });
  });

  // --- Input to load plugins ---
  document.addEventListener("DOMContentLoaded",()=>{
    renderPlugins();

    const input = document.getElementById("pluginInput");
    if(input){
      input.addEventListener("change",(e)=>{
        const file = e.target.files[0];
        if(file) addPlugin(file);
      });
    }
  });
})();
