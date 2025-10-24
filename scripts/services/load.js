// ===================== LOAD.JS =====================

// Referências aos botões e input hidden
const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

// Pega o parâmetro ?map=MapName
const urlParams = new URLSearchParams(window.location.search);
const mapName = urlParams.get('map');

if (mapName) {
  const mapPath = `resources/maps/${mapName}.map`;

  fetch(mapPath)
    .then(res => {
      if (!res.ok) throw new Error("Mapa não encontrado");
      return res.text();
    })
    .then(mapText => {
      let mapData;
      try {
        mapData = JSON.parse(mapText);
      } catch(e) {
        console.error("Arquivo não é JSON válido:", e);
        alert("Erro: mapa não está em formato JSON");
        return;
      }
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

// Quando o usuário escolhe um arquivo
loadInput?.addEventListener('change', () => {
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

function loadMapData(mapData) {
  const cubesData = mapData.cubes || [];
  const foldersData = mapData.customFolders || []; // recupera pastas salvas
  const scriptInput = document.getElementById('scriptInput');

  // Restaura cor do fundo
  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  if (scriptInput && typeof mapData.script === 'string') {
    scriptInput.value = mapData.script;
  }

  // Remove objetos antigos
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;

  // Restaura pastas
  window.customFolders = foldersData.map(f => ({ ...f }));

  // Cria cubes
  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

    let geometry;
    switch (data.type) {
      case 'sphere': geometry = sphere_geometry; break;
      case 'cylinder': geometry = cylinder_geometry; break;
      case 'cone': geometry = cone_geometry; break;
      case 'plane': geometry = plane_geometry; break;
      default: geometry = box_geometry;
    }

    const material = new THREE.MeshStandardMaterial({ color: data.color || '#ffffff' });
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

    // --- CRIA ESFERAS DE MANIPULAÇÃO ---
    obj.userData.spheres = [];
    offsets.forEach(o => {
      const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
      const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);

      sphere.castShadow = false;
      sphere.receiveShadow = false;
      sphere.position.copy(o.pos.clone().multiplyScalar(2));
      sphere.userData.axis = o.axis;
      sphere.userData.isManipulator = true;
      sphere.visible = false;

      obj.add(sphere);
      obj.userData.spheres.push(sphere);
    });

    scene.add(obj);
    cubes.push(obj);
  });

  // Atualiza seleção e UI
  selectedCube = cubes[0] || null;
  updatePanelForCube(selectedCube);
  updateCubeList();       // exibe pastas e objetos
  updateSpheresVisibility(); // garante esferas visíveis apenas no selecionado
}
