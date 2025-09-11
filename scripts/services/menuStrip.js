(function(){
  const fileBtn = document.getElementById('fileMenuBtn');
  if (!fileBtn) return;

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

  document.getElementById('menuNew')?.addEventListener('click', () => {
    // se tiver função "new" implementada, chame aqui. Exemplo genérico:
    console.log('New -> implementar ação');
    fileBtn.classList.remove('open');
  });

  document.getElementById('menuExit')?.addEventListener('click', () => {
    // só exemplo: fechar menus; você pode chamar sua rotina de sair
    fileBtn.classList.remove('open');
  });
})();
