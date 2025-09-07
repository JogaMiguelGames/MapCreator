// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    cubes: cubes.map(obj => {
      let textureData = null;
      if (obj.material?.map?.image?.src) {
        textureData = obj.material.map.image.src;
      }

      // Detecta o tipo de geometria ou modelo
      let type = 'cube';
      if (obj.geometry === sphere_geometry) type = 'sphere';
      else if (obj.geometry === plane_geometry) type = 'plane';
      else if (obj.userData?.isCameraModel) type = 'camera'; // <- marca o modelo

      return {
        type,
        name: obj.name || 'Object',
        position: { x: obj.position?.x || 0, y: obj.position?.y || 0, z: obj.position?.z || 0 },
        scale: { x: obj.scale?.x || 1, y: obj.scale?.y || 1, z: obj.scale?.z || 1 },
        rotation: { x: obj.rotation?.x || 0, y: obj.rotation?.y || 0, z: obj.rotation?.z || 0 },
        color: `#${obj.material?.color?.getHexString() || 'ffffff'}`,
        texture: textureData
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
      loadMapData(mapData);
      loadInput.value = '';
    } catch (err) {
      alert('Erro ao carregar mapa: arquivo inválido ou corrompido.');
      console.error(err);
    }
  };
  reader.readAsText(file);
});

// --- FUNÇÃO PRINCIPAL DE CARREGAR MAPA ---
function loadMapData(mapData) {
  const cubesData = mapData.cubes || mapData.objects || [];

  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  // Limpa objetos antigos
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;

  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

    if (data.type === 'camera') {
      // Carregar modelo externo
      const loader = new THREE.OBJLoader();
      loader.load('resources/models/editor/camera/camera.obj', (obj) => {
        obj.traverse(child => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color: data.color || '#ffffff' });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        obj.name = data.name || 'Camera';
        obj.position.set(data.position.x, data.position.y, data.position.z);
        obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
        obj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

        obj.userData.isCameraModel = true;

        scene.add(obj);
        cubes.push(obj);
        updatePanelForCube(obj);
        updateCubeList();
      });

      return; // <- já tratou a camera
    }

    // Seleciona geometria correta
    let geometry;
    switch (data.type) {
      case 'sphere':
        geometry = sphere_geometry;
        break;
      case 'plane':
        geometry = plane_geometry;
        break;
      default:
        geometry = box_geometry;
    }

    const material = new THREE.MeshStandardMaterial({ color: data.color || '#ffffff' });
    const obj = new THREE.Mesh(geometry, material);

    obj.name = data.name || 'Cube';
    obj.position.set(data.position.x, data.position.y, data.position.z);
    obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
    obj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

    obj.castShadow = true;
    obj.receiveShadow = true;

    if (data.texture) {
      const img = new Image();
      img.src = data.texture;
      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        obj.material.map = tex;
        obj.material.needsUpdate = true;
      };
    }

    scene.add(obj);
    cubes.push(obj);
  });

  selectedCube = cubes[0] || null;
  updatePanelForCube(selectedCube);
  updateCubeList();
}
