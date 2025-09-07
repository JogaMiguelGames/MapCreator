// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    cubes: cubes.map(obj => {
      let textureData = null;
      if (obj.material?.map?.image?.src) {
        textureData = obj.material.map.image.src;
      }

      // Detecta o tipo de geometria
      let type = 'cube';
      if (obj.geometry === sphere_geometry) type = 'sphere';
      else if (obj.geometry === plane_geometry) type = 'plane';

      return {
        type, // novo campo
        name: obj.name || 'Cube',
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
        color: `#${obj.material?.color?.getHexString() || 'ffffff'}`,
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

