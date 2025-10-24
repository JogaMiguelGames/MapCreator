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

      selectedCube.traverse(child => {
        if (child.isMesh && !child.userData.isManipulator) {
          const scale = child.scale;
          texture.repeat.set(scale.x / repeatFactor, scale.z / repeatFactor);
          child.material = new THREE.MeshBasicMaterial({ map: texture });
          child.material.needsUpdate = true;
        }
      });

      // Marca que o cubo tem textura
      selectedCube.hasTexture = true;

      // Atualiza o TreeView
      updateCubeList();
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});
