// === Map Creator - Main.js ===

const mainCube = new THREE.Mesh(box_geometry, white_material);
mainCube.position.set(0, 0, 0);
mainCube.name = 'Cube 1';
mainCube.castShadow = true;
mainCube.receiveShadow = true;
scene.add(mainCube);
mainCube.userData.icon = "cube";

const cubes = [mainCube];

const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 8);

const offsets = [
  { pos: new THREE.Vector3( 0,  0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0, -0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3(-0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3( 0,  0,  0.4), axis: 'z', color: 0x0000ff },
  { pos: new THREE.Vector3( 0,  0, -0.4), axis: 'z', color: 0x0000ff }
];

function addManipulationSpheres(obj) {
  const objSpheres = [];

  offsets.forEach(o => {
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
    const sphere = new THREE.Mesh(sphereGeometrySmall.clone(), sphereMaterial);

    sphere.castShadow = false;
    sphere.receiveShadow = false;
    sphere.position.copy(o.pos.clone().multiplyScalar(2));
    sphere.userData.axis = o.axis;
    sphere.userData.isManipulator = true;
    sphere.visible = false;

    obj.add(sphere);
    objSpheres.push(sphere);
  });

  obj.userData.spheres = objSpheres;
}

window.addManipulationSpheres = addManipulationSpheres;
window.offsets = offsets;
window.sphereGeometrySmall = sphereGeometrySmall;

const spheres = [];

offsets.forEach(o => {
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
  const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);
  
  sphere.castShadow = false;
  sphere.receiveShadow = false;
  
  sphere.position.copy(o.pos.clone().multiplyScalar(2));
  sphere.userData.axis = o.axis; 
  sphere.visible = false;
  mainCube.add(sphere);
  spheres.push(sphere);
});

function updateSpheresVisibility() {
  cubes.forEach(cube => {
    const isSelected = (cube === selectedCube);
    if (cube.userData.spheres) {
      cube.userData.spheres.forEach(s => s.visible = isSelected);
    }
  });
}

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
  if (!selectedCube || !selectedCube.userData.spheres) return;

  const intersects = dragRaycaster.intersectObjects(selectedCube.userData.spheres);

  if (intersects.length > 0) {
    selectedSphere = intersects[0].object;
    renderer.domElement.style.cursor = 'grabbing';

    const axis = selectedSphere.userData.axis;
    if(axis === 'x') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), selectedSphere.getWorldPosition(new THREE.Vector3()));
    if(axis === 'y') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), selectedSphere.getWorldPosition(new THREE.Vector3()));
    if(axis === 'z') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(1,0,0), selectedSphere.getWorldPosition(new THREE.Vector3()));

    dragRaycaster.ray.intersectPlane(plane, offset);
    offset.sub(selectedSphere.getWorldPosition(new THREE.Vector3()));
  }
}

renderer.domElement.style.cursor = 'default';

function updateCursor() {
  if (selectedSphere) {
    renderer.domElement.style.cursor = 'grabbing';
  } else {
    const rect = renderer.domElement.getBoundingClientRect();
    dragRaycaster.setFromCamera(mouseVec, camera);

    if (selectedCube && selectedCube.userData.spheres) {
      const intersects = dragRaycaster.intersectObjects(selectedCube.userData.spheres);
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'grab';
        return;
      }
    }
    renderer.domElement.style.cursor = 'default';
  }
}

function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragRaycaster.setFromCamera(mouseVec, camera);
  updateCursor();

  if (!selectedSphere) return;
  if (dragRaycaster.ray.intersectPlane(plane, intersection)) {
    const axis = selectedSphere.userData.axis;
    const worldPos = intersection.clone().sub(offset);
    const localPos = selectedCube.worldToLocal(worldPos.clone());

    if(axis === 'x') selectedCube.position.x = Math.round(selectedCube.position.x + localPos.x);
    if(axis === 'y') selectedCube.position.y = Math.round(selectedCube.position.y + localPos.y);
    if(axis === 'z') selectedCube.position.z = Math.round(selectedCube.position.z + localPos.z);
  }
}

function onPointerUp() {
  selectedSphere = null;
  renderer.domElement.style.cursor = 'default';
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointerleave', onPointerUp);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 10, 10);
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
  axisLines.push(line);
}

addAxisLine(new THREE.Vector3(0,-9999,0), new THREE.Vector3(0,9999,0), 0x00ff00); // Y
addAxisLine(new THREE.Vector3(-9999,0,0), new THREE.Vector3(9999,0,0), 0xff0000); // X
addAxisLine(new THREE.Vector3(0,0,-9999), new THREE.Vector3(0,0,9999), 0x0000ff); // Z

