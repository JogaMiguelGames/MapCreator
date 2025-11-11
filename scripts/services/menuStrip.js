// scripts/services/menuStrip.js
import { Project, Model, Page, Tree_View, Icon } from '../../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../../libs/mcl/add.js';

(function(){
  const fileBtn = document.getElementById('fileMenuBtn');
  if (!fileBtn) return;

  const addBtn = document.getElementById('addMenuBtn');
  if (!addBtn) return;

  const PreferencesButton = document.getElementById('PreferencesMenuButton');
  if (!PreferencesButton) return;

  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = addBtn.classList.toggle('open');
    addBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  fileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = fileBtn.classList.toggle('open');
    fileBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  PreferencesButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = PreferencesButton.classList.toggle('open');
    PreferencesButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
  
  [fileBtn, addBtn].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!fileBtn.contains(e.target)) {
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    }
    if (!addBtn.contains(e.target)) {
      addBtn.classList.remove('open');
      addBtn.setAttribute('aria-expanded','false');
    }
    if (!PreferencesButton.contains(e.target)) {
      PreferencesButton.classList.remove('open');
      PreferencesButton.setAttribute('aria-expanded','false');
    }
  });

  function safeInvoke(fnNameOrArray, fallbackBtnId, fallbackInputId) {
    const names = Array.isArray(fnNameOrArray) ? fnNameOrArray : [fnNameOrArray];
    for (const name of names) {
      if (typeof window[name] === 'function') {
        try { window[name](); return true; } catch (err) { console.error(err); }
      }
    }

    if (fallbackBtnId) {
      const btn = document.getElementById(fallbackBtnId);
      if (btn) { btn.click(); return true; }
    }
    if (fallbackInputId) {
      const inp = document.getElementById(fallbackInputId);
      if (inp) { inp.click(); return true; }
    }

    return false;
  }

  const menuOpenEl = document.getElementById('menuOpen') || document.getElementById('menuLoad');
  if (menuOpenEl) {
    menuOpenEl.addEventListener('click', (e) => {
      e.stopPropagation();
      safeInvoke(['openMap','loadMap','openFileDialog'], 'loadButton', 'loadInput');
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    });
  }

  const menuSaveEl = document.getElementById('menuSave');
  if (menuSaveEl) {
    menuSaveEl.addEventListener('click', (e) => {
      e.stopPropagation();
      safeInvoke('saveMap', 'menuSave');
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    });
  }

  const ExportButtonEl = document.getElementById('ExportButton');
  if (ExportButtonEl) {
    ExportButtonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      ExportMap();
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    });
  }
  
  document.getElementById('ThemesButton')?.addEventListener('click', () => {
    Page.Elements.Themes_Window.Window.style.display = Page.Elements.Themes_Window.Window.style.display === "flex" ? "none" : "flex";
  });
  
  document.getElementById('menuCube')?.addEventListener('click', () => {
    CreateCube();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuCylinder')?.addEventListener('click', () => {
    CreateCylinder();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuSphere')?.addEventListener('click', () => {
    CreateSphere();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuCone')?.addEventListener('click', () => {
    CreateCone();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuPlane')?.addEventListener('click', () => {
    CreatePlane();
    addBtn.classList.remove('open');
  });
  
  document.getElementById('menuCamera')?.addEventListener('click', () => {
    CreateCamera();
    addBtn.classList.remove('open');
  });

})();
