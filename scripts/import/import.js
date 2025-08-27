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

      object.name = "Model";

      object.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
      });

      object.position.set(0, 0, 0);

      // 🔥 Salva as linhas do OBJ no userData
      const lines = contents.split("\n");
      object.userData.objLines = lines;

      scene.add(object);
      cubes.push(object);

      updateCubeList();
      console.log("OBJ importado com sucesso!");
    } catch (err) {
      console.error("Erro ao carregar OBJ:", err);
    }
  };
  reader.readAsText(file);
});
