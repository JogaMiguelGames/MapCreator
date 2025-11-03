import { Project, Model, Page, Tree_View, Icon } from './mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from './add.js';

export let selectedSphere = null;

export const linesVisible = true;

export const plane = new THREE.Plane();
export const offset = new THREE.Vector3();
export const intersection = new THREE.Vector3();

export const dragRaycaster = new THREE.Raycaster();
export const mouseVec = new THREE.Vector2();

export const Gizmo = {

};

export const sphereGeometrySmall = new THREE.SphereGeometry(0.2, 16, 8);

export const offsets = [
  { pos: new THREE.Vector3( 0,  0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0, -0.4,  0), axis: 'y', color: 0x00ff00 },
  { pos: new THREE.Vector3( 0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3(-0.4,  0,  0), axis: 'x', color: 0xff0000 },
  { pos: new THREE.Vector3( 0,  0,  0.4), axis: 'z', color: 0x0000ff },
  { pos: new THREE.Vector3( 0,  0, -0.4), axis: 'z', color: 0x0000ff }
];

export function addManipulationSpheres(obj) {
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

export const spheres = [];

offsets.forEach(o => {
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: o.color });
  const sphere = new THREE.Mesh(sphereGeometrySmall, sphereMaterial);
  
  sphere.castShadow = false;
  sphere.receiveShadow = false;
  
  sphere.position.copy(o.pos.clone().multiplyScalar(2));
  sphere.userData.axis = o.axis; 
  sphere.visible = false;
  Model.Object3D.add(sphere);
  spheres.push(sphere);
});

export function updateSpheresVisibility() {
  Model.Objects.forEach(object3D => {
    const isSelected = (object3D === Model.Selected.Object);
    if (object3D.userData.spheres) {
      object3D.userData.spheres.forEach(s => s.visible = isSelected);
    }
  });
}

window.updateSpheresVisibility = updateSpheresVisibility;

export function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragRaycaster.setFromCamera(mouseVec, camera);
  if (!Model.Selected.Object || !Model.Selected.Object.userData.spheres) return;

  const intersects = dragRaycaster.intersectObjects(Model.Selected.Object.userData.spheres);

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

export function updateCursor() {
  if (selectedSphere) {
    renderer.domElement.style.cursor = 'grabbing';
  } else {
    const rect = renderer.domElement.getBoundingClientRect();
    dragRaycaster.setFromCamera(mouseVec, camera);

    if (Model.Selected.Object && Model.Selected.Object.userData.spheres) {
      const intersects = dragRaycaster.intersectObjects(Model.Selected.Object.userData.spheres);
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'grab';
        return;
      }
    }
    renderer.domElement.style.cursor = 'default';
  }
}

export function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragRaycaster.setFromCamera(mouseVec, camera);
  updateCursor();

  if (!selectedSphere) return;
  if (dragRaycaster.ray.intersectPlane(plane, intersection)) {
    const axis = selectedSphere.userData.axis;
    const worldPos = intersection.clone().sub(offset);
    const localPos = Model.Selected.Object.worldToLocal(worldPos.clone());

    if(axis === 'x') Model.Selected.Object.position.x = Math.round(Model.Selected.Object.position.x + localPos.x);
    if(axis === 'y') Model.Selected.Object.position.y = Math.round(Model.Selected.Object.position.y + localPos.y);
    if(axis === 'z') Model.Selected.Object.position.z = Math.round(Model.Selected.Object.position.z + localPos.z);
  }
}

export function onPointerUp() {
  selectedSphere = null;
  renderer.domElement.style.cursor = 'default';
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointerleave', onPointerUp);
