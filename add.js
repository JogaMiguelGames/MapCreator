const cubes = []; 
let selectedCube = null;

function createObject(type) {
  let geometry;
  let name;

  if (type === "cube") {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    name = `Cube ${cubes.length}`;
  } else if (type === "sphere") {
    geometry = new THREE.SphereGeometry(1, 16, 16);
    name = `Sphere ${cubes.length}`;
  } else {
    console.warn("Tipo de objeto desconhecido:", type);
    return;
  }

  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = name;

  scene.add(mesh);
  cubes.push(mesh);

  selectedCube = mesh;
  updatePanelForCube(mesh);
  updateCubeList();

  pushToHistory({ type: 'delete', object: mesh });
}

const addCubeBtn = document.getElementById('addCubeBtn');
addCubeBtn.addEventListener('click', () => {
  createObject("cube");
});

const commandInput = document.getElementById("commandLine");
commandInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim().toLowerCase();

    switch (command) {
      case "new.cube":
        createObject("cube");
        break;

      case "new.sphere":
        createObject("sphere");
        break;

      default:
        console.log("Comando não reconhecido:", command);
        break;
    }

    this.value = "";
  }
});
