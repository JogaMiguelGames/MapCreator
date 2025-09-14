// save.js
function saveMap() {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    cubes: cubes.map(obj => {
      let type = 'cube';
      let color = '#ffffff';
      let textureData = null;

      if (obj.geometry === sphere_geometry) {
        type = 'sphere';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.geometry === plane_geometry) {
        type = 'plane';
        color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
        if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      } else if (obj.userData?.isCameraModel) {
        type = 'camera';
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
        position: { x: obj.position?.x || 0, y: obj.position?.y || 0, z: obj.position?.z || 0 },
        scale: { x: obj.scale?.x || 1, y: obj.scale?.y || 1, z: obj.scale?.z || 1 },
        rotation: { x: obj.rotation?.x || 0, y: obj.rotation?.y || 0, z: obj.rotation?.z || 0 },
        color,
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
}

document.getElementById('saveButton')?.addEventListener('click', saveMap);
