// ===================== ADD.JS =====================

function createCube(name = "Cube", position = new THREE.Vector3(0, 0, 0), material = new THREE.MeshStandardMaterial({ color: 0xffffff })) {
  const cube = new THREE.Mesh(box_geometry.clone(), material);
  cube.position.copy(position);
  cube.name = name;
  cube.castShadow = true;
  cube.receiveShadow = true;

  cube.userData.icon = "cube";

  addManipulationSpheres(cube);

  scene.add(cube);
  Model.Objects.push(cube);
  UpdateTreeView();
  return cube;
}

function createSphere() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(sphere_geometry, material);

  sphere.position.set(0, 0, 0);
  sphere.name = `Sphere ${Model.Objects.length}`;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  
  sphere.userData.icon = "sphere";

  addManipulationSpheres(sphere);

  scene.add(sphere);
  Model.Objects.push(sphere);
  UpdateTreeView();
  pushToHistory({ type: 'delete', object: sphere });
}

function createCylinder() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cylinder = new THREE.Mesh(cylinder_geometry, material);

  cylinder.position.set(0, 0, 0);
  cylinder.scale.set(0.5, 0.5, 0.5);
  cylinder.name = `Cylinder ${Model.Objects.length}`;
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  cylinder.userData.icon = "cylinder";

  addManipulationSpheres(cylinder);

  scene.add(cylinder);
  Model.Objects.push(cylinder);
  UpdateTreeView();
  pushToHistory({ type: 'delete', object: cylinder });
}

function createCone() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cone = new THREE.Mesh(cone_geometry, material);

  cone.position.set(0, 0, 0);
  cone.scale.set(0.5, 0.5, 0.5);
  cone.name = `Cone ${Model.Objects.length}`;
  cone.castShadow = true;
  cone.receiveShadow = true;

  cone.userData.icon = "cone";

  addManipulationSpheres(cone);

  scene.add(cone);
  Model.Objects.push(cone);
  UpdateTreeView();
  pushToHistory({ type: 'delete', object: cone });
}

function createPlane() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(plane_geometry, material);

  plane.position.set(0, 0, 0);
  plane.rotation.x = -Math.PI / 2;
  plane.name = `Plane ${Model.Objects.length}`;
  plane.castShadow = true;
  plane.receiveShadow = true;

  plane.userData.icon = "plane";

  addManipulationSpheres(plane);

  scene.add(plane);
  Model.Objects.push(plane);
  UpdateTreeView();
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

      object.userData.icon = "camera";

      scene.add(object);
      Model.Objects.push(object);

      selectedCube = object;
      updatePanelForCube(object);
      UpdateTreeView();

      pushToHistory({ type: "delete", object: object });
    },
    (xhr) => console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% complete`),
    (error) => console.error("Error loading OBJ model:", error)
  );
}

function createLight() {
  const lightColor = 0xffffff;
  const lightIntensity = 2;
  const lightDistance = 15;

  const light = new THREE.PointLight(lightColor, lightIntensity, lightDistance);
  light.castShadow = true;

  // esfera visível representando a luz
  const sphereMat = new THREE.MeshBasicMaterial({
    color: lightColor,
    emissive: lightColor,
    emissiveIntensity: 1
  });
  const sphere = new THREE.Mesh(sphere_geometry.clone(), sphereMat);
  sphere.scale.set(0.2, 0.2, 0.2);
  sphere.name = `Light ${Model.Objects.length}`;
  sphere.position.set(0, 0, 0);

  // hierarquia luz + esfera
  light.add(sphere);

  // para manipulação e seleção
  addManipulationSpheres(sphere);

  scene.add(light);
  Model.Objects.push(light);
  UpdateTreeView();
  pushToHistory({ type: 'delete', object: light });

  return light;
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
    else if (command === "create.new.light") createLight();

    this.value = "";
  }
});




