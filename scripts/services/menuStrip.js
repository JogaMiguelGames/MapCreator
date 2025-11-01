// scripts/services/menuStrip.js
import { Project, Model, Page, Tree_View, Icon } from '../../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../../libs/mcl/add.js';

(function(){
  const fileBtn = document.getElementById('fileMenuBtn');
  if (!fileBtn) return;

  const addBtn = document.getElementById('addMenuBtn');
  if (!addBtn) return;

  // abrir/fechar no clique
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

  // teclado Enter / Space
  [fileBtn, addBtn].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!fileBtn.contains(e.target)) {
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    }
    if (!addBtn.contains(e.target)) {
      addBtn.classList.remove('open');
      addBtn.setAttribute('aria-expanded','false');
    }
  });

  // helper: tenta chamar função global, senão faz fallback em botão/input
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

    console.warn('safeInvoke: nenhuma ação disponível para', names);
    return false;
  }

  // --- FILE menu: Open (menuOpen or menuLoad) ---
  const menuOpenEl = document.getElementById('menuOpen') || document.getElementById('menuLoad');
  if (menuOpenEl) {
    menuOpenEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // tenta vários nomes comuns e fallback para botão/input
      safeInvoke(['openMap','loadMap','openFileDialog'], 'loadButton', 'loadInput');
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    });
  }

  // --- FILE menu: Save (menuSave) ---
  const menuSaveEl = document.getElementById('menuSave');
  if (menuSaveEl) {
    menuSaveEl.addEventListener('click', (e) => {
      e.stopPropagation();
      safeInvoke('saveMap', 'saveButton');
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    });
  }

  // -- ADD MENU: cria objetos direto --
  document.getElementById('menuCube')?.addEventListener('click', () => {
    createCube();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuCylinder')?.addEventListener('click', () => {
    createCylinder();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuSphere')?.addEventListener('click', () => {
    createSphere();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuCone')?.addEventListener('click', () => {
    createCone();
    addBtn.classList.remove('open');
  });


  document.getElementById('menuPlane')?.addEventListener('click', () => {
    createPlane();
    addBtn.classList.remove('open');
  });
  
  document.getElementById('menuCamera')?.addEventListener('click', () => {
    createCamera();
    addBtn.classList.remove('open');
  });

})();
