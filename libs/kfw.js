// -- Kernelium Framework -- kfw.js

const scene = new THREE.Scene();
scene.background = new THREE.Color('#00BFFF');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// -- 3D Objects

const cube_geometry = new THREE.BoxGeometry(1, 1, 1);
const sphere_geometry = new THREE.SphereGeometry(1, 16, 16);
const cylinder_geometry = new THREE.CylinderGeometry(1, 1, 2, 16);
const plane_geometry = new THREE.PlaneGeometry(1, 1);

const white_material = new THREE.MeshStandardMaterial({ color: 0xffffff });
