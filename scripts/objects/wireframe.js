const wireframeToggleBtn = document.getElementById('wireframeToggleBtn');
let isWireframeEnabled = false;

function setWireframeForAllObjects(enabled) {
  scene.traverse(obj => {
    if (obj.isMesh) {
      // Se material é array (ex: MultiMaterial)
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        if (mat && 'wireframe' in mat) {
          mat.wireframe = enabled;
        }
      });
    }
  });
}

wireframeToggleBtn.addEventListener('click', () => {
  isWireframeEnabled = !isWireframeEnabled;
  setWireframeForAllObjects(isWireframeEnabled);
});
