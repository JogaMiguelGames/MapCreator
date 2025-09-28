// === Cube principal ===
const mainCube = new THREE.Mesh(box_geometry, white_material);
mainCube.position.set(0, 0, 0);
mainCube.name = 'Cube 1';
mainCube.castShadow = true;
mainCube.receiveShadow = true;
scene.add(mainCube);

const cubes = [mainCube];

// === Esferas coladas em cada lado do cubo (raio 0.2) com cores por eixo ===
const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 8);

const offsets = [
  { pos: new THREE.Vector3( 0,  0.4,  0), axis: 'y', color: 0x00ff00 }, // topo
  { pos: new THREE.Vector3( 0, -0.4,  0), axis: 'y', color: 0x00ff00 }, // baixo
  { pos: new THREE.Vector3( 0.4,  0,  0), axis: 'x', color: 0xff0000 }, // direita
  { pos: new THREE.Vector3(-0.4,  0,  0), axis: 'x', color: 0xff0000 }, // esquerda
  { pos: new THREE.Vector3( 0,  0,  0.4), axis: 'z', color: 0x0000ff }, // frente
  { pos: new THREE.Vector3( 0,  0, -0.4), axis: 'z', color: 0x0000ff }  // trás
];

const spheres = [];

offsets.forEach(o => {
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
  const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);
  sphere.position.copy(o.pos.clone().multiplyScalar(2));
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.userData.axis = o.axis; // eixo permitido
  mainCube.add(sphere);
  spheres.push(sphere);
});

// === Drag Controls ===
let selectedSphere = null;
const plane = new THREE.Plane();
const offset = new THREE.Vector3();
const intersection = new THREE.Vector3();

const dragRaycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragRaycaster.setFromCamera(mouseVec, camera);
  const intersects = dragRaycaster.intersectObjects(spheres);

  if (intersects.length > 0) {
    selectedSphere = intersects[0].object;

    const axis = selectedSphere.userData.axis;
    if(axis === 'x') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), selectedSphere.getWorldPosition(new THREE.Vector3()));
    if(axis === 'y') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), selectedSphere.getWorldPosition(new THREE.Vector3()));
    if(axis === 'z') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), selectedSphere.getWorldPosition(new THREE.Vector3()));

    dragRaycaster.ray.intersectPlane(plane, offset);
    offset.sub(selectedSphere.getWorldPosition(new THREE.Vector3()));
  }
}

function onPointerMove(event) {
  if (!selectedSphere) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragRaycaster.setFromCamera(mouseVec, camera);

  if (dragRaycaster.ray.intersectPlane(plane, intersection)) {
    const axis = selectedSphere.userData.axis;
    const worldPos = intersection.clone().sub(offset);
    const localPos = mainCube.worldToLocal(worldPos.clone());

    if(axis === 'x') mainCube.position.x = Math.round(mainCube.position.x + localPos.x);
    if(axis === 'y') mainCube.position.y = Math.round(mainCube.position.y + localPos.y);
    if(axis === 'z') mainCube.position.z = Math.round(mainCube.position.z + localPos.z);
  }
}

function onPointerUp() {
  selectedSphere = null;
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointerleave', onPointerUp);

// -- Luzes
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // luz ambiente suave
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 10, 10); // luz tipo “sol”
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
scene.add(sunLight);

const axisLines = [];
let linesVisible = true;

function addAxisLine(from, to, color){
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([from, to]),
    new THREE.LineBasicMaterial({color})
  );
  scene.add(line);
  axisLines.push(line); // guarda a linha no array
}

addAxisLine(new THREE.Vector3(0,-9999,0), new THREE.Vector3(0,9999,0), 0x00ff00); // Y
addAxisLine(new THREE.Vector3(-9999,0,0), new THREE.Vector3(9999,0,0), 0xff0000); // X
addAxisLine(new THREE.Vector3(0,0,-9999), new THREE.Vector3(0,0,9999), 0x0000ff); // Z

// --- Controle de câmera ---
camera.position.set(0, 1.6, 5);
let yaw = 0, pitch = 0;
const moveSpeed = 5;
const lookSpeed = 0.002;
const keys = {};
const canvas = renderer.domElement;
let isRightMouseDown = false;

