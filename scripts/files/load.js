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
      } catch (e) {
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
window.openMap = openMap;

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
  const foldersData = mapData.customFolders || [];
  const scriptInput = document.getElementById('scriptInput');

  // Restaura cor do fundo
  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  // Restaura script
  if (scriptInput && typeof mapData.script === 'string') {
    scriptInput.value = mapData.script;
  }

  // Remove objetos antigos
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;

  // Restaura pastas
  window.customFolders = foldersData.map(f => ({ ...f }));

  const objLoader = new THREE.OBJLoader();
  const textureLoader = new THREE.TextureLoader();

  // Recria objetos
  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

    // --- SE O OBJETO TEM ÍCONE DE CÂMERA ---
    if (data.icon === "camera") {
      const texture = textureLoader.load("resources/models/editor/camera/texture.png");
      objLoader.load(
        "resources/models/editor/camera/camera.obj",
        (object) => {
          object.traverse(child => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Posição, rotação e escala vindas do arquivo .map
          object.position.set(data.position.x, data.position.y, data.position.z);
          object.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
          object.scale.set(data.scale.x, data.scale.y, data.scale.z);
          object.name = data.name || "Camera";

          object.userData.icon = "camera";

          // Adiciona à cena
          scene.add(object);
          cubes.push(object);

          // Adiciona esferas de manipulação e atualiza UI
          addManipulationSpheres(object);
          updateCubeList();
          updatePanelForCube(object);
        },
        (xhr) => console.log(`Loading camera model: ${(xhr.loaded / xhr.total) * 100}% complete`),
        (error) => console.error("Error loading camera OBJ:", error)
      );
      return; // não criar cubo genérico
    }

    // --- OUTROS OBJETOS NORMAIS ---
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

    obj.userData.icon = data.icon || "cube";
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

    addManipulationSpheres(obj);
    scene.add(obj);
    cubes.push(obj);
  });

  // Atualiza seleção e UI
  selectedCube = cubes[0] || null;
  updatePanelForCube(selectedCube);
  updateCubeList();
  updateSpheresVisibility();
}
