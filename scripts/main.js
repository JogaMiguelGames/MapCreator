// === Map Creator - Main.js ===
import { Project, Model, Page, Tree_View, Icon } from '../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../libs/mcl/add.js';
import { sphereGeometrySmall, spheres, offsets, addManipulationSpheres, updateSpheresVisibility, selectedSphere, plane, offset, intersection, dragRaycaster, mouseVec, onPointerDown, updateCursor, onPointerMove, onPointerUp} from '../libs/mcl/objects.js';

let object3D;
object3D = Model.Object3D;

window.object3D = object3D;

let selectedObject3D;
selectedObject3D = Model.Selected.Object;

window.selectedObject3D = selectedObject3D;

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

bgColorInput.addEventListener('input', () => {
  const val = bgColorInput.value.trim();
  if(/^#([0-9a-f]{6})$/i.test(val)){
    scene.background.set(val);
  }
});

function updatePanelForCube(object3D) {
  if (!object3D) {
    [Page.Elements.Scale.X, Page.Elements.Scale.Y, Page.Elements.Scale.Z,
     Page.Elements.Position.X, Page.Elements.Position.Y, Page.Elements.Position.Z,
     Page.Elements.Input.Color.Hex_Input,
     Page.Elements.Rotation.X, Page.Elements.Rotation.Y, Page.Elements.Rotation.Z].forEach(i => {
      i.value = '';
      i.disabled = true;
    });
    return;
  }

  Page.Elements.Scale.X.disabled = false;
  Page.Elements.Scale.Y.disabled = false;
  Page.Elements.Scale.Z.disabled = false;
  Page.Elements.Position.X.disabled = false;
  Page.Elements.Position.Y.disabled = false;
  Page.Elements.Position.Z.disabled = false;
  Page.Elements.Rotation.X.disabled = false;
  Page.Elements.Rotation.Y.disabled = false;
  Page.Elements.Rotation.Z.disabled = false;
  Page.Elements.Input.Color.Hex_Input.disabled = false;

  Page.Elements.Rotation.X.value = THREE.MathUtils.radToDeg(object3D.rotation.x).toFixed(2);
  Page.Elements.Rotation.Y.value = THREE.MathUtils.radToDeg(object3D.rotation.y).toFixed(2);
  Page.Elements.Rotation.Z.value = THREE.MathUtils.radToDeg(object3D.rotation.z).toFixed(2);

  Page.Elements.Scale.X.value = object3D.scale.x.toFixed(2);
  Page.Elements.Scale.Y.value = object3D.scale.y.toFixed(2);
  Page.Elements.Scale.Z.value = object3D.scale.z.toFixed(2);

  Page.Elements.Position.X.value = object3D.position.x.toFixed(2);
  Page.Elements.Position.Y.value = object3D.position.y.toFixed(2);
  Page.Elements.Position.Z.value = object3D.position.z.toFixed(2);

  if (object3D.material && object3D.material.color) {
    Page.Elements.Input.Color.Hex_Input.value = `#${object3D.material.color.getHexString()}`;
  } else {
    Page.Elements.Input.Color.Hex_Input.value = '';
  }
}

window.updatePanelForCube = updatePanelForCube;

[Page.Elements.Scale.X, Page.Elements.Scale.Y, Page.Elements.Scale.Z].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!Model.Selected.Object) return;
    const val = parseFloat(input.value);
    if(val > 0){
      if(i===0) Model.Selected.Object.scale.x = val;
      if(i===1) Model.Selected.Object.scale.y = val;
      if(i===2) Model.Selected.Object.scale.z = val;
    }
  });
});

[Page.Elements.Position.X, Page.Elements.Position.Y, Page.Elements.Position.Z].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!Model.Selected.Object) return;
    const val = parseFloat(input.value);
    if(!isNaN(val)){
      if(i===0) Model.Selected.Object.position.x = val;
      if(i===1) Model.Selected.Object.position.y = val;
      if(i===2) Model.Selected.Object.position.z = val;
    }
  });
});

