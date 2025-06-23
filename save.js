document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = cubes.map(cube => ({
    name: cube.name || 'Cube',
    position: {
      x: cube.position.x,
      y: cube.position.y,
      z: cube.position.z
    },
    scale: {
      x: cube.scale.x,
      y: cube.scale.y,
      z: cube.scale.z
    },
    rotation: {
      x: cube.rotation.x,
      y: cube.rotation.y,
      z: cube.rotation.z
    },
    color: `#${cube.material?.color?.getHexString() || 'ffffff'}`
  }));

  const json = JSON.stringify(mapData, null, 2); // bonito e indentado

  const blob = new Blob([json], { type: 'application/json' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map1.map';
  a.click();
  URL.revokeObjectURL(a.href);
});

const loadButton = document.getElementById('loadButton');
const loadInput = document.getElementById('loadInput');

loadButton.addEventListener('click', () => {
  loadInput.click(); // abre seletor de arquivo
});

loadInput.addEventListener('change', () => {
  const file = loadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const mapData = JSON.parse(e.target.result);

      // Remove cubos antigos da cena e array
      cubes.forEach(cube => scene.remove(cube));
      cubes.length = 0;

      // Cria cubos a partir do JSON
      mapData.forEach(data => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ color: data.color || '#ffffff' })
        );

        cube.name = data.name || 'Cube';
        cube.position.set(data.position.x, data.position.y, data.position.z);
        cube.scale.set(data.scale.x, data.scale.y, data.scale.z);
        cube.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

        scene.add(cube);
        cubes.push(cube);
      });

      // Seleciona o primeiro cubo ou nulo
      selectedCube = cubes[0] || null;
      updatePanelForCube(selectedCube);
      updateCubeList();

      // Limpa o input file para poder carregar o mesmo arquivo novamente, se quiser
      loadInput.value = '';
    } catch (err) {
      alert('Erro ao carregar mapa: arquivo inválido ou corrompido.');
      console.error(err);
    }
  };
  reader.readAsText(file);
});