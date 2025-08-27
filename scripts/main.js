const mainCube = new THREE.Mesh(cube_geometry, white_material);
mainCube.position.set(0, 0, 0); // acima do “chão” que será colocado depois
mainCube.name = 'Cube1';
mainCube.castShadow = true;      // projeta sombra
mainCube.receiveShadow = true;   // recebe sombra de outros objetos
scene.add(mainCube);

const cubes = [mainCube];

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

function addAxisLine(from, to, color){
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([from, to]),
    new THREE.LineBasicMaterial({color})
  );
  scene.add(line);
}
addAxisLine(new THREE.Vector3(0,-9999,0), new THREE.Vector3(0,9999,0), 0x00ff00); // Y
addAxisLine(new THREE.Vector3(-9999,0,0), new THREE.Vector3(9999,0,0), 0xff0000); // X
addAxisLine(new THREE.Vector3(0,0,-9999), new THREE.Vector3(0,0,9999), 0x0000ff); // Z

// --- Controle de câmera ---
camera.position.set(4, 2, 4);
camera.rotation.set(0, 45, 30)
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

const timeInput = document.getElementById('timeOfDayInput');

// Função para escurecer HEX de acordo com porcentagem (0 a 1)
function darkenHexColor(hex, factor) {
    const r = Math.round(parseInt(hex.substr(1,2),16) * (1 - factor));
    const g = Math.round(parseInt(hex.substr(3,2),16) * (1 - factor));
    const b = Math.round(parseInt(hex.substr(5,2),16) * (1 - factor));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Função para atualizar a cor do céu conforme hora
function updateSkyColorByTime(hour, baseColor) {
    // Calcula distância de 12h
    const distance = Math.min(Math.abs(hour - 12), Math.abs(hour - 12 - 24));
    // Normaliza para fator de escurecimento (0 = 12h, 0.8 = 0h ou 24h)
    const factor = Math.min(0.8, (distance / 12) * 0.8);
    scene.background.set(darkenHexColor(baseColor, factor));
}

function updateLightingByTime(hour, baseSkyColor) {
    // Escurece o céu conforme antes
    const distance = Math.min(Math.abs(hour - 12), Math.abs(hour - 12 - 24));
    const factor = Math.min(0.8, (distance / 12) * 0.8);
    scene.background.set(darkenHexColor(baseSkyColor, factor));

    // Luz do sol
    const minColor = new THREE.Color(0x222222); // cor da noite
    const maxColor = new THREE.Color(0xffffff); // cor do dia
    const minIntensity = 0.1; // mínima intensidade
    const maxIntensity = 1.0; // máxima intensidade

    const normalized = distance / 12;

    // Intensidade exponencial durante o dia
    let intensity = maxIntensity * Math.pow(1 - normalized, 3);

    // Reduz em 90% se hora for 1 ou 23
    if(hour === 1 || hour === 23) {
        intensity *= 0.1; // apenas 10% da intensidade
    }

    sunLight.intensity = Math.max(intensity, minIntensity);

    // Cor do sol interpolada entre dia e noite
    sunLight.color = maxColor.clone().lerp(minColor, normalized);
}

// Base do céu
let baseSkyColor = bgColorInput.value;

// Atualiza quando muda o input de hora
timeInput.addEventListener('input', () => {
    let hour = parseInt(timeInput.value);
    if(isNaN(hour) || hour < 0) hour = 0;
    if(hour > 23) hour = 23;

    updateLightingByTime(hour, baseSkyColor);
});

// Atualiza quando muda a cor do céu
bgColorInput.addEventListener('input', () => {
    const val = bgColorInput.value.trim();
    if(/^#([0-9a-f]{6})$/i.test(val)){
        baseSkyColor = val;
        updateLightingByTime(parseInt(timeInput.value), baseSkyColor);
    }
});

// Inicializa cor ao carregar
updateSkyColorByTime(parseInt(timeInput.value), baseSkyColor);

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

// Raycaster para selecionar cubos pelo centro da tela
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(){
    if(document.pointerLockElement !== canvas) return;

    mouse.x = 0;
    mouse.y = 0;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubes);
    
    if(intersects.length > 0){
        selectedCube = intersects[0].object;
        updatePanelForCube(selectedCube);
        updateCubeList();
        addSpheresToSelectedCube(); // <- adiciona as esferas
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

function addSpheresToSelectedCube() {
    if (!selectedCube) return;

    // Remover esferas anteriores (se quiser evitar duplicação)
    if (selectedCube.spheres) {
        selectedCube.spheres.forEach(s => scene.remove(s));
    }

    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    const directions = [
        new THREE.Vector3(1, 0, 0),   // direita (+X)
        new THREE.Vector3(-1, 0, 0),  // esquerda (-X)
        new THREE.Vector3(0, 1, 0),   // cima (+Y)
        new THREE.Vector3(0, -1, 0),  // baixo (-Y)
        new THREE.Vector3(0, 0, 1),   // frente (+Z)
        new THREE.Vector3(0, 0, -1)   // trás (-Z)
    ];

    const distance = 1.1; // distância da face do cubo
    const spheres = [];

    for (let i = 0; i < 6; i++) {
        const material = new THREE.MeshStandardMaterial({ color: colors[i] });
        const sphere = new THREE.Mesh(sphereGeometry, material);
        
        // Posição relativa ao cubo
        const dir = directions[i].clone().multiplyScalar(distance);
        const worldPos = new THREE.Vector3().copy(selectedCube.position).add(dir);
        sphere.position.copy(worldPos);

        sphere.castShadow = true;
        sphere.receiveShadow = true;

        scene.add(sphere);
        spheres.push(sphere);
    }

    // Armazena referência no cubo
    selectedCube.spheres = spheres;
}

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




