// === Setup básico Three.js ===  
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cubo branco principal
const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const mainCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
mainCube.position.set(0, 0, 0);
mainCube.name = 'Cube';
scene.add(mainCube);

scene.background = new THREE.Color('#000000');

// Lista de cubos/esferas criados
const cubes = [mainCube];

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

camera.position.set(0, 1.6, 5);

let yaw = 0, pitch = 0;
const moveSpeed = 5;
const lookSpeed = 0.002;
const keys = {};

// Controle mouse
const canvas = renderer.domElement;
let isRightMouseDown = false;

const yLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -9999, 0), new THREE.Vector3(0,  9999, 0)]),
  new THREE.LineBasicMaterial({ color: 0x00ff00 })
);
scene.add(yLine);

const xLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-9999, 0, 0), new THREE.Vector3( 9999, 0, 0)]),
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);
scene.add(xLine);

const zLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -9999), new THREE.Vector3(0, 0,  9999)]),
  new THREE.LineBasicMaterial({ color: 0x0000ff })
);
scene.add(zLine);

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
    const icon = document.createElement('img');
    icon.src = 'resources/images/ui/icons/cube.png';
    icon.alt = 'cube icon';
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.objectFit = 'contain';

    const text = document.createElement('span');
    text.textContent = name;

    div.appendChild(icon);
    div.appendChild(text);

    if(cube === selectedCube){
      div.style.backgroundColor = '#3366ff';
      div.style.color = 'white';
    }

    div.addEventListener('click', () => {
      selectedCube = cube;
      updatePanelForCube(selectedCube);
      updateCubeList();
    });

    cubeListDiv.appendChild(div);
  });
}

// Raycaster para selecionar cubos pelo centro da tela
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(){
  if(document.pointerLockElement !== canvas) return;
  mouse.x = 0; mouse.y = 0;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);
  if(intersects.length > 0){
    selectedCube = intersects[0].object;
    updatePanelForCube(selectedCube);
    updateCubeList();
  }
}
window.addEventListener('click', onClick);

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