// Evita menu de contexto botão direito
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Botão direito mouse para Pointer Lock
canvas.addEventListener('mousedown', e => {
  if(e.button === 2){
    isRightMouseDown = true;
    canvas.requestPointerLock();
  }
});
document.addEventListener('mouseup', e => {
  if(e.button === 2){
    isRightMouseDown = false;
    if(document.pointerLockElement === canvas){
      document.exitPointerLock();
    }
  }
});
document.addEventListener('pointerlockchange', () => {
  if(document.pointerLockElement === canvas){
    document.addEventListener('mousemove', onMouseMove, false);
  }else{
    document.removeEventListener('mousemove', onMouseMove, false);
  }
});
function onMouseMove(e){
  if(isRightMouseDown){
    yaw -= e.movementX * lookSpeed;
    pitch -= e.movementY * lookSpeed;
    const maxPitch = Math.PI/2 - 0.01;
    pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
  }
}

// Teclado
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function updateCamera(delta){
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  const shiftMultiplier = (keys['ShiftLeft'] || keys['ShiftRight']) ? 3 : 1;
  const speed = moveSpeed * shiftMultiplier;

  if(keys['KeyW']) camera.position.addScaledVector(forward, speed * delta);
  if(keys['KeyS']) camera.position.addScaledVector(forward, -speed * delta);
  if(keys['KeyA']) camera.position.addScaledVector(right, -speed * delta);
  if(keys['KeyD']) camera.position.addScaledVector(right, speed * delta);
  if(keys['KeyE']) camera.position.y += speed * delta;
  if(keys['KeyQ']) camera.position.y -= speed * delta;
}

// === UI & manipulação ===
const scaleXInput = document.getElementById('scaleX');
const scaleYInput = document.getElementById('scaleY');
const scaleZInput = document.getElementById('scaleZ');
const posXInput = document.getElementById('posX');
const posYInput = document.getElementById('posY');
const posZInput = document.getElementById('posZ');
const rotXInput = document.getElementById('rotX');
const rotYInput = document.getElementById('rotY');
const rotZInput = document.getElementById('rotZ');
const colorHexInput = document.getElementById('colorHex');
const cubeListDiv = document.getElementById('cubeList');
const addCubeBtn = document.getElementById('addCubeBtn');
const bgColorInput = document.getElementById('bgColorInput');

bgColorInput.addEventListener('input', () => {
  const val = bgColorInput.value.trim();
  if(/^#([0-9a-f]{6})$/i.test(val)){
    scene.background.set(val);
  }
});

let selectedCube = mainCube;

function updatePanelForCube(cube){
  if(!cube){
    [scaleXInput, scaleYInput, scaleZInput, posXInput, posYInput, posZInput, colorHexInput].forEach(i => { i.value=''; i.disabled = true; });
    [rotXInput, rotYInput, rotZInput].forEach(i => { i.value=''; i.disabled = true; });
    return;
  }
  scaleXInput.disabled = false;
  scaleYInput.disabled = false;
  scaleZInput.disabled = false;
  posXInput.disabled = false;
  posYInput.disabled = false;
  posZInput.disabled = false;
  rotXInput.disabled = false;
  rotYInput.disabled = false;
  rotZInput.disabled = false;
  colorHexInput.disabled = false;

  rotXInput.value = THREE.MathUtils.radToDeg(cube.rotation.x).toFixed(2);
  rotYInput.value = THREE.MathUtils.radToDeg(cube.rotation.y).toFixed(2);
  rotZInput.value = THREE.MathUtils.radToDeg(cube.rotation.z).toFixed(2);

  scaleXInput.value = cube.scale.x.toFixed(2);
  scaleYInput.value = cube.scale.y.toFixed(2);
  scaleZInput.value = cube.scale.z.toFixed(2);

  posXInput.value = cube.position.x.toFixed(2);
  posYInput.value = cube.position.y.toFixed(2);
  posZInput.value = cube.position.z.toFixed(2);

  if(cube.material && cube.material.color){
    colorHexInput.value = `#${cube.material.color.getHexString()}`;
  }else{
    colorHexInput.value = '';
  }
}

[scaleXInput, scaleYInput, scaleZInput].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!selectedCube) return;
    const val = parseFloat(input.value);
    if(val > 0){
      if(i===0) selectedCube.scale.x = val;
      if(i===1) selectedCube.scale.y = val;
      if(i===2) selectedCube.scale.z = val;
    }
  });
});

[posXInput, posYInput, posZInput].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!selectedCube) return;
    const val = parseFloat(input.value);
    if(!isNaN(val)){
      if(i===0) selectedCube.position.x = val;
      if(i===1) selectedCube.position.y = val;
      if(i===2) selectedCube.position.z = val;
    }
  });
});

