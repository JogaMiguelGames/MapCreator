// === LOAD.JS - Map Creator===
import { Project, Model, Page, Tree_View, Icon } from '../../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../../libs/mcl/add.js';

const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

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
        console.error("The .Map file is not valid! This is the error:", e);
        alert("Invalid Map File");
        return;
      }
      loadMapData(mapData);
    })
    .catch(err => {
      console.error("The map could not be loaded via URL. This is the error:", err);
      alert("The map could not be loaded via URL.");
    });
}

function openMap() {
  if (!loadInput) {
    console.error("openMap: #loadInput Not found in DOM.");
    return;
  }
  loadInput.click();
}
window.openMap = openMap;

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
      alert('Invalid .Map file!');
      console.error(err);
    }
  };
  reader.readAsText(file);
});

function loadMapData(mapData) {
  const cubesData = mapData.Objects || [];
  const foldersData = mapData.customFolders || [];
  const scriptsData = mapData.customScripts || [];
  const scriptInput = document.getElementById('scriptInput');

  if (mapData.sceneColor) {
    scene.background.set(mapData.sceneColor);
    if (bgColorInput) bgColorInput.value = mapData.sceneColor;
  }

  if (scriptInput && typeof mapData.script === 'string') {
    scriptInput.value = mapData.script;
  }

  Model.Objects.forEach(c => scene.remove(c));
  Model.Objects.length = 0;

  window.customFolders = foldersData.map(f => ({ ...f }));
  window.customScripts = (scriptsData || []).map(s => ({
    id: s.id,
    name: s.name,
    content: s.content || 'console.log("Empty Script");'
  }));

  const objLoader = new THREE.OBJLoader();
  const textureLoader = new THREE.TextureLoader();

  cubesData.forEach(data => {
    if (!data.position || !data.scale || !data.rotation) return;

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

          object.position.set(data.position.x, data.position.y, data.position.z);
          object.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
          object.scale.set(data.scale.x, data.scale.y, data.scale.z);
          object.name = data.name || "Camera";

          object.userData.icon = "camera";

          scene.add(object);
          Model.Objects.push(object);

          window.addManipulationSpheres(object);
          window.UpdateTreeView();
          window.updatePanelForCube(object);
        },
        (xhr) => console.log(`Loading camera model: ${(xhr.loaded / xhr.total) * 100}% complete`),
        (error) => console.error("Error loading camera OBJ:", error)
      );
      return;
    }

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

    window.addManipulationSpheres(obj);
    scene.add(obj);
    Model.Objects.push(obj);
  });

  Model.Selected.Object = Model.Objects[0] || null;
  window.updatePanelForCube(window.object3D || Model.Object3D || null);
  window.UpdateTreeView();
  window.updateSpheresVisibility();
}
