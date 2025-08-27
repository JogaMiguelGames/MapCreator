// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    timeOfDay: parseInt(timeInput.value),
    objects: cubes.map(obj => {
      const isCube = obj.geometry && obj.geometry.type === "BoxGeometry";

      let textureData = null;
      if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      return {
        type: isCube ? "cube" : "model",
        name: obj.name || "Object",
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        color: obj.material?.color ? `#${obj.material.color.getHexString()}` : "#ffffff",
        texture: textureData,
        // Salva o OBJ em Base64 para JSON seguro
        objData: !isCube && obj.userData.objSource
          ? btoa(unescape(encodeURIComponent(obj.userData.objSource)))
          : null
      };
    })
  };

  const json = JSON.stringify(mapData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map1.map';
  a.click();
  URL.revokeObjectURL(a.href);
});

// --- LOAD ---
const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

loadButton.addEventListener('click', () => loadInput.click());

loadInput.addEventListener('change', () => {
  const file = loadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const mapData = JSON.parse(e.target.result);

      // Atualiza cor de fundo
      if (mapData.sceneColor) {
        scene.background.set(mapData.sceneColor);
        if (bgColorInput) bgColorInput.value = mapData.sceneColor;
      }

      // Remove objetos antigos
      cubes.forEach(obj => scene.remove(obj));
      cubes.length = 0;

      // Carrega objetos
      mapData.objects.forEach(data => {
        if (data.type === "cube") {
          // --- Cubo ---
          const material = new THREE.MeshBasicMaterial({ color: data.color || '#ffffff' });
          const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

          cube.name = data.name || "Cube";
          cube.position.set(data.position.x, data.position.y, data.position.z);
          cube.scale.set(data.scale.x, data.scale.y, data.scale.z);
          cube.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

          if (data.texture) {
            const img = new Image();
            img.src = data.texture;
            img.onload = () => {
              const tex = new THREE.Texture(img);
              tex.needsUpdate = true;
              cube.material.map = tex;
              cube.material.needsUpdate = true;
            };
          }

          scene.add(cube);
          cubes.push(cube);

        } else if (data.type === "model" && data.objData) {
          // --- Modelo OBJ ---
          const loader = new THREE.OBJLoader();
          const objText = decodeURIComponent(escape(atob(data.objData)));
          const object = loader.parse(objText);

          object.name = data.name || "Model";
          object.position.set(data.position.x, data.position.y, data.position.z);
          object.scale.set(data.scale.x, data.scale.y, data.scale.z);
          object.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

          object.traverse(child => {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial({ color: data.color || 0xffffff });
              if (data.texture) {
                const img = new Image();
                img.src = data.texture;
                img.onload = () => {
                  const tex = new THREE.Texture(img);
                  tex.needsUpdate = true;
                  child.material.map = tex;
                  child.material.needsUpdate = true;
                };
              }
            }
          });

          object.userData.objSource = objText;
          scene.add(object);
          cubes.push(object);
        }
      });

      selectedCube = cubes[0] || null;
      updatePanelForCube(selectedCube);
      updateCubeList();
      loadInput.value = '';

    } catch (err) {
      alert('Erro ao carregar mapa: arquivo inválido ou corrompido.');
      console.error(err);
    }
  };
  reader.readAsText(file);
});
