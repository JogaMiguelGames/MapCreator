// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`, // Sky color
    timeOfDay: parseInt(timeInput.value),             // Hora do dia
    objects: cubes.map(obj => {
      let textureData = null;
      if (obj.material?.map?.image?.src) {
        textureData = obj.material.map.image.src;
      }

      return {
        type: "cube",
        name: obj.name || "Cube",
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        color: obj.material?.color ? `#${obj.material.color.getHexString()}` : "#ffffff",
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


// --- LOAD ---
document.getElementById('loadButton').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.map';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target.result);

        // Sky color
        scene.background = new THREE.Color(mapData.sceneColor || "#000000");

        // Hora
        if (typeof mapData.timeOfDay === "number") {
          updateLightingByTime(mapData.timeOfDay);
        }

        // Limpa cubos antigos
        cubes.forEach(c => scene.remove(c));
        cubes.length = 0;

        // Carrega cubos
        mapData.objects.forEach(objData => {
          if (objData.type === "cube") {
            const geometry = new THREE.BoxGeometry();
            let material;

            if (objData.texture) {
              const textureLoader = new THREE.TextureLoader();
              const tex = textureLoader.load(objData.texture);
              material = new THREE.MeshStandardMaterial({ map: tex });
            } else {
              material = new THREE.MeshStandardMaterial({ color: objData.color || "#ffffff" });
            }

            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(objData.position.x, objData.position.y, objData.position.z);
            cube.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
            cube.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);

            cube.castShadow = true;
            cube.receiveShadow = true;

            scene.add(cube);
            cubes.push(cube);
          }
        });

      } catch (err) {
        alert("Error loading map: " + err.message);
        gconsole.print("Error loading map: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
});
