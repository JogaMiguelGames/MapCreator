commandInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd = commandInput.value.trim();

    if (cmd === 'Create.3D.Cube();') {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      cube.position.set(0, 0, 0);
      cube.scale.set(1, 1, 1);

      const cubeCount = cubes.filter(obj => obj.name && obj.name.startsWith('Cube')).length;
      cube.name = cubeCount === 0 ? 'Cube' : `Cube ${cubeCount + 1}`;

      scene.add(cube);
      cubes.push(cube);
      selectedCube = cube;
      updatePanelForCube(selectedCube);
      updateCubeList();
    }

    else if (cmd === 'Create.3D.Sphere();') {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x555555 })
      );
      sphere.position.set(0, 0, 0);
      sphere.scale.set(1, 1, 1);

      const sphereCount = cubes.filter(obj => obj.name && obj.name.startsWith('Sphere')).length;
      sphere.name = sphereCount === 0 ? 'Sphere' : `Sphere ${sphereCount + 1}`;

      scene.add(sphere);
      cubes.push(sphere);
      selectedCube = sphere;
      updatePanelForCube(selectedCube);
      updateCubeList();
    }

    commandInput.value = '';
  }
});