[rotXInput, rotYInput, rotZInput].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!selectedCube) return;
    const val = parseFloat(input.value);
    if(!isNaN(val)){
      const rad = THREE.MathUtils.degToRad(val);
      if(i===0) selectedCube.rotation.x = rad;
      if(i===1) selectedCube.rotation.y = rad;
      if(i===2) selectedCube.rotation.z = rad;
    }
  });
});

function updateCubeList(){
  cubeListDiv.innerHTML = '';
  
  cubes.forEach(cube => {
    const name = cube.name || 'Unnamed';

    const div = document.createElement('div');
    div.className = 'cubeListItem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.padding = '4px 8px';
    div.style.borderRadius = '3px';
    div.style.cursor = 'pointer';
    div.style.gap = '6px';

    // Ícone do cubo
    const iconWrapper = document.createElement('div');
    iconWrapper.style.position = 'relative';
    iconWrapper.style.width = '20px';
    iconWrapper.style.height = '20px';

    const icon = document.createElement('img');
    icon.src = 'resources/images/ui/icons/cube.png';
    icon.alt = 'cube icon';
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.style.objectFit = 'contain';
    iconWrapper.appendChild(icon);

    // Ícone de textura (se houver)
    if(cube.hasTexture){
      const textureIcon = document.createElement('img');
      textureIcon.src = 'resources/images/ui/icons/texture.png';
      textureIcon.alt = 'texture icon';
      textureIcon.style.width = '12px';
      textureIcon.style.height = '12px';
      textureIcon.style.position = 'absolute';
      textureIcon.style.right = '-4px';
      textureIcon.style.bottom = '-4px';
      iconWrapper.appendChild(textureIcon);
    }

    div.appendChild(iconWrapper);

    // Texto do cubo
    const text = document.createElement('span');
    text.textContent = name;
    div.appendChild(text);

    // Destacar cubo selecionado
    if(cube === selectedCube){
      div.style.backgroundColor = '#3366ff';
      div.style.color = 'white';
    }

    // --- Clique simples e duplo clique ---
    let clickTimer = null;

    div.addEventListener('click', () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        selectedCube = cube;
        updatePanelForCube(selectedCube);
        updateCubeList();
        clickTimer = null;
      }, 250);
    });

    div.addEventListener('dblclick', () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      renameCube(div, cube);
    });

    cubeListDiv.appendChild(div);
  });

  // --- F2 para renomear cubo selecionado ---
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable;

    if (e.key === 'F2' && !isTyping && selectedCube) {
      // Encontrar div correspondente
      const divs = cubeListDiv.querySelectorAll('.cubeListItem');
      const div = Array.from(divs).find(d => {
        const span = d.querySelector('span');
        return span && span.textContent === selectedCube.name;
      });

      if (div) renameCube(div, selectedCube);
    }
  });
}

// Função auxiliar para renomear cubo
function renameCube(div, cube){
  const text = div.querySelector('span');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = cube.name || 'Cube';
  input.style.flex = '1';
  input.style.padding = '2px';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '3px';

  div.replaceChild(input, text);
  input.focus();

  function saveName() {
    cube.name = input.value.trim() || 'Unnamed';
    updateCubeList();
  }

  input.addEventListener('blur', saveName);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveName();
  });
}

function onClick(event){
  // Converte coordenadas do clique do mouse para NDC (-1 a 1)
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if(intersects.length > 0){
    selectedCube = intersects[0].object;
    updatePanelForCube(selectedCube);
    updateCubeList();
  }
}
canvas.addEventListener('click', onClick);

colorHexInput.addEventListener('input', () => {
  if(!selectedCube || !selectedCube.material) return;
  const val = colorHexInput.value.trim();
  if(/^#([0-9a-f]{6})$/i.test(val)){
    selectedCube.material.color.set(val);
  }
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable;

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping && selectedCube) {
    e.preventDefault(); // Impede o navegador de voltar página
    const idx = cubes.indexOf(selectedCube);
    if (idx !== -1) {
      scene.remove(selectedCube);
      cubes.splice(idx, 1);
      selectedCube = cubes[idx - 1] || cubes[0] || null;
      updatePanelForCube(selectedCube);
      updateCubeList();
    }
  }
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop principal
let lastTime = 0;
function animate(time=0){
  requestAnimationFrame(animate);
  const delta = (time - lastTime)/1000;
  lastTime = time;
  updateCamera(delta);
  renderer.render(scene, camera);
}
animate();

// Inicializa UI
updatePanelForCube(selectedCube);
updateCubeList();



























