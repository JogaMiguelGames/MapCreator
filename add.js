// Array para armazenar objetos
const cubes = [];
let selectedCube = null;

// Função única para criar cubo
function createCube() {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const newCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
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

// Função para criar esfera
function createSphere() {
  const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newSphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // <-- const aqui

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

// Botão usa a função
addCubeBtn.addEventListener('click', () => {
  createCube();
});

// Prompt também usa a mesma função
document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim().toLowerCase();

    if (command === "new.cube") {
      createCube();
    } else if (command === "new.sphere") {
      createSphere();
    }

    this.value = "";
  }
});

