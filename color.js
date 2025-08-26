const bgColorInput = document.getElementById('bgColorInput');
const bgColorPreview = document.getElementById('bgColorPreview');

const colorHexInput = document.getElementById('colorHex');
const objectColorPreview = document.getElementById('objectColorPreview');

function isValidHex(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function updatePreview(inputElem, previewElem) {
  const val = inputElem.value.trim();
  if (isValidHex(val)) {
    previewElem.style.backgroundColor = val;
  }
}

// Atualiza a cor quando o usuário digita
bgColorInput.addEventListener('input', () => updatePreview(bgColorInput, bgColorPreview));
colorHexInput.addEventListener('input', () => updatePreview(colorHexInput, objectColorPreview));

// Opcional: atualiza na inicialização (caso o input já tenha valor)
updatePreview(bgColorInput, bgColorPreview);

updatePreview(colorHexInput, objectColorPreview);
