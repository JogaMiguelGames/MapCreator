window.addEventListener('DOMContentLoaded', () => {
  const colorHexInput = document.getElementById('colorHex');
  const colorPreview = document.getElementById('colorPreview');
  const colorPalette = document.getElementById('colorPalette');
  const swatches = colorPalette.querySelectorAll('.color-swatch');

  if (!colorHexInput || !colorPreview || !colorPalette) {
    console.warn('Elementos colorHex, colorPreview ou colorPalette não encontrados!');
    return;
  }

  function updateColorPreview() {
    const val = colorHexInput.value.trim();
    if (/^#([0-9a-fA-F]{6})$/.test(val)) {
      colorPreview.style.backgroundColor = val;
    } else {
      colorPreview.style.backgroundColor = '#333';
    }
  }

  // Atualiza o preview ao carregar
  updateColorPreview();

  // Atualiza o preview ao digitar (se input habilitado)
  colorHexInput.addEventListener('input', updateColorPreview);

  // Alterna visibilidade da paleta ao clicar no preview
  colorPreview.addEventListener('click', () => {
    if (colorPalette.hasAttribute('hidden')) {
      colorPalette.removeAttribute('hidden');
      // Focus no primeiro botão da paleta para acessibilidade
      swatches[0].focus();
    } else {
      colorPalette.setAttribute('hidden', '');
    }
  });

  // Se clicar numa cor da paleta, atualiza o input e o preview
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-color');
      colorHexInput.value = c;
      updateColorPreview();
      colorPalette.setAttribute('hidden', '');
    });
  });

  // Fecha a paleta se clicar fora dela ou do preview
  document.addEventListener('click', (e) => {
    if (
      !colorPalette.contains(e.target) &&
      e.target !== colorPreview
    ) {
      colorPalette.setAttribute('hidden', '');
    }
  });

  // Opcional: permite abrir a paleta também via teclado (Enter ou Espaço)
  colorPreview.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      colorPreview.click();
    }
  });
});
