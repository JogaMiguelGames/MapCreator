// history.js

const historyStack = [];
const MAX_HISTORY = 16;

// Registra uma nova ação no histórico
function pushToHistory(action) {
  historyStack.push(action);
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift(); // Remove a ação mais antiga
  }
}

// Reverte a última ação
function undoLastAction() {
  const last = historyStack.pop();
  if (!last) return;

  if (last.type === 'delete') {
    scene.add(last.object);
    cubes.splice(last.index, 0, last.object);
    selectedCube = last.object;
    updatePanelForCube(selectedCube);
    updateCubeList();
  }

  else if (last.type === 'transform') {
    Object.assign(last.object.position, last.prevState.position);
    Object.assign(last.object.rotation, last.prevState.rotation);
    Object.assign(last.object.scale, last.prevState.scale);

    if (last.object.material?.color && last.prevState.color) {
      last.object.material.color.set(last.prevState.color);
    }

    selectedCube = last.object;
    updatePanelForCube(selectedCube);
    updateCubeList();
  }
}

// Atalho de teclado: Ctrl+Z ou Cmd+Z
window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    undoLastAction();
  }
});