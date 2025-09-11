document.addEventListener("DOMContentLoaded", () => {
    const createSound = new Audio("resources/sounds/buttons/create.wav");
    const menuOpenSound = new Audio("resources/sounds/buttons/menuOpen.wav");

    const createCubeButton = document.getElementById("addCubeBtn");
    const createSphereButton = document.getElementById("addSphereBtn");
    const createPlaneButton = document.getElementById("addPlaneBtn"); // adicionei isso
    const fileMenuButton = document.getElementById("fileMenuBtn");
    const addMenuButton = document.getElementById("addMenuBtn");

    // Som de criação
    const playCreateSound = () => {
        createSound.currentTime = 0;
        createSound.play();
    };

    // Som de abrir menu
    const playMenuSound = () => {
        menuOpenSound.currentTime = 0;
        menuOpenSound.play();
    };

    createCubeButton?.addEventListener("click", playCreateSound);
    createSphereButton?.addEventListener("click", playCreateSound);
    createPlaneButton?.addEventListener("click", playCreateSound);

    fileMenuButton?.addEventListener("click", playMenuSound);
    addMenuButton?.addEventListener("click", playMenuSound);
});
