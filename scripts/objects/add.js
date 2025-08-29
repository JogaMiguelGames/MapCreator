// -- Add.js -- Map Creator

const addCube = document.getElementById('addCubeBtn');
const addSphere = document.getElementById('addSphereBtn');

const addCamera = document.getElementById('addCameraBtn');

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

function createCamera() {
  const loader = new THREE.OBJLoader();
  
  loader.load(
    "resources/models/editor/camera/camera.obj",
    (object) => {
      // Aplica material em todos os meshes do objeto
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      object.position.set(0, 0, 0);
      object.name = `Camera ${cubes.length}`;

      scene.add(object);
      cubes.push(object);

      selectedCube = object;
      updatePanelForCube(object);
      updateCubeList();

      pushToHistory({ type: "delete", object: object });
    },
    (xhr) => {
      console.log(`Carregando modelo: ${(xhr.loaded / xhr.total) * 100}% concluído`);
    },
    (error) => {
      console.error("Erro ao carregar modelo OBJ:", error);
    }
  );
}

addCube.addEventListener('click', () => {
  createCube();
});

addSphere.addEventListener('click', () => {
  createSphere();
});

addCamera.addEventListener('click', () => {
  createCamera();
});

document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();

    if (command.toLowerCase() === "new.cube") {
      createCube();
    }
    else if (command.toLowerCase() === "new.sphere") {
      createSphere();
    }
    
    this.value = "";
  }
});




