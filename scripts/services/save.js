// ===================== SAVE.JS =====================

// Referência ao botão
const saveButton = document.getElementById('saveButton');

// Função principal de salvar mapa
function saveMap() {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    cubes: cubes.map(obj => {
      let type = 'cube';
      let color = '#ffffff';
      let textureData = null;

      // Detecta tipo de objeto
      if (obj.geometry === sphere_geometry) {
        type = 'sphere';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.geometry === cylinder_geometry) {
        type = 'cylinder';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.geometry === cone_geometry) {
        type = 'cone';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.geometry === plane_geometry) {
        type = 'plane';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.userData?.isCameraModel) {
        type = 'camera';

        // percorre os meshes da câmera para capturar cor e textura
        obj.traverse(child => {
          if (child.isMesh && child.material) {
            color = `#${child.material.color?.getHexString() || 'ffffff'}`;
            if (child.material.map?.image?.src) {
              textureData = child.material.map.image.src;
            }
          }
        });

      } else {
        type = 'cube';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;
      }

      return {
        type,
        name: obj.name || 'Object',
        position: {
          x: obj.position?.x || 0,
          y: obj.position?.y || 0,
          z: obj.position?.z || 0
        },
        scale: {
          x: obj.scale?.x || 1,
          y: obj.scale?.y || 1,
          z: obj.scale?.z || 1
        },
        rotation: {
          x: obj.rotation?.x || 0,
          y: obj.rotation?.y || 0,
          z: obj.rotation?.z || 0
        },
        color,
        texture: textureData
      };
    })
  };

  // Converte para JSON formatado
  const json = JSON.stringify(mapData, null, 2);

  // Cria download automático
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map1.map';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Clique no botão "Save"
saveButton?.addEventListener('click', saveMap);

