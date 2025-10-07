// -- Map Creator Lib -- mcl.js

export const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 8);

export const offsets = [
  { pos: new THREE.Vector3( 0,  0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0, -0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3(-0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3( 0,  0,  0.4), axis: 'z', color: 0x0000ff },
  { pos: new THREE.Vector3( 0,  0, -0.4), axis: 'z', color: 0x0000ff }
];

export const spheres = [];

export function createSpheresForCube(cube) {
  offsets.forEach(o => {
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
    const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);
    
    sphere.castShadow = false;
    sphere.receiveShadow = false;
    
    sphere.position.copy(o.pos.clone().multiplyScalar(2));
    sphere.userData.axis = o.axis; 
    sphere.visible = false;
    cube.add(sphere);
    spheres.push(sphere);
  });

  cube.userData.spheres = spheres;
}

export function updateSpheresVisibility(cubes = [], selectedCube) {
  if (!cubes) return;
  cubes.forEach(cube => {
    const spheres = cube.userData?.spheres || [];
    spheres.forEach(sphere => {
      sphere.visible = (cube === selectedCube);
    });
  });
}

export let selectedSphere = null;
export const plane = new THREE.Plane();
export const offset = new THREE.Vector3();
export const intersection = new THREE.Vector3();

export const dragRaycaster = new THREE.Raycaster();
export const mouseVec = new THREE.Vector2();

export function onPointerDown(event, renderer, camera, selectedCube) {
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

export function onPointerMove(event, renderer, camera, selectedCube) {
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

export function onPointerUp() {
  selectedSphere = null;
}
