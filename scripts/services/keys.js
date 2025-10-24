document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey &&event.code === "KeyV") {
    event.preventDefault();

    const main = document.getElementById("sceneContainer");
    const canvas = document.querySelector("canvas[data-engine='three.js r152']");
    const bodyChildren = Array.from(document.body.children);

    const isHidden = document.body.classList.contains("ui-hidden");

    if (isHidden) {
      bodyChildren.forEach(el => {
        if (el !== main && el !== canvas) {
          el.style.display = "";
        }
      });
      if (main) main.style.display = "";
      if (canvas) canvas.style.display = "";
      document.body.classList.remove("ui-hidden");
    } else {
      bodyChildren.forEach(el => {
        if (el !== main && el !== canvas) {
          el.style.display = "none";
        }
      });
      if (main) main.style.display = "";
      if (canvas) canvas.style.display = "";
      document.body.classList.add("ui-hidden");
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyK') {
    linesVisible = !linesVisible;

    axisLines.forEach(line => line.visible = linesVisible);

    if (hugeGrid) hugeGrid.visible = linesVisible;
    if (gridGroup) gridGroup.visible = linesVisible;
  }
});
