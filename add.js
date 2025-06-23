addCubeBtn.addEventListener('click', () => {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const newCube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  newCube.position.set(0, 0, 0);
  newCube.name = `Cube`;

  scene.add(newCube);
  cubes.push(newCube);

  selectedCube = newCube;
  updatePanelForCube(newCube);
  updateCubeList();

  pushToHistory({ type: 'delete', object: newCube });
});