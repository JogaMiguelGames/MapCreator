// === save.js - Map Creator === 
import { Project, Model, Page, Tree_View, Icon } from '../../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../../libs/mcl/add.js';

const saveButton = document.getElementById('menuSave');

function saveMap() {
  const scriptInput = document.getElementById('scriptInput');
  const scriptCode = scriptInput ? scriptInput.value : '';

  if (window.Tree_View?.Selected?.Item && window.Tree_View.Selected.Item.content !== undefined) {
    window.Tree_View.Selected.Item.content = scriptCode;
  }

  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    customFolders: window.customFolders || [],
    customScripts: (window.customScripts || []).map(s => ({
      id: s.id,
      name: s.name,
      content: s.content || ''
    })),
    Objects: Model.Objects.map(obj => {
      let type = 'Object';
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
    })
  };

  const json = JSON.stringify(mapData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = Project.File.Name.Map;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.code === "KeyS") {
    saveMap();
  }
});

saveButton?.addEventListener('click', saveMap);

