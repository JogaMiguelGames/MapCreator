// === MCL.js - Map Creator Lib ===

export const Project = {
  Name: "Project",
  File: {
    Name: {
      Map: null
    }
  },
  Icon: {
    Project_Icon: ""
  }
};

export const Model = (() => {
  const Object3D = new THREE.Mesh(box_geometry, white_material);
  Object3D.position.set(0, 0, 0);
  Object3D.name = 'Cube 1';
  Object3D.castShadow = true;
  Object3D.receiveShadow = true;
  Object3D.userData.icon = "cube";

  scene.add(Object3D);

  const Objects = [Object3D];

  const Selected = {
    Object: Object3D,
  };

  return {
    Object3D,
    Objects,
    Selected
  };
})();

export const Page = {
  Elements: {
    Scale: {
      X: document.getElementById('scaleX'),
      Y: document.getElementById('scaleY'),
      Z: document.getElementById('scaleZ')
    },
    Position: {
      X: document.getElementById('posX'),
      Y: document.getElementById('posY'),
      Z: document.getElementById('posZ')
    },
    Rotation: {
      X: document.getElementById('rotX'),
      Y: document.getElementById('rotY'),
      Z: document.getElementById('rotZ')
    },
    Script: {
      Input: document.getElementById('scriptInput')
    },
    Add_Window: {
      Options: {
        Create: {
          Folder: document.getElementById('aW_CreateFolder'),
          Script: document.getElementById('aW_CreateScript')
        }
      },
      Window: document.getElementById('addWindow'),
      Content: document.getElementById('addWindowContent')
    },
    Input: {
      Color: {
        Hex_Input: document.getElementById('colorHex')
      }
    },
    Tree_View: {
      Div: document.getElementById('Tree_View')
    }
  }
};

export const Tree_View = {
  Selected: {
    Item: null
  }
};

export const Icon = {
  SVG: {
    Folder: 'resources/images/ui/icons/folder.svg',
    KS_Script: 'resources/images/ui/icons/kerneliumScript_File.svg',
    
    Cube: 'resources/images/ui/icons/cube.svg',
    Sphere: 'resources/images/ui/icons/sphere.svg'
  },
  
  PNG: {
    Cube: 'resources/images/ui/icons/cube.png',
    Sphere: 'resources/images/ui/icons/sphere.png',
    Cylinder: 'resources/images/ui/icons/cylinder.png',
    Cone: 'resources/images/ui/icons/cone.png',
    Plane: 'resources/images/ui/icons/plane.png'
  }
};

Project.File.Name.Map = `${Project.Name}.map`;
