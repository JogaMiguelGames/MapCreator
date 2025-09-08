    const createSound = new Audio("resources/sounds/buttons/create.wav");

    // Captura o botão
    const button = document.getElementById("addCubeBtn");

    // Toca o som quando o botão é clicado
    button.addEventListener("click", () => {
      createSound.currentTime = 0; // Reinicia o som se já estiver tocando
      CreateSound.play();
    });
