// ===================== ADD.JS =====================

// Cria um cubo
function createCube(name = "Cube", position = new THREE.Vector3(0, 0, 0), material = new THREE.MeshStandardMaterial({ color: 0xffffff })) {
  const cube = new THREE.Mesh(box_geometry.clone(), material);
  cube.position.copy(position);
  cube.name = name;
  cube.castShadow = true;
  cube.receiveShadow = true;

  // Criar e adicionar esferas de manipulação usando função do main.js
  addManipulationSpheres(cube);

  scene.add(cube);
  cubes.push(cube);
  updateCubeList();
  return cube;
}

// Cria esfera
function createSphere() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(sphere_geometry, material);

  sphere.position.set(0, 0, 0);
  sphere.name = `Sphere ${cubes.length}`;
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  addManipulationSpheres(sphere);

  scene.add(sphere);
  cubes.push(sphere);
  updateCubeList();
  pushToHistory({ type: 'delete', object: sphere });
}

// Cria cilindro
function createCylinder() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cylinder = new THREE.Mesh(cylinder_geometry, material);

  cylinder.position.set(0, 0, 0);
  cylinder.scale.set(0.5, 0.5, 0.5);
  cylinder.name = `Cylinder ${cubes.length}`;
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  addManipulationSpheres(cylinder);

  scene.add(cylinder);
  cubes.push(cylinder);
  updateCubeList();
  pushToHistory({ type: 'delete', object: cylinder });
}

// Cria cone
function createCone() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cone = new THREE.Mesh(cone_geometry, material);

  cone.position.set(0, 0, 0);
  cone.scale.set(0.5, 0.5, 0.5);
  cone.name = `Cone ${cubes.length}`;
  cone.castShadow = true;
  cone.receiveShadow = true;

  addManipulationSpheres(cone);

  scene.add(cone);
  cubes.push(cone);
  updateCubeList();
  pushToHistory({ type: 'delete', object: cone });
}

// Cria plano
function createPlane() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(plane_geometry, material);

  plane.position.set(0, 0, 0);
  plane.rotation.x = -Math.PI / 2;
  plane.name = `Plane ${cubes.length}`;
  plane.castShadow = true;
  plane.receiveShadow = true;

  addManipulationSpheres(plane);

  scene.add(plane);
  cubes.push(plane);
  updateCubeList();
  pushToHistory({ type: 'delete', object: plane });
}

// Cria câmera
function createCamera() {
  const existingCamera = scene.getObjectByName("Camera");
  if (existingCamera) {
    console.warn("A camera already exists in the scene!");
    return;
  }

  const objLoader = new THREE.OBJLoader();
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("resources/models/editor/camera/texture.png");

  objLoader.load(
    "resources/models/editor/camera/camera.obj",
    (object) => {
      object.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff });
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
    (xhr) => console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% complete`),
    (error) => console.error("Error loading OBJ model:", error)
  );
}

// Comandos via linha de comando
document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim().toLowerCase();

    if (command === "create.new.cube") createCube();
    else if (command === "create.new.sphere") createSphere();
    else if (command === "create.new.cylinder") createCylinder();
    else if (command === "create.new.cone") createCone();
    else if (command === "create.new.plane") createPlane();
    else if (command === "create.new.camera") createCamera();

    this.value = "";
  }
});
