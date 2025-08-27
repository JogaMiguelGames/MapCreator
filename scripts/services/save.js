// --- SAVE.JS COMPLETO ---
// Certifique-se de incluir o OBJExporter.js do Three.js:
// <script src="https://threejs.org/examples/js/exporters/OBJExporter.js"></script>

document.getElementById('saveButton').addEventListener('click', () => {
  const exporter = new THREE.OBJExporter();

  // 1️⃣ Salva JSON da cena (.map)
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    timeOfDay: parseInt(timeInput.value),
    objects: cubes.map((obj, index) => {
      const isCube = obj.geometry && obj.geometry.type === "BoxGeometry";

      let textureData = null;
      if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      // Para modelos OBJ, exporta a string OBJ
      let objString = null;
      if (!isCube) {
        objString = exporter.parse(obj);
      }

      return {
        type: isCube ? "cube" : "model",
        name: obj.name || `object_${index + 1}`,
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        color: obj.material?.color ? `#${obj.material.color.getHexString()}` : "#ffffff",
        texture: textureData,
        objData: objString
      };
    })
  };

  // Salva o arquivo .map
  const jsonBlob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
  const aJson = document.createElement('a');
  aJson.href = URL.createObjectURL(jsonBlob);
  aJson.download = 'scene.map';
  aJson.click();
  URL.revokeObjectURL(aJson.href);

  // 2️⃣ Salva cada modelo OBJ separadamente
  mapData.objects.forEach(obj => {
    if (obj.type === 'model' && obj.objData) {
      const objBlob = new Blob([obj.objData], { type: 'text/plain' });
      const aObj = document.createElement('a');
      aObj.href = URL.createObjectURL(objBlob);
      aObj.download = `${obj.name}.obj`;
      aObj.click();
      URL.revokeObjectURL(aObj.href);
    }
  });

  console.log('Cena salva com sucesso! Arquivo .map e OBJ(s) exportados.');
});

// --- LOAD ---
const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

loadButton.addEventListener('click', () => {
  loadInput.click();
});

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

      // Remove objetos antigos da cena e do array
      cubes.forEach(obj => scene.remove(obj));
      cubes.length = 0;

      // Carrega objetos do mapa
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
          const object = loader.parse(data.objData);
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

          // Armazena a string OBJ para possível re-save
          object.userData.objSource = data.objData;

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

