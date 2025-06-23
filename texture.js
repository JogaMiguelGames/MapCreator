document.getElementById('importButton').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!selectedCube) {
    alert("Nenhum cubo selecionado!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const texture = new THREE.Texture(img);

      // 🔁 Repetição
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      // 🎛️ Obter controles do usuário
      const repeatFactor = parseFloat(document.getElementById('textureRepeatFactor')?.value) || 2;
      const rotationDegrees = parseFloat(document.getElementById('textureRotation')?.value) || 0;
      const rotationRadians = rotationDegrees * Math.PI / 180;

      // 📐 Baseado na escala do cubo (X = largura, Z = profundidade)
      const scale = selectedCube.scale;
      texture.repeat.set(scale.x / repeatFactor, scale.z / repeatFactor);

      // 🔄 Rotação em torno do centro
      texture.center.set(0.5, 0.5);
      texture.rotation = rotationRadians;

      texture.needsUpdate = true;

      // Aplicar material com a nova textura
      selectedCube.material = new THREE.MeshBasicMaterial({ map: texture });
      selectedCube.material.needsUpdate = true;
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});