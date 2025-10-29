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
const mapFileName =  `${projectName}.map`;

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
export const Icon = {
  SVG: {
    const Folder = 'resources/images/ui/icons/folder.svg';
    const KS_Script = 'resources/images/ui/icons/kerneliumScript_File.svg';
    
    const Cube = 'resources/images/ui/icons/cube.svg';
    const Sphere = 'resources/images/ui/icons/sphere.svg';
  }
  
  PNG: {
    const Cube = 'resources/images/ui/icons/cube.png';
    const Sphere = 'resources/images/ui/icons/sphere.png';
    const Cylinder = 'resources/images/ui/icons/cylinder.png';
    const Cone = 'resources/images/ui/icons/cone.png';
    const Plane = 'resources/images/ui/icons/plane.png';
  }
};

// Selected Stuffs
let selectedCube = mainCube;
let selectedObject = null;
