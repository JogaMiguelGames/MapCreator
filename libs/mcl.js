// === MCL.js - Map Creator Lib ===

export const Project = {
  Name: {
    const projectName = "Project";
    const mapFileName =  `${projectName}.map`;
  }
  Icon: {
    const projectIcon = "";
  }
};

export const Object = {
  const mainCube = new THREE.Mesh(box_geometry, white_material);

  mainCube.position.set(0, 0, 0);

  mainCube.name = 'Cube 1';

  mainCube.castShadow = true;
  mainCube.receiveShadow = true;

  scene.add(mainCube);

  mainCube.userData.icon = "cube";

  const cubes = [mainCube];

  Selected: {
    let selectedCube = mainCube;
    let selectedObject = null;
  }
};

export const Page = {
  Elements: {
    Scale: {
      const X = document.getElementById('scaleX');
      const Y = document.getElementById('scaleY');
      const Z = document.getElementById('scaleZ');
    }
    Position: {
      const X = document.getElementById('posX');
      const Y = document.getElementById('posY');
      const Z = document.getElementById('posZ');
    }
    Rotation: {
      const X = document.getElementById('rotX');
      const Y = document.getElementById('rotY');
      const Z = document.getElementById('rotZ');
    }
    Add_Window: {
      Options: {
        const aW_CreateFolder = document.getElementById('aW_CreateFolder');
        const aW_CreateScript = document.getElementById('aW_CreateScript');
      }
      const Window = document.getElementById('addWindow');
      const Content = document.getElementById('addWindowContent');
    }
    Input: {
      Color: {
        const HexInput = document.getElementById('colorHex');
      }
    }
    Tree_View: {
      const Div = document.getElementById('Tree_View');
    }
  }
};

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
