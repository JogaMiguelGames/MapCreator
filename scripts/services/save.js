document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    timeOfDay: parseInt(timeInput.value),
    objects: cubes.map(obj => {
      // Detecta se é um cubo ou modelo (assumindo que OBJs não são BoxGeometry)
      const isCube = obj.geometry && obj.geometry.type === "BoxGeometry";

      let textureData = null;
      if (obj.material?.map?.image?.src) {
        textureData = obj.material.map.image.src;
      }

      return {
        type: isCube ? "cube" : "model",
        name: obj.name || "Object",
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z
        },
        scale: {
          x: obj.scale.x,
          y: obj.scale.y,
          z: obj.scale.z
        },
        rotation: {
          x: obj.rotation.x,
          y: obj.rotation.y,
          z: obj.rotation.z
        },
        color: obj.material?.color ? `#${obj.material.color.getHexString()}` : "#ffffff",
        texture: textureData,
        objData: !isCube ? obj.userData.objSource || null : null  // Guarda conteúdo OBJ se for modelo
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

const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

loadButton.addEventListener('click', () => {
  loadInput.click(); // abre seletor de arquivo
});

loadInput.addEventListener('change', () => {
  const file = loadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const mapData = JSON.parse(e.target.result);

      if (mapData.sceneColor) {
        scene.background.set(mapData.sceneColor);
        if (bgColorInput) bgColorInput.value = mapData.sceneColor;
      }

      // Remove cubos antigos da cena e array
      cubes.forEach(cube => scene.remove(cube));
      cubes.length = 0;

      mapData.cubes.forEach(data => {
        const material = new THREE.MeshBasicMaterial({ color: data.color || '#ffffff' });

        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          material
        );

        cube.name = data.name || 'Cube';
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
loadInput.addEventListener('change', () => {
  const file = loadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const mapData = JSON.parse(e.target.result);

      if (mapData.sceneColor) {
        scene.background.set(mapData.sceneColor);
        if (bgColorInput) bgColorInput.value = mapData.sceneColor;
      }

      // Remove cubos antigos da cena e array
      cubes.forEach(cube => scene.remove(cube));
      cubes.length = 0;

      mapData.cubes.forEach(data => {
        const material = new THREE.MeshBasicMaterial({ color: data.color || '#ffffff' });

        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          material
        );

        cube.name = data.name || 'Cube';
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

