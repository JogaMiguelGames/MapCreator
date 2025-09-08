document.addEventListener("DOMContentLoaded", () => {
    const createSound = new Audio("resources/sounds/buttons/create.wav");

    const createCubeButton = document.getElementById("addCubeBtn");
    const createSphereButton = document.getElementById("addSphereBtn");
    const createPlaneButton = document.getElementById("addPlaneBtn");

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
});
