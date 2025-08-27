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

      // 🔥 Salva o conteúdo OBJ dentro do objeto
      object.userData.objSource = contents;

      scene.add(object);     // Adiciona o objeto completo à cena
      cubes.push(object);    // Adiciona ao array manipulável

      updateCubeList();      // Atualiza UI
      console.log("OBJ importado com sucesso!");
    } catch (err) {
      console.error("Erro ao carregar OBJ:", err);
    }
  };
  reader.readAsText(file);
});
