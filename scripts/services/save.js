// --- SAVE ---
document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = {
    sceneColor: `#${scene.background.getHexString()}`,
    timeOfDay: parseInt(timeInput.value),
    objects: cubes.map(obj => {
      const isCube = obj.geometry && obj.geometry.type === "BoxGeometry";

      let textureData = null;
      if (obj.material?.map?.image?.src) {
        textureData = obj.material.map.image.src;
      }

      // Se for modelo, salva as linhas do OBJ
      let objLines = null;
      if (!isCube && obj.userData.objLines) {
        objLines = {};
        obj.userData.objLines.forEach((line, index) => {
          objLines[`line${index + 1}`] = line;
        });
      }

      return {
        type: isCube ? "cube" : "model",
        name: obj.name || "Object",
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z
        },
        scale: {
          x: obj.scale.x,
          y: obj.scale.y,
          z: obj.scale.z
        },
        rotation: {
          x: obj.rotation.x,
          y: obj.rotation.y,
          z: obj.rotation.z
        },
        color: obj.material?.color ? `#${obj.material.color.getHexString()}` : "#ffffff",
        texture: textureData,
        ...objLines // espalha line1, line2, line3 no JSON
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

        // Load scene color
        scene.background = new THREE.Color(mapData.sceneColor || "#000000");

        // Load time of day
        if (typeof mapData.timeOfDay === "number") {
          updateLightingByTime(mapData.timeOfDay);
        }

        // Clear old objects
        objects.forEach(obj => scene.remove(obj));
        objects.length = 0;

        // Load objects
        mapData.objects.forEach(objData => {
          if (objData.type === "model") {
            // Rebuild OBJ text from line1, line2, ...
            let objText = "";
            Object.keys(objData)
              .filter(key => key.startsWith("line"))
              .sort((a, b) => parseInt(a.replace("line", "")) - parseInt(b.replace("line", "")))
              .forEach(lineKey => {
                objText += objData[lineKey] + "\n";
              });

            // Parse OBJ
            const loader = new THREE.OBJLoader();
            const object = loader.parse(objText);

            object.position.set(objData.position.x, objData.position.y, objData.position.z);
            object.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
            object.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);

            // Apply color if exists
            object.traverse(child => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: objData.color || "#ffffff"
                });
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(object);
            objects.push(object);
          }
        });

      } catch (err) {
        alert("Error loading map: " + err.message);
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  input.click();
});
