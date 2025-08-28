// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    cubes: cubes.map(cube => {
      let textureData = null;
      if (cube.material?.map?.image?.src) {
        textureData = cube.material.map.image.src;
      }
      return {
        name: cube.name || 'Cube',
        position: {
          x: cube.position?.x || 0,
          y: cube.position?.y || 0,
          z: cube.position?.z || 0
        },
        scale: {
          x: cube.scale?.x || 1,
          y: cube.scale?.y || 1,
          z: cube.scale?.z || 1
        },
        rotation: {
          x: cube.rotation?.x || 0,
          y: cube.rotation?.y || 0,
          z: cube.rotation?.z || 0
        },
        color: `#${cube.material?.color?.getHexString() || 'ffffff'}`,
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

// --- FUNÇÃO PRINCIPAL DE CARREGAR MAPA COM SOMBRA/LUZ ---
function loadMapData(mapData) {
  const cubesData = mapData.cubes || mapData.objects || [];

  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  // Limpa cubos antigos
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;

  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

    const material = new THREE.MeshStandardMaterial({ color: data.color || '#ffffff' });
    const cube = new THREE.Mesh(cube_geometry, material);

    cube.name = data.name || 'Cube';
    cube.position.set(data.position.x, data.position.y, data.position.z);
    cube.scale.set(data.scale.x, data.scale.y, data.scale.z);
    cube.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

    // Ativa sombras
    cube.castShadow = true;
    cube.receiveShadow = true;

    // Carrega textura se houver
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
}

// --- LOAD AUTOMÁTICO VIA URL (?map=NomeDoMapa) ---
(function () {
  const params = new URLSearchParams(window.location.search);
  const mapName = params.get("map");

  if (mapName) {
    const filePath = `resources/maps/${mapName}.map`;
    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar mapa: " + filePath);
        return res.json();
      })
      .then(mapData => loadMapData(mapData))
      .catch(err => {
        alert("Erro ao carregar mapa via URL.");
        console.error(err);
      });
  }
})();
