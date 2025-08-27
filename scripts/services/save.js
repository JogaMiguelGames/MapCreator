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

        // Reset scene
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }

        // Restore background and time
        scene.background = new THREE.Color(mapData.sceneColor || "#87ceeb");
        if (mapData.timeOfDay !== undefined) {
          updateLightingByTime(mapData.timeOfDay);
        }

        // Load objects
        mapData.objects.forEach(obj => {
          if (obj.type === "model") {
            // Rebuild OBJ string from line1, line2, line3...
            let objContent = "";
            let lineIndex = 1;
            while (obj[`line${lineIndex}`] !== undefined) {
              objContent += obj[`line${lineIndex}`] + "\n";
              lineIndex++;
            }

            const loader = new THREE.OBJLoader();
            const model = loader.parse(objContent);

            model.position.set(obj.position.x, obj.position.y, obj.position.z);
            model.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
            model.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);

            if (obj.color) {
              model.traverse(child => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({ color: obj.color });
                }
              });
            }

            scene.add(model);
          }
        });

      } catch (err) {
        console.error("Error loading map:", err);
      }
    };

    reader.readAsText(file);
  };
  input.click();
});
