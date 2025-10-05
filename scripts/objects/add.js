// -- Add.js -- Map Creator 

function createCube() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCube = new THREE.Mesh(box_geometry, newMaterial);
  
  newCube.position.set(0, 0, 0);
  newCube.name = `Cube ${cubes.length}`;
  newCube.castShadow = true;
  newCube.receiveShadow = true;

  // === Adiciona esferas ao novo cubo ===
  const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 8);
  const offsets = [
    { pos: new THREE.Vector3( 0,  0.4,  0), axis: 'y', color: 0x00ff00 },
    { pos: new THREE.Vector3( 0, -0.4,  0), axis: 'y', color: 0x00ff00 },
    { pos: new THREE.Vector3( 0.4,  0,  0), axis: 'x', color: 0xff0000 },
    { pos: new THREE.Vector3(-0.4,  0,  0), axis: 'x', color: 0xff0000 },
    { pos: new THREE.Vector3( 0,  0,  0.4), axis: 'z', color: 0x0000ff },
    { pos: new THREE.Vector3( 0,  0, -0.4), axis: 'z', color: 0x0000ff }
  ];

  newCube.userData.spheres = []; // Array para armazenar as esferas deste cubo

  offsets.forEach(o => {
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
    const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);
    
    sphere.castShadow = false;
    sphere.receiveShadow = false;
    
    sphere.position.copy(o.pos.clone().multiplyScalar(2));
    sphere.userData.axis = o.axis; 
    sphere.visible = false;
    newCube.add(sphere);
    newCube.userData.spheres.push(sphere);
  });

  scene.add(newCube);
  cubes.push(newCube);

  selectedCube = newCube;
  updatePanelForCube(newCube);
  updateCubeList();

  updateSpheresVisibility(); // Atualiza visibilidade das esferas
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

function createCylinder() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCylinder = new THREE.Mesh(cylinder_geometry, newMaterial);
  
  newCylinder.position.set(0, 0, 0);
  newCylinder.scale.set(0.5, 0.5, 0.5);
  newCylinder.name = `Cylinder ${cubes.length}`;
  newCylinder.castShadow = true;
  newCylinder.receiveShadow = true;

  scene.add(newCylinder);
  cubes.push(newCylinder);

  selectedCube = newCylinder;
  updatePanelForCube(newCylinder);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newCylinder });
}

function createCone() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCone = new THREE.Mesh(cone_geometry, newMaterial);

  newCone.position.set(0, 0, 0);
  newCobe.scale.set(0.5, 0.5, 0.5);
  
  newCone.name = `Cone ${cubes.length}`;
  newCone.castShadow = true;
  newCone.receiveShadow = true;

  scene.add(newCone);
  cubes.push(newCone);

  selectedCube = newCone;
  updatePanelForCube(newCone);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newCone });
}

function createPlane() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newPlane = new THREE.Mesh(plane_geometry, newMaterial);

  newPlane.position.set(0, 0, 0);
  newPlane.rotation.x = -Math.PI / 2;
  
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
    else if (command.toLowerCase() === "create.new.cylinder") {
      createCylinder();
    }
    else if (command.toLowerCase() === "create.new.sphere") {
      createSphere();
    }
    else if (command.toLowerCase() === "create.new.sphere") {
      createCone();
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

