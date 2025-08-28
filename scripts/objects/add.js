function selectCube(cube) {
  selectedCube = cube;
  updatePanelForCube(cube);
  updateCubeList();
}

// Clique do mouse para selecionar cubos
function onClick(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    selectCube(intersects[0].object);
  }
}
canvas.addEventListener("click", onClick);

// --- Criação de Cubos ---
const addCubeBtn = document.getElementById("addCubeBtn");

function createCube() {
  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const newCube = new THREE.Mesh(cube_geometry, newMaterial);

  newCube.position.set(0, 0, 0);
  newCube.name = `Cube ${cubes.length + 1}`;
  newCube.castShadow = true;
  newCube.receiveShadow = true;

  scene.add(newCube);
  cubes.push(newCube);

  // Seleciona o cubo recém-criado
  selectCube(newCube);

  // Empilha no histórico (caso exista função de undo/redo)
  if (typeof pushToHistory === "function") {
    pushToHistory({ type: "delete", object: newCube });
  }
}

// Botão "Adicionar Cubo"
addCubeBtn.addEventListener("click", () => {
  createCube();
});

// Comando de texto "new.cube"
const commandLine = document.getElementById("commandLine");
if (commandLine) {
  commandLine.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const command = this.value.trim().toLowerCase();

      if (command === "new.cube") {
        createCube();
      }

      this.value = "";
    }
  });
}


