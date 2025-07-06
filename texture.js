document.getElementById('importButton').addEventListener('change', function(event) { 
  const file = event.target.files[0];
  if (!file) return;

  if (!selectedCube) {
    alert("Nenhum modelo selecionado!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const texture = new THREE.Texture(img);

      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const repeatFactor = parseFloat(document.getElementById('textureRepeatFactor')?.value) || 2;
      const rotationDegrees = parseFloat(document.getElementById('textureRotation')?.value) || 0;
      const rotationRadians = rotationDegrees * Math.PI / 180;

      texture.center.set(0.5, 0.5);
      texture.rotation = rotationRadians;
      texture.needsUpdate = true;

      // Aplica textura a todos os filhos do objeto (caso OBJ tenha múltiplos meshes)
      selectedCube.traverse(child => {
        if (child.isMesh) {
          // Opcional: escala baseada no tamanho do mesh
          const scale = child.scale;
          texture.repeat.set(scale.x / repeatFactor, scale.z / repeatFactor);

          child.material = new THREE.MeshBasicMaterial({ map: texture });
          child.material.needsUpdate = true;
        }
      });
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});