(function(){
  const fileBtn = document.getElementById('fileMenuBtn');
  if (!fileBtn) return;

  const addBtn = document.getElementById('addMenuBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = fileBtn.classList.toggle('open');
    fileBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  addBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileBtn.click();
    }
  });
  
  // abrir/fechar no clique
  fileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = fileBtn.classList.toggle('open');
    fileBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // teclado (Enter / Space)
  fileBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileBtn.click();
    }
  });

  // fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!fileBtn.contains(e.target)) {
      fileBtn.classList.remove('open');
      fileBtn.setAttribute('aria-expanded','false');
    }
  });

  // ligar itens do menu aos botões que você já tem
  document.getElementById('menuOpen')?.addEventListener('click', () => {
    document.getElementById('loadButton')?.click();
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuSave')?.addEventListener('click', () => {
    document.getElementById('saveButton')?.click();
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuCube')?.addEventListener('click', () => {
    document.getElementById('createCube')?.click();
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuSphere')?.addEventListener('click', () => {
    document.getElementById('createSphere')?.click();
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuPlane')?.addEventListener('click', () => {
    document.getElementById('createPlane')?.click();
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuCamera')?.addEventListener('click', () => {
    document.getElementById('createCamera')?.click();
    fileBtn.classList.remove('open');
  });
  
})();