[Page.Elements.Rotation.X, Page.Elements.Rotation.Y, Page.Elements.Rotation.Z].forEach((input,i) => {
  input.addEventListener('input', () => {
    if(!Model.Selected.Object) return;
    const val = parseFloat(input.value);
    if(!isNaN(val)){
      const rad = THREE.MathUtils.degToRad(val);
      if(i===0) Model.Selected.Object.rotation.x = rad;
      if(i===1) Model.Selected.Object.rotation.y = rad;
      if(i===2) Model.Selected.Object.rotation.z = rad;
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
  UpdateTreeView();
  return folder;
}

function createScript(name = 'New Script') {
  window.scriptCount = (window.scriptCount || 0) + 1;
  const script = { id: Date.now() + Math.random(), name };
  window.customScripts.push(script);
  UpdateTreeView();
  return script;
}

aW_CreateFolder.addEventListener('click', () => {
  const newFolder = { id: Date.now() + Math.random(), name: 'New Folder' };
  window.customFolders.push(newFolder);
  Tree_View.Selected.Item = newFolder;
  UpdateTreeView();
});

aW_CreateScript.addEventListener('click', () => {
  const newScript = { id: Date.now() + Math.random(), name: 'New Script' };
  window.customScripts.push(newScript);
  Tree_View.Selected.Item = newScript;
  UpdateTreeView();
});

function UpdateTreeView() { 
  Page.Elements.Tree_View.Div.innerHTML = '';

  const projectDiv = document.createElement('div');
  projectDiv.className = 'Tree_View_Objects';
  projectDiv.style.display = 'flex';
  projectDiv.style.alignItems = 'center';
  projectDiv.style.padding = '4px 8px';
  projectDiv.style.borderRadius = '3px';
  projectDiv.style.cursor = 'pointer';
  projectDiv.style.gap = '6px';
  projectDiv.style.fontWeight = 'bold';

  const folderIcon = document.createElement('img');
  folderIcon.src = Icon.SVG.Folder;
  folderIcon.alt = Project.Name;
  folderIcon.style.width = '20px';
  folderIcon.style.height = '20px';
  folderIcon.style.objectFit = 'contain';
  projectDiv.appendChild(folderIcon);

  const folderText = document.createElement('span');
  projectDiv.appendChild(folderText);
  Page.Elements.Tree_View.Div.appendChild(projectDiv);

  const scriptIcon = document.createElement('img');
  scriptIcon.src = Icon.SVG.KS_Script;
  scriptIcon.alt = 'Project Script';
  scriptIcon.style.width = '20px';
  scriptIcon.style.height = '20px';
  scriptIcon.style.objectFit = 'contain';

  const scriptText = document.createElement('span');
  scriptText.textContent = 'Project';
  projectDiv.appendChild(scriptText);

  const projectContent = document.createElement('div');
  projectContent.style.display = 'flex';
  projectContent.style.flexDirection = 'column';
  projectContent.style.marginLeft = '20px';
  Page.Elements.Tree_View.Div.appendChild(projectContent);

  const addWindowBtn = document.createElement('button');
  addWindowBtn.textContent = '+';
  addWindowBtn.title = 'Add a object';
  addWindowBtn.style.cssText = `
    width:32px; height:32px; border-radius:50%; border:none; background-color:#3366ff;
    color:white; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; margin-left:10px;
  `;
  
  projectDiv.appendChild(addWindowBtn);

  addWindowBtn.addEventListener("click", () => {
    Page.Elements.Add_Window.Window.style.display = Page.Elements.Add_Window.Window.style.display === "flex" ? "none" : "flex";
  });

  Page.Elements.Add_Window.Window.addEventListener("click", (e) => {
    if (e.target === Page.Elements.Add_Window.Window) Page.Elements.Add_Window.Window.style.display = "none";
  });

  window.customFolders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'Tree_View_Objects';
    folderDiv.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:4px;
      cursor:pointer; gap:8px; color:#fff; margin-bottom:4px; margin-left:20px;
    `;

    const icon = document.createElement('img');
    icon.src = Icon.SVG.Folder;
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
        UpdateTreeView();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          folder.name = input.value.trim() || 'Unnamed Folder';
          folder.isEditing = false;
          UpdateTreeView();
        }
      });
    } else {
      const span = document.createElement('span');
      span.textContent = folder.name;
      folderDiv.appendChild(span);

      folderDiv.addEventListener('click', () => {
        Model.Selected.Object = null;
        Tree_View.Selected.Item = folder;
        UpdateTreeView();
        updateSpheresVisibility();
      });

      span.addEventListener('dblclick', e => {
        e.stopPropagation();
        folder.isEditing = true;
        UpdateTreeView();
      });
    }

    if (Tree_View.Selected.Item === folder) {
      folderDiv.style.backgroundColor = '#3366ff';
      folderDiv.style.color = 'white';
      Page.Elements.Scale.X.disabled = true;
      Page.Elements.Scale.Y.disabled = true;
      Page.Elements.Scale.Z.disabled = true;
      Page.Elements.Position.X.disabled = true;
      Page.Elements.Position.Y.disabled = true;
      Page.Elements.Position.Z.disabled = true;
      Page.Elements.Rotation.X.disabled = true;
      Page.Elements.Rotation.Y.disabled = true;
      Page.Elements.Rotation.Z.disabled = true;
      Page.Elements.Input.Color.Hex_Input.disabled = true;
    }

    projectContent.appendChild(folderDiv);
  });

  window.customScripts.forEach(script => {
    const scriptDiv = document.createElement('div');
    scriptDiv.className = 'Tree_View_Objects';
    scriptDiv.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:4px;
      cursor:pointer; gap:8px; color:#fff; margin-bottom:4px; margin-left:20px;
    `;

    if (script.content === undefined) {
      script.content = 'console.log("Hello, World!");';
    }
  
    const icon = document.createElement('img');
    icon.src = Icon.SVG.KS_Script;
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
        UpdateTreeView();
      });
  
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          script.name = input.value.trim() || 'Unnamed Script';
          script.isEditing = false;
          UpdateTreeView();
        }
      });
    } else {
      const span = document.createElement('span');
      span.textContent = script.name;
      scriptDiv.appendChild(span);

      scriptDiv.addEventListener('click', () => {
        if (Tree_View.Selected.Item && Tree_View.Selected.Item.content !== undefined) {
          Tree_View.Selected.Item.content = Page.Elements.Script.Input.value;
        }
  
        Model.Selected.Object = null;
        Tree_View.Selected.Item = script;
        UpdateTreeView();
        updateSpheresVisibility();
      });
  
      span.addEventListener('dblclick', e => {
        e.stopPropagation();
        script.isEditing = true;
        UpdateTreeView();
      });
    }

    if (Tree_View.Selected.Item === script) {
      scriptDiv.style.backgroundColor = '#3366ff';
      scriptDiv.style.color = 'white';
      Page.Elements.Scale.X.disabled = true;
      Page.Elements.Scale.Y.disabled = true;
      Page.Elements.Scale.Z.disabled = true;
      Page.Elements.Position.X.disabled = true;
      Page.Elements.Position.Y.disabled = true;
      Page.Elements.Position.Z.disabled = true;
      Page.Elements.Rotation.X.disabled = true;
      Page.Elements.Rotation.Y.disabled = true;
      Page.Elements.Rotation.Z.disabled = true;
      Page.Elements.Input.Color.Hex_Input.disabled = true;
      
      const Scripting = Page.Elements.Script.Input;

      Scripting.value = script.content;

      clearInterval(window.scriptWatcher);
      window.scriptWatcher = setInterval(() => {
        script.content = Scripting.value;
      }, 200);
    }
  
    projectContent.appendChild(scriptDiv);
  });

  Model.Objects.forEach(object3D => {
    const item = document.createElement('div');
    item.className = 'Tree_View_Item';
    item.style.cssText = `
      display:flex; align-items:center; padding:4px 8px; border-radius:3px;
      cursor:pointer; gap:6px; margin-bottom:2px; margin-left:20px;
    `;

    const iconWrapper = document.createElement('div');
    iconWrapper.style.position = 'relative';
    iconWrapper.style.width = '20px';
    iconWrapper.style.height = '20px';
    const icon = document.createElement('img');
    const iconName = (object3D.userData.icon || "cube") + ".png";
    icon.src = `resources/images/ui/icons/${iconName}`;
    icon.alt = 'object icon';
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.style.objectFit = 'contain';
    iconWrapper.appendChild(icon);

    item.appendChild(iconWrapper);

    const text = document.createElement('span');
    text.textContent = object3D.name || 'Unnamed';
    item.appendChild(text);

    let clickTimer = null;
    item.addEventListener('click', () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        Model.Selected.Object = object3D;
        Tree_View.Selected.Item = null;
        updatePanelForCube(Model.Selected.Object);
        UpdateTreeView();
        updateSpheresVisibility();
        clickTimer = null;
      }, 250);
    });

    item.addEventListener('dblclick', () => {
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = null;
      renameCube(item, object3D);
    });

    if (Model.Selected.Object === object3D) {
      item.style.backgroundColor = '#3366ff';
      item.style.color = 'white';
      Page.Elements.Scale.X.disabled = false;
      Page.Elements.Scale.Y.disabled = false;
      Page.Elements.Scale.Z.disabled = false;
      Page.Elements.Position.X.disabled = false;
      Page.Elements.Position.Y.disabled = false;
      Page.Elements.Position.Z.disabled = false;
      Page.Elements.Rotation.X.disabled = false;
      Page.Elements.Rotation.Y.disabled = false;
      Page.Elements.Rotation.Z.disabled = false;
      Page.Elements.Input.Color.Hex_Input.disabled = false;
    }

    projectContent.appendChild(item);
  });
}

