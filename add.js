// Função única para criar cubo
function createCube() {
  const newCube = new THREE.Mesh(cube_geometry, white_material);
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

// Botão usa a função
addCubeBtn.addEventListener('click', () => {
  createCube();
});

// Prompt também usa a mesma função
document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();

    if (command.toLowerCase() === "new.cube") {
      createCube();
    }

    this.value = "";
  }
});

