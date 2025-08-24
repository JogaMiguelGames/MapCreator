addCubeBtn.addEventListener('click', () => {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, flatShading: true });
  const newCube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  newCube.position.set(0, 0, 0);
  newCube.castShadow = true;
  newCube.receiveShadow = true;
  newCube.name = `Cube-${cubes.length + 1}`;

  scene.add(newCube);
  cubes.push(newCube);
  selectedCube = newCube;
  updatePanelForCube(newCube);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newCube });
});
