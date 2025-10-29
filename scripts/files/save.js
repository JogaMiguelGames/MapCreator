// === save.js - Map Creator === 
import { Project, Model, Page, Icon } from './libs/mcl.js';

const saveButton = document.getElementById('saveButton');

let unsavedChanges = false;

function markUnsaved() {
  unsavedChanges = true;
}

Model.Objects.forEach(Model.Object3D => {
  Model.Object3D.userData.onChange = markUnsaved;
});

function saveMap() {
  const scriptInput = document.getElementById('scriptInput');
  const scriptCode = scriptInput ? scriptInput.value : '';

  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    customFolders: window.customFolders || [],
    customScripts: window.customScripts || [],
    cubes: Model.Objects.map(obj => {
      let type = 'cube';
      let color = '#ffffff';
      let textureData = null;

      if (obj.geometry === sphere_geometry) type = 'sphere';
      else if (obj.geometry === cylinder_geometry) type = 'cylinder';
      else if (obj.geometry === cone_geometry) type = 'cone';
      else if (obj.geometry === plane_geometry) type = 'plane';
      else if (obj.userData?.isCameraModel) type = 'camera';

      color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
      if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      return {
        type,
        name: obj.name || 'Object',
        position: { x: obj.position?.x || 0, y: obj.position?.y || 0, z: obj.position?.z || 0 },
        scale: { x: obj.scale?.x || 1, y: obj.scale?.y || 1, z: obj.scale?.z || 1 },
        rotation: { x: obj.rotation?.x || 0, y: obj.rotation?.y || 0, z: obj.rotation?.z || 0 },
        color,
        texture: textureData,
        icon: obj.userData.icon || "cube"
      };
    }),
    script: scriptCode
  };

  const json = JSON.stringify(mapData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = Project.File.Name.Map;
  a.click();
  URL.revokeObjectURL(a.href);

  unsavedChanges = false;
}

saveButton?.addEventListener('click', saveMap);

window.addEventListener('beforeunload', (e) => {
  if (unsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});
