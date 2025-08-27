// --- Setup básico Three.js (camera, scene, renderer) ---

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cubo principal
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Gizmo group e esferas
const gizmoGroup = new THREE.Group();
scene.add(gizmoGroup);

const gizmoRadius = 0.1;
const gizmoSegments = 6;

const axisColors = {
  'posX': 0xff0000,
  'negX': 0x880000,
  'posY': 0x00ff00,
  'negY': 0x008800,
  'posZ': 0x0000ff,
  'negZ': 0x000088,
};

const gizmos = {};

for (const axis of ['posX', 'negX', 'posY', 'negY', 'posZ', 'negZ']) {
  const geo = new THREE.SphereGeometry(gizmoRadius, gizmoSegments, gizmoSegments);
  const mat = new THREE.MeshBasicMaterial({ color: axisColors[axis] });
  const sphere = new THREE.Mesh(geo, mat);
  sphere.name = `gizmo_${axis}`;
  gizmoGroup.add(sphere);
  gizmos[axis] = sphere;
}

// Parentear gizmo ao cubo e posicionar relativo ao centro
cube.add(gizmoGroup);
gizmoGroup.position.set(0,0,0);

const offset = 0.7;
const scale = cube.scale;

gizmos.posX.position.set(offset * scale.x, 0, 0);
gizmos.negX.position.set(-offset * scale.x, 0, 0);
gizmos.posY.position.set(0, offset * scale.y, 0);
gizmos.negY.position.set(0, -offset * scale.y, 0);
gizmos.posZ.position.set(0, 0, offset * scale.z);
gizmos.negZ.position.set(0, 0, -offset * scale.z);

// Variáveis para arrastar
let draggingGizmo = null;
let dragStartMouse = new THREE.Vector2();
let dragStartPos = new THREE.Vector3();

const raycaster = new THREE.Raycaster();

function getMouseCoords(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
}

function onPointerDown(event) {
  const mouse = getMouseCoords(event);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(gizmos));
  if (intersects.length > 0) {
    draggingGizmo = intersects[0].object.name;
    dragStartMouse.set(event.clientX, event.clientY);
    dragStartPos.copy(cube.position);
    event.preventDefault();
  }
}

function onPointerMove(event) {
  if (!draggingGizmo) return;

  const deltaX = event.clientX - dragStartMouse.x;
  const deltaY = event.clientY - dragStartMouse.y;

  const moveSpeed = 0.01;

  const pos = dragStartPos.clone();

  switch (draggingGizmo) {
    case 'gizmo_posX':
      pos.x += deltaX * moveSpeed;
      break;
    case 'gizmo_negX':
      pos.x -= deltaX * moveSpeed;
      break;
    case 'gizmo_posY':
      pos.y += deltaY * moveSpeed;
      break;
    case 'gizmo_negY':
      pos.y -= deltaY * moveSpeed;
      break;
    case 'gizmo_posZ':
      pos.z += deltaX * moveSpeed;
      break;
    case 'gizmo_negZ':
      pos.z -= deltaX * moveSpeed;
      break;
  }

  cube.position.copy(pos);
}

function onPointerUp(event) {
  draggingGizmo = null;
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);

// Camera e controles básicos
camera.position.set(3, 3, 3);
camera.lookAt(0,0,0);

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
