// -- Map Creator Lib -- mcLib.js

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
  if (!selectedCube || !selectedCube.userData.spheres) return;

  const intersects = dragRaycaster.intersectObjects(selectedCube.userData.spheres);

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
    const localPos = selectedCube.worldToLocal(worldPos.clone());

    if(axis === 'x') selectedCube.position.x = Math.round(selectedCube.position.x + localPos.x);
    if(axis === 'y') selectedCube.position.y = Math.round(selectedCube.position.y + localPos.y);
    if(axis === 'z') selectedCube.position.z = Math.round(selectedCube.position.z + localPos.z);
  }
}

function onPointerUp() {
  selectedSphere = null;
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointerleave', onPointerUp);

updateSpheresVisibility();