window.UpdateTreeView = UpdateTreeView;

function renameCube(div, object3D){
  const text = div.querySelector('span');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = Model.Object3D.name || 'Cube';
  input.style.flex = '1';
  input.style.padding = '2px';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '3px';

  div.replaceChild(input, text);
  input.focus();

  function saveName() {
    Model.Object3D.name = input.value.trim() || 'Unnamed';
    UpdateTreeView();
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
  const intersects = raycaster.intersectObjects(Model.Objects);

  if(intersects.length > 0){
    Model.Selected.Object = intersects[0].object;
    updatePanelForCube(Model.Selected.Object);
    UpdateTreeView();
    updateSpheresVisibility();
  }
}
canvas.addEventListener('click', onClick);

Page.Elements.Input.Color.Hex_Input.addEventListener('input', () => {
  if(!Model.Selected.Object || !Model.Selected.Object.material) return;
  const val = Page.Elements.Input.Color.Hex_Input.value.trim();
  if(/^#([0-9a-f]{6})$/i.test(val)){
    Model.Selected.Object.material.color.set(val);
  }
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable;

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
    e.preventDefault();

    if (Model.Selected.Object) {
      const idx = Model.Objects.indexOf(Model.Selected.Object);
      if (idx !== -1) {
        scene.remove(Model.Selected.Object);
        Model.Objects.splice(idx, 1);
        Model.Selected.Object = Model.Objects[idx - 1] || Model.Objects[0] || null;
        updatePanelForCube(Model.Selected.Object);
        UpdateTreeView();
      }
      return;
    }

    if (Tree_View.Selected.Item) {
      const idx = window.customFolders.indexOf(Tree_View.Selected.Item);
      if (idx !== -1) {
        window.customFolders.splice(idx, 1);
        Tree_View.Selected.Item = null;
        UpdateTreeView();
      }
    }

    if (Tree_View.Selected.Item) {
      const idx = window.customScripts.indexOf(Tree_View.Selected.Item);
      if (idx !== -1) {
        window.customScripts.splice(idx, 1);
        Tree_View.Selected.Item = null;
        UpdateTreeView();
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

updatePanelForCube(object3D);
UpdateTreeView();
updateSpheresVisibility();







