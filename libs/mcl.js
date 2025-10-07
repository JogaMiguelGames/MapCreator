// -- mcl.js --
import * as THREE from '../libs/three.min.js';

// Geometrias básicas
export const box_geometry = new THREE.BoxGeometry(1, 1, 1);
export const sphere_geometry = new THREE.SphereGeometry(0.5, 16, 16);
export const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 16);
export const cylinder_geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
export const cone_geometry = new THREE.ConeGeometry(0.5, 1, 16);
export const plane_geometry = new THREE.PlaneGeometry(2, 2);

// Offsets para as esferas de manipulação do cubo
export const offsets = [
    { axis: 'x', pos: new THREE.Vector3(1,0,0), color: 0xff0000 },
    { axis: 'y', pos: new THREE.Vector3(0,1,0), color: 0x00ff00 },
    { axis: 'z', pos: new THREE.Vector3(0,0,1), color: 0x0000ff },
];

// Função para criar esferas de manipulação de um cubo
export function createSpheresForCube(cube) {
    const cubeSpheres = [];
    offsets.forEach(o => {
        const material = new THREE.MeshStandardMaterial({ color: o.color });
        const sphere = new THREE.Mesh(sphereGeometrySmall.clone(), material);
        sphere.position.copy(o.pos.clone().multiplyScalar(2));
        sphere.userData.axis = o.axis;
        sphere.visible = false;

        cube.add(sphere);
        cubeSpheres.push(sphere);
    });
    cube.userData.spheres = cubeSpheres;
    return cubeSpheres;
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
