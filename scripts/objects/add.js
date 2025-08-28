const addCube = document.getElementById('addCubeBtn');
const addSphere = document.getElementById('addSphereBtn');

function createCube() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCube = new THREE.Mesh(cube_geometry, newMaterial);
  
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

addCube.addEventListener('click', () => {
  createCube();
});

addSphere.addEventListener('click', () => {
  createSphere();
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

