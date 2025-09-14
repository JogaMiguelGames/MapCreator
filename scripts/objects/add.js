// -- Add.js -- Map Creator

function createCube() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCube = new THREE.Mesh(box_geometry, newMaterial);
  
  newCube.position.set(0, 0, 0);
  newCube.name = `Cube ${cubes.length}`;
  newCube.castShadow = true;
  newCube.receiveShadow = true;

  scene.add(newCube);
  cubes.push(newCube);

  selectedCube = newCube;
  updatePanelForCube(newCube);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newCube });
}

function createSphere() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newSphere = new THREE.Mesh(sphere_geometry, newMaterial);
  
  newSphere.position.set(0, 0, 0);
  newSphere.name = `Sphere ${cubes.length}`;
  newSphere.castShadow = true;
  newSphere.receiveShadow = true;

  scene.add(newSphere);
  cubes.push(newSphere);

  selectedCube = newSphere;
  updatePanelForCube(newSphere);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newSphere });
}

function createPyramid() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newPlane = new THREE.Mesh(pyramid_geometry, newMaterial);

  newPlane.position.set(0, 0, 0);
  newPlane.rotation.x = -Math.PI / 2; // deixa o plano virado para o chão
  
  newPlane.name = `Pyramid ${cubes.length}`;
  newPlane.castShadow = true;
  newPlane.receiveShadow = true;

  scene.add(newPlane);
  cubes.push(newPlane);

  selectedCube = newPlane;
  updatePanelForCube(newPlane);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newPlane });
}

function createPlane() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newPlane = new THREE.Mesh(plane_geometry, newMaterial);

  newPlane.position.set(0, 0, 0);
  newPlane.rotation.x = -Math.PI / 2; // deixa o plano virado para o chão
  
  newPlane.name = `Plane ${cubes.length}`;
  newPlane.castShadow = true;
  newPlane.receiveShadow = true;

  scene.add(newPlane);
  cubes.push(newPlane);

  selectedCube = newPlane;
  updatePanelForCube(newPlane);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newPlane });
}

function createCamera() {
  // Check if a camera already exists in the scene
  const existingCamera = scene.getObjectByName("Camera");
  if (existingCamera) {
    console.warn("A camera already exists in the scene!");
    return;
  }

  const objLoader = new THREE.OBJLoader();
  const textureLoader = new THREE.TextureLoader();

  // Load the texture
  const texture = textureLoader.load("resources/models/editor/camera/texture.png");

  objLoader.load(
    "resources/models/editor/camera/camera.obj",
    (object) => {
      // Apply textured material to all meshes
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,   // apply texture
            color: 0xffffff,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      object.position.set(0, 0, 0);
      object.scale.set(0.3, 0.3, 0.3);
      object.name = "Camera";

      scene.add(object);
      cubes.push(object);

      selectedCube = object;
      updatePanelForCube(object);
      updateCubeList();

      pushToHistory({ type: "delete", object: object });
    },
    (xhr) => {
      console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% complete`);
    },
    (error) => {
      console.error("Error loading OBJ model:", error);
    }
  );
}

document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();

    if (command.toLowerCase() === "create.new.cube") {
      createCube();
    }
    else if (command.toLowerCase() === "create.new.sphere") {
      createSphere();
    }
    else if (command.toLowerCase() === "create.new.plane") {
      createPlane();
    }
    else if (command.toLowerCase() === "create.new.camera") {
      createCamera();
    }
    
    this.value = "";
  }
});















