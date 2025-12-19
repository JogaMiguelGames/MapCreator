// ===================== ADD.JS =====================

import { Project, Model, Page, Icon } from './mcl.js';
import {
  sphereGeometrySmall,
  spheres,
  offsets,
  addManipulationSpheres,
  updateSpheresVisibility,
  selectedSphere,
  plane,
  offset,
  intersection,
  dragRaycaster,
  mouseVec,
  onPointerDown,
  updateCursor,
  onPointerMove,
  onPointerUp
} from './objects.js';

/* =====================================================
   Objects ID System
===================================================== */

export function isIDUsed(id) {
  return Model.Objects.some(obj => obj.userData?.id === id);
}

export function generateUniqueID(prefix) {
  let id;
  do {
    id = `${prefix}_${crypto.randomUUID()}`;
  } while (isIDUsed(id));
  return id;
}

export function assignUniqueID(object, prefix) {
  const id = generateUniqueID(prefix);

  if (isIDUsed(id)) {
    console.warn(`[ID] Duplicate ID detected: ${id}. Object discarded.`);
    return false;
  }

  object.userData.id = id;
  return true;
}

export function getObjectById(id) {
  if (!id) {
    console.warn("[getObjectById] Invalid ID:", id);
    return null;
  }

  const object = Model.Objects.find(
    obj => obj.userData && obj.userData.id === id
  );

  if (!object) {
    console.warn(`[getObjectById] Object with ID "${id}" not found.`);
    return null;
  }

  return object;
}

/* =====================================================
   CAMERA DEBUG EXPORTS
===================================================== */

export let CamPosX;
export let CamPosY;
export let CamPosZ;

export let CamRotX;
export let CamRotY;
export let CamRotZ;

/* =====================================================
   CREATE CUBE
===================================================== */

export function CreateCube(
  name = "Cube",
  position = new THREE.Vector3(0, 0, 0),
  material = new THREE.MeshStandardMaterial({ color: 0xffffff })
) {
  const cube = new THREE.Mesh(box_geometry.clone(), material);

  if (!assignUniqueID(cube, "cube")) {
    cube.geometry.dispose();
    return null;
  }

  cube.name = name;
  cube.userData.icon = "cube";
  cube.castShadow = true;
  cube.receiveShadow = true;

  cube.position.copy(position);
  cube.rotation.set(0, 0, 0);
  cube.scale.set(1, 1, 1);

  addManipulationSpheres(cube);
  scene.add(cube);

  Model.Objects.push(cube);
  Model.Selected.Object = cube;

  UpdateTreeView();
  return cube;
}

/* =====================================================
   CREATE SPHERE
===================================================== */

export function CreateSphere() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(sphere_geometry.clone(), material);

  if (!assignUniqueID(sphere, "sphere")) {
    sphere.geometry.dispose();
    return null;
  }

  sphere.name = "Sphere";
  sphere.userData.icon = "sphere";
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  sphere.position.set(0, 0, 0);

  addManipulationSpheres(sphere);
  scene.add(sphere);

  Model.Objects.push(sphere);
  Model.Selected.Object = sphere;

  UpdateTreeView();
  pushToHistory({ type: 'delete', object: sphere });

  return sphere;
}

/* =====================================================
   CREATE CYLINDER
===================================================== */

export function CreateCylinder() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cylinder = new THREE.Mesh(cylinder_geometry.clone(), material);

  if (!assignUniqueID(cylinder, "cylinder")) {
    cylinder.geometry.dispose();
    return null;
  }

  cylinder.name = "Cylinder";
  cylinder.userData.icon = "cylinder";
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  cylinder.position.set(0, 0, 0);
  cylinder.scale.set(0.5, 0.5, 0.5);

  addManipulationSpheres(cylinder);
  scene.add(cylinder);

  Model.Objects.push(cylinder);
  Model.Selected.Object = cylinder;

  UpdateTreeView();
  pushToHistory({ type: 'delete', object: cylinder });

  return cylinder;
}

/* =====================================================
   CREATE CONE
===================================================== */