function createHugeGrid(step = 1, color = 0x888888) {
  const size = 0;
  const material = new THREE.LineBasicMaterial({ color: color });
  const vertices = [];

  for (let z = -size; z <= size; z += step) {
    vertices.push(-size, 0, z, size, 0, z);
  }

  for (let x = -size; x <= size; x += step) {
    vertices.push(x, 0, -size, x, 0, size);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const lines = new THREE.LineSegments(geometry, material);
  scene.add(lines);
  return lines;
}

const hugeGrid = createHugeGrid(1, 0x888888);

const gridGroup = new THREE.Group();
scene.add(gridGroup);

const gridStep = 1;
const gridLimit = 200;
const gridColor = 0x888888;

function updateGridAroundCameraCircle(camera) {
  gridGroup.clear();

  const camX = camera.position.x;
  const camZ = camera.position.z;

  const radius = 500;
  const step = 1;
  const vertices = [];

  const minX = Math.floor(camX - radius);
  const maxX = Math.ceil(camX + radius);
  const minZ = Math.floor(camZ - radius);
  const maxZ = Math.ceil(camZ + radius);

  for (let z = minZ; z <= maxZ; z += step) {
    if (z === 0) continue;

    const dz = z - camZ;
    if (Math.abs(dz) > radius) continue;

    const deltaX = Math.sqrt(radius * radius - dz * dz);
    vertices.push(camX - deltaX, 0, z, camX + deltaX, 0, z);
  }

  for (let x = minX; x <= maxX; x += step) {
    if (x === 0) continue;

    const dx = x - camX;
    if (Math.abs(dx) > radius) continue;

    const deltaZ = Math.sqrt(radius * radius - dx * dx);
    vertices.push(x, 0, camZ - deltaZ, x, 0, camZ + deltaZ);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  const lines = new THREE.LineSegments(geometry, material);
  gridGroup.add(lines);
}

camera.position.set(0, 1.6, 5);
let yaw = 0, pitch = 0;
const moveSpeed = 5;
const lookSpeed = 0.002;
const keys = {};
const canvas = renderer.domElement;
let isRightMouseDown = false;

canvas.addEventListener('contextmenu', e => e.preventDefault());

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

  let speedMultiplier = 1;

  if (keys['ShiftLeft'] || keys['ShiftRight']) {
    speedMultiplier = 3;
  }

  else if (keys['ControlLeft'] || keys['ControlRight']) {
    speedMultiplier = 0.3;
  }
  
  const speed = moveSpeed * speedMultiplier;

  if(keys['KeyW']) camera.position.addScaledVector(forward, speed * delta);
  if(keys['KeyS']) camera.position.addScaledVector(forward, -speed * delta);
  if(keys['KeyA']) camera.position.addScaledVector(right, -speed * delta);
  if(keys['KeyD']) camera.position.addScaledVector(right, speed * delta);
  if(keys['KeyE']) camera.position.y += speed * delta;
  if(keys['KeyQ']) camera.position.y -= speed * delta;
}

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
let selectedFolder = null;
let selectedScript = null;

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

window.customFolders = window.customFolders || [];
window.folderCount = window.folderCount || 0;

window.customScripts = window.customScripts || [];
window.scriptsCount = window.scriptsCount || 0;

function createFolder(name = 'New Folder') {
  window.folderCount = (window.folderCount || 0) + 1;
  const folder = { id: Date.now() + Math.random(), name };
  window.customFolders.push(folder);
  updateCubeList();
  return folder;
}

function createScript(name = 'New Script') {
  window.scriptCount = (window.scriptCount || 0) + 1;
  const script = { id: Date.now() + Math.random(), name };
  window.customScripts.push(script);
  updateCubeList();
  return script;
}


function updateCubeList() {
  const addWindow = document.getElementById('addWindow');
  const addWindowContent = document.getElementById('addWindowContent');

  const aW_CreateFolder = document.getElementById('aW_CreateFolder');
  const aW_CreateScript = document.getElementById('aW_CreateScript');
  
  cubeListDiv.innerHTML = '';

  const projectDiv = document.createElement('div');
  projectDiv.className = 'cubeListFolder';
  projectDiv.style.display = 'flex';
  projectDiv.style.alignItems = 'center';
  projectDiv.style.padding = '4px 8px';
  projectDiv.style.borderRadius = '3px';
  projectDiv.style.cursor = 'pointer';
  projectDiv.style.gap = '6px';
  projectDiv.style.fontWeight = 'bold';

  const folderIcon = document.createElement('img');
  folderIcon.src = 'resources/images/ui/icons/folder.svg';
  folderIcon.alt = 'Project Folder';
  folderIcon.style.width = '20px';
  folderIcon.style.height = '20px';
  folderIcon.style.objectFit = 'contain';
  projectDiv.appendChild(folderIcon);

  const folderText = document.createElement('span');
  folderText.textContent = 'Project';
  projectDiv.appendChild(folderText);
  cubeListDiv.appendChild(projectDiv);

  const scriptIcon = document.createElement('img');
  scriptIcon.src = 'resources/images/ui/icons/file.svg';
  scriptIcon.alt = 'Project Script';
  scriptIcon.style.width = '20px';
  scriptIcon.style.height = '20px';
  scriptIcon.style.objectFit = 'contain';
  projectDiv.appendChild(scriptIcon);

  const scriptText = document.createElement('span');
  scriptText.textContent = 'Project';
  projectDiv.appendChild(scriptText);
  cubeListDiv.appendChild(projectDiv);

  const projectContent = document.createElement('div');
  projectContent.style.display = 'flex';
  projectContent.style.flexDirection = 'column';
  projectContent.style.marginLeft = '20px';
  cubeListDiv.appendChild(projectContent);

  const addWindowBtn = document.createElement('button');
  addWindowBtn.textContent = '+';
  addWindowBtn.title = 'Add a object';
  addWindowBtn.style.cssText = `
    width:32px; height:32px; border-radius:50%; border:none; background-color:#3366ff;
    color:white; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; margin-left:10px;
  `;
  
  projectDiv.appendChild(addWindowBtn);

  addWindowBtn.addEventListener("click", () => {
    addWindow.style.display = addWindow.style.display === "flex" ? "none" : "flex";
  });

  addWindow.addEventListener("click", (e) => {
    if (e.target === addWindow) addWindow.style.display = "none";
  });
  
  aW_CreateFolder.addEventListener('click', () => {
    const newFolder = { id: Date.now() + Math.random(), name: 'New Folder' };
    window.customFolders.push(newFolder);
    selectedFolder = newFolder;
    updateCubeList();
  });

  aW_CreateScript.addEventListener('click', () => {
    const newScript = { id: Date.now() + Math.random(), name: 'New Script' };
    window.customFolders.push(newScript);
    selectedScript = newScript;
    updateCubeList();
  });

  window.customFolders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'cubeListFolder';
    folderDiv.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:4px;
      cursor:pointer; gap:8px; color:#fff; margin-bottom:4px; margin-left:20px;
    `;

    const icon = document.createElement('img');
    icon.src = 'resources/images/ui/icons/folder.svg';
    icon.alt = 'Folder';
    icon.style.width = '18px';
    icon.style.height = '18px';
    icon.style.objectFit = 'contain';
    folderDiv.appendChild(icon);

    if (folder.isEditing) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = folder.name;
      input.style.flex = '1';
      input.style.padding = '2px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '3px';
      folderDiv.appendChild(input);
      input.focus();

      input.addEventListener('blur', () => {
        folder.name = input.value.trim() || 'Unnamed Folder';
        folder.isEditing = false;
        updateCubeList();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          folder.name = input.value.trim() || 'Unnamed Folder';
          folder.isEditing = false;
          updateCubeList();
        }
      });
    } else {
      const span = document.createElement('span');
      span.textContent = folder.name;
      folderDiv.appendChild(span);

      folderDiv.addEventListener('click', () => {
        selectedCube = null;
        selectedFolder = folder;
        updateCubeList();
        updateSpheresVisibility();
      });

      span.addEventListener('dblclick', e => {
        e.stopPropagation();
        folder.isEditing = true;
        updateCubeList();
      });
    }

    if (selectedFolder === folder) {
      folderDiv.style.backgroundColor = '#3366ff';
      folderDiv.style.color = 'white';
    }

    projectContent.appendChild(folderDiv);
  });

  window.customScripts.forEach(script => {
    const scriptDiv = document.createElement('div');
    scriptDiv.className = 'cubeListFolder';
    scriptDiv.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:4px;
      cursor:pointer; gap:8px; color:#fff; margin-bottom:4px; margin-left:20px;
    `;

    const icon = document.createElement('img');
    icon.src = 'resources/images/ui/icons/file.svg';
    icon.alt = 'Script';
    icon.style.width = '18px';
    icon.style.height = '18px';
    icon.style.objectFit = 'contain';
    scriptDiv.appendChild(icon);

    if (script.isEditing) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = script.name;
      input.style.flex = '1';
      input.style.padding = '2px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '3px';
      scriptDiv.appendChild(input);
      input.focus();

      input.addEventListener('blur', () => {
        script.name = input.value.trim() || 'Unnamed Script';
        script.isEditing = false;
        updateCubeList();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          script.name = input.value.trim() || 'Unnamed Script';
          script.isEditing = false;
          updateCubeList();
        }
      });
    } else {
      const span = document.createElement('span');
      span.textContent = script.name;
      scriptDiv.appendChild(span);

      scriptDiv.addEventListener('click', () => {
        selectedCube = null;
        selectedScript = script;
        updateCubeList();
        updateSpheresVisibility();
      });

      span.addEventListener('dblclick', e => {
        e.stopPropagation();
        script.isEditing = true;
        updateCubeList();
      });
    }

    if (selectedScript === script) {
      scriptDiv.style.backgroundColor = '#3366ff';
      scriptDiv.style.color = 'white';
    }

    projectContent.appendChild(scriptDiv);
  });

  cubes.forEach(cube => {
    const item = document.createElement('div');
    item.className = 'cubeListItem';
    item.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:3px;
      cursor:pointer; gap:6px; margin-bottom:2px; margin-left:20px;
    `;

    const iconWrapper = document.createElement('div');
    iconWrapper.style.position = 'relative';
    iconWrapper.style.width = '20px';
    iconWrapper.style.height = '20px';
    const icon = document.createElement('img');
    const iconName = (cube.userData.icon || "cube") + ".png";
    icon.src = `resources/images/ui/icons/${iconName}`;
    icon.alt = 'object icon';
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.style.objectFit = 'contain';
    iconWrapper.appendChild(icon);

    item.appendChild(iconWrapper);

    const text = document.createElement('span');
    text.textContent = cube.name || 'Unnamed';
    item.appendChild(text);

    let clickTimer = null;
    item.addEventListener('click', () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        selectedCube = cube;
        selectedFolder = null;
        updatePanelForCube(selectedCube);
        updateCubeList();
        updateSpheresVisibility();
        clickTimer = null;
      }, 250);
    });

    item.addEventListener('dblclick', () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = null;
      renameCube(item, cube);
    });

    if (selectedCube === cube) {
      item.style.backgroundColor = '#3366ff';
      item.style.color = 'white';
    }

    projectContent.appendChild(item);
  });
}

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
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if(intersects.length > 0){
    selectedCube = intersects[0].object;
    updatePanelForCube(selectedCube);
    updateCubeList();
    updateSpheresVisibility();
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

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
    e.preventDefault();

    if (selectedCube) {
      const idx = cubes.indexOf(selectedCube);
      if (idx !== -1) {
        scene.remove(selectedCube);
        cubes.splice(idx, 1);
        selectedCube = cubes[idx - 1] || cubes[0] || null;
        updatePanelForCube(selectedCube);
        updateCubeList();
      }
      return;
    }

    if (selectedFolder) {
      const idx = window.customFolders.indexOf(selectedFolder);
      if (idx !== -1) {
        window.customFolders.splice(idx, 1);
        selectedFolder = null;
        updateCubeList();
      }
    }

    if (selectedScript) {
      const idx = window.customFolders.indexOf(selectedScript);
      if (idx !== -1) {
        window.customFolders.splice(idx, 1);
        selectedScript = null;
        updateCubeList();
      }
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const fovDisplay = document.getElementById('fovDisplay');

function updateFovDisplay() {
  fovDisplay.textContent = `FOV: ${Math.round(camera.fov)}`;
}

updateFovDisplay();

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    event.preventDefault();

    const fovStep = 1.5;
    if (event.deltaY < 0) {
      camera.fov = Math.max(10, camera.fov - fovStep);
    } else {
      camera.fov = Math.min(120, camera.fov + fovStep);
    }
    camera.updateProjectionMatrix();
    updateFovDisplay();
  }
}, { passive: false });

let lastTime = 0;
function animate(time=0){
  requestAnimationFrame(animate);
  const delta = (time - lastTime)/1000;
  lastTime = time;
  updateCamera(delta);

  updateGridAroundCameraCircle(camera);
  
  renderer.render(scene, camera);
}
animate();

updatePanelForCube(selectedCube);
updateCubeList();
updateSpheresVisibility();


