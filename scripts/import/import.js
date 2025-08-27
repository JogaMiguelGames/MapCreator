document.getElementById("importOBJBtn").addEventListener("click", () => {
  document.getElementById("objFileInput").click();
});

document.getElementById("objFileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    try {
      const loader = new THREE.OBJLoader();
      const object = loader.parse(contents);

      object.name = "Model"; // Nome para exibir na lista

      // Aplica material e outros ajustes nos filhos
      object.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
      });

      object.position.set(0, 0, 0);

      scene.add(object);     // Adiciona o objeto completo à cena
      cubes.push(object);    // Adiciona o grupo ao array de cubos manipuláveis

      updateCubeList();      // Atualiza UI
    } catch (err) {
    }
  };
  reader.readAsText(file);
});