export function CreateCone() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cone = new THREE.Mesh(cone_geometry.clone(), material);

  if (!assignUniqueID(cone, "cone")) {
    cone.geometry.dispose();
    return null;
  }

  cone.name = "Cone";
  cone.userData.icon = "cone";
  cone.castShadow = true;
  cone.receiveShadow = true;

  cone.position.set(0, 0, 0);
  cone.scale.set(0.5, 0.5, 0.5);

  addManipulationSpheres(cone);
  scene.add(cone);

  Model.Objects.push(cone);
  Model.Selected.Object = cone;

  UpdateTreeView();
  pushToHistory({ type: 'delete', object: cone });

  return cone;
}

/* =====================================================
   CREATE PLANE
===================================================== */

export function CreatePlane() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const planeMesh = new THREE.Mesh(plane_geometry.clone(), material);

  if (!assignUniqueID(planeMesh, "plane")) {
    planeMesh.geometry.dispose();
    return null;
  }

  planeMesh.name = "Plane";
  planeMesh.userData.icon = "plane";
  planeMesh.castShadow = true;
  planeMesh.receiveShadow = true;

  planeMesh.position.set(0, 0, 0);
  planeMesh.rotation.x = -Math.PI / 2;

  addManipulationSpheres(planeMesh);
  scene.add(planeMesh);

  Model.Objects.push(planeMesh);
  Model.Selected.Object = planeMesh;

  UpdateTreeView();
  pushToHistory({ type: 'delete', object: planeMesh });

  return planeMesh;
}

/* =====================================================
   CREATE CAMERA (APENAS UMA)
===================================================== */

export function CreateCamera() {
  if (Model.Objects.some(obj => obj.userData?.icon === "camera")) {
    console.warn("Camera already exists in the scene.");
    return;
  }

  const objLoader = new THREE.OBJLoader();
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("resources/models/editor/camera/texture.png");

  objLoader.load(
    "resources/models/editor/camera/camera.obj",
    (object) => {

      if (!assignUniqueID(object, "camera")) return;

      object.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      object.name = "Camera";
      object.userData.icon = "camera";

      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.set(0.3, 0.3, 0.3);

      scene.add(object);
      Model.Objects.push(object);
      Model.Selected.Object = object;

      UpdateTreeView();
      pushToHistory({ type: "delete", object });

      setInterval(() => {
        CamPosX = object.position.x;
        CamPosY = object.position.y;
        CamPosZ = object.position.z;

        CamRotX = THREE.MathUtils.radToDeg(object.rotation.x).toFixed(2);
        CamRotY = THREE.MathUtils.radToDeg(object.rotation.y).toFixed(2);
        CamRotZ = THREE.MathUtils.radToDeg(object.rotation.z).toFixed(2);
      }, 500);
    },
    undefined,
    error => console.error("Error loading camera model:", error)
  );
}

/* =====================================================
   CREATE LIGHT
===================================================== */

export function CreateLight() {
  const light = new THREE.PointLight(0xffffff, 2, 15);
  light.castShadow = true;

  if (!assignUniqueID(light, "light")) return null;

  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1
  });

  const sphere = new THREE.Mesh(sphere_geometry.clone(), sphereMat);
  sphere.scale.set(0.2, 0.2, 0.2);
  sphere.userData.icon = "light";

  light.add(sphere);
  addManipulationSpheres(sphere);

  scene.add(light);
  Model.Objects.push(light);

  UpdateTreeView();
  pushToHistory({ type: 'delete', object: light });

  return light;
}

/* =====================================================
   COMMAND LINE
===================================================== */

document.getElementById("commandLine").addEventListener("keydown", function (e) {
  if (e.key !== "Enter") return;

  const command = this.value.trim().toLowerCase();

  if (command === "create.new.cube") CreateCube();
  else if (command === "create.new.sphere") CreateSphere();
  else if (command === "create.new.cylinder") CreateCylinder();
  else if (command === "create.new.cone") CreateCone();
  else if (command === "create.new.plane") CreatePlane();
  else if (command === "create.new.camera") CreateCamera();
  else if (command === "create.new.light") CreateLight();

  this.value = "";
});


