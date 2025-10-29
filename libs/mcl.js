// === MCL.js - Map Creator Lib ===

const mainCube = new THREE.Mesh(box_geometry, white_material);
mainCube.position.set(0, 0, 0);
mainCube.name = 'Cube 1';
mainCube.castShadow = true;
mainCube.receiveShadow = true;
scene.add(mainCube);
mainCube.userData.icon = "cube";

const cubes = [mainCube];

// Project Data
const projectName = "Project";
const mapFileName = "Project.map";

// Page Elements
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

const addWindow = document.getElementById('addWindow');
const addWindowContent = document.getElementById('addWindowContent');

const aW_CreateFolder = document.getElementById('aW_CreateFolder');
const aW_CreateScript = document.getElementById('aW_CreateScript');

// Icons
const folder_SVG_Icon = 'resources/images/ui/icons/folder.svg';
const kS_Script_SVG_Icon = 'resources/images/ui/icons/kerneliumScript_File.svg';

const cube_SVG_Icon = 'resources/images/ui/icons/cube.svg';
const sphere_SVG_Icon = 'resources/images/ui/icons/sphere.svg';

const cube_PNG_Icon = 'resources/images/ui/icons/cube.png';
const sphere_PNG_Icon = 'resources/images/ui/icons/sphere.png';
const cylinder_PNG_Icon = 'resources/images/ui/icons/cylinder.png';
const cone_PNG_Icon = 'resources/images/ui/icons/cone.png';
const plane_PNG_Icon = 'resources/images/ui/icons/plane.png';

// Selected Stuffs
let selectedCube = mainCube;
let selectedObject = null;
