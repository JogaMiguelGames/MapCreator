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

    // Seleciona geometria correta
    let geometry;
    switch(data.type){
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

    // Ativa sombras
    obj.castShadow = true;
    obj.receiveShadow = true;

    // Carrega textura se houver
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

// --- Carregar mapa via URL se houver ---
(function () {
  const params = new URLSearchParams(window.location.search);
  const mapName = params.get("map");

  if (mapName) {
    const base = window.location.pathname.replace(/\/[^/]*$/, "");
    const filePath = `${base}/resources/maps/${mapName}.map?nocache=${Date.now()}`;

    console.log("Carregando mapa:", filePath);

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
