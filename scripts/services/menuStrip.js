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

// Abrir mapa
  document.getElementById("menuLoad")?.addEventListener("click", () => {
    openMap();
  });
  
  // Salvar mapa
  document.getElementById("menuSave")?.addEventListener("click", () => {
    saveMap();
  });

  // -- ADD MENU: cria objetos direto --
  document.getElementById('menuCube')?.addEventListener('click', () => {
    createCube();
    addBtn.classList.remove('open');
  });

  document.getElementById('menuSphere')?.addEventListener('click', () => {
    createSphere();
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
