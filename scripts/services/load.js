// ===================== LOAD.JS =====================

// Referências aos botões e input hidden
const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

// Pega o parâmetro ?map=MapName
const urlParams = new URLSearchParams(window.location.search);
const mapName = urlParams.get('map');

if (mapName) {
  // monta o path do JSON
  const mapPath = `resources/maps/${mapName}.json`;

  fetch(mapPath)
    .then(res => {
      if (!res.ok) throw new Error("Mapa não encontrado");
      return res.json();
    })
    .then(mapData => {
      loadMapData(mapData);
    })
    .catch(err => {
      console.error("Erro ao carregar mapa pelo link:", err);
      alert("Erro ao carregar o mapa pelo link");
    });
}

// Função que abre o seletor de arquivos
function openMap() {
  if (!loadInput) {
    console.error("openMap: #loadInput não encontrado no DOM.");
    return;
  }
  loadInput.click();
}
window.openMap = openMap; // expõe para o menuStrip.js

// Clique no botão "Load"
loadButton?.addEventListener('click', openMap);

// Quando o usuário escolhe um arquivo
loadInput?.addEventListener('change', () => {
  const file = loadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const mapData = JSON.parse(e.target.result);
      loadMapData(mapData);
      loadInput.value = ''; // reseta para permitir reabrir o mesmo arquivo depois
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

  // Restaura a cor do fundo
  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  // Remove objetos antigos
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;

  // Recria objetos
  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

    // Se for câmera
    if (data.type === 'camera') {
      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath('resources/models/editor/camera/');
      mtlLoader.load('camera.mtl', (materials) => {
        materials.preload();

        const loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('resources/models/editor/camera/');
        loader.load('camera.obj', (obj) => {
          obj.name = data.name || 'Camera';
          obj.position.set(data.position.x, data.position.y, data.position.z);
          obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
          obj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

          obj.userData.isCameraModel = true;

          // Ativa sombras
          obj.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(obj);
          cubes.push(obj);
          updatePanelForCube(obj);
          updateCubeList();
        });
      });

      return; // pula para o próximo objeto
    }

    // Seleciona geometria padrão
    let geometry;
    switch (data.type) {
      case 'sphere':
        geometry = sphere_geometry;
        break;
      case 'cylinder':
        geometry = cylinder_geometry;
        break;
      case 'cone':
        geometry = cone_geometry;
        break;
      case 'plane':
        geometry = plane_geometry;
        break;
      default:
        geometry = box_geometry;
    }

    const material = new THREE.MeshStandardMaterial({
      color: data.color || '#ffffff'
    });
    const obj = new THREE.Mesh(geometry, material);

    obj.name = data.name || 'Cube';
    obj.position.set(data.position.x, data.position.y, data.position.z);
    obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
    obj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

    obj.castShadow = true;
    obj.receiveShadow = true;

    // Aplica textura se existir
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

  // Atualiza painel e lista
  selectedCube = cubes[0] || null;
  updatePanelForCube(selectedCube);
  updateCubeList();
}
