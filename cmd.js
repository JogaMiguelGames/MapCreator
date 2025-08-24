document.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();

    if (command.toLowerCase().startsWith("set.skybox(") && command.endsWith(")")) {
      const color = command.slice(11, -1).trim();

      scene.background = new THREE.Color(color);
    }

    this.value = "";
  }
});
