const commandLine = document.getElementById("commandLine");

commandLine.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();

    // Verifica se é set.skybox(#HEX)
    if (command.toLowerCase().startsWith("set.skybox(") && command.endsWith(")")) {
      const color = command.slice(11, -1).trim(); // pega a cor dentro dos parênteses

      // Valida se é um HEX válido
      if (/^#([0-9a-f]{6})$/i.test(color)) {
        scene.background.set(color);
      } else {
        console.warn("Cor inválida! Use #RRGGBB");
      }
    }

    this.value = ""; // limpa o input
  }
});
