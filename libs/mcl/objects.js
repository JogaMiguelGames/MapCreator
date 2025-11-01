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
  Model.Object3D.add(sphere);
  spheres.push(sphere);
});

function updateSpheresVisibility() {
  Model.Objects.forEach(object3D => {
    const isSelected = (Model.Object3D === Model.Selected.Object);
    if (Model.Object3D.userData.spheres) {
      Model.Object3D.userData.spheres.forEach(s => s.visible = isSelected);
    }
  });
}

window.updateSpheresVisibility = updateSpheresVisibility;

let selectedSphere = null;
