document.addEventListener("DOMContentLoaded", () => {
    const createSound = new Audio("resources/sounds/buttons/create.wav");
    const menuOpenSound = new Audio("resources/sounds/buttons/menuOpen.wav");

    const createCubeButton = document.getElementById("addCubeBtn");
    const createCubeButton = document.getElementById("addCubeBtn");
    const createSphereButton = document.getElementById("addSphereBtn");
    const fileMenuButton = document.getElementById("fileBtn");

    createCubeButton?.addEventListener("click", () => {
        createSound.currentTime = 0;
        createSound.play();
    });

    createSphereButton?.addEventListener("click", () => {
        createSound.currentTime = 0;
        createSound.play();
    });

    createPlaneButton?.addEventListener("click", () => {
        createSound.currentTime = 0;
        createSound.play();
    });

    fileMenuButton?.addEventListener("click", () => {
        menuOpenSound.currentTime = 0;
        menuOpenSound.play();
    });
});
