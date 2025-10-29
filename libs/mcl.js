// === MCL.js - Map Creator Lib ===

export const Project = {
  Name: "Project",
  File: {
    Name: {
      Map: null
    }
  }
  Icon: {
    Project_Icon: "";
  }
};

export const Model = {
  const Object = new THREE.Mesh(box_geometry, white_material);

  Object.position.set(0, 0, 0);

  Object.name = 'Cube 1';

  Object.castShadow = true;
  Object.receiveShadow = true;

  scene.add(Object);

  Object.userData.icon = "cube";

  const Objects = [Object];

  Selected: {
    let Selected_Object = Main_Cube;
    let Selected_Item = null;
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
        Create: {
          const Folder = document.getElementById('aW_CreateFolder');
          const Script = document.getElementById('aW_CreateScript');
        }
      }
      const Window = document.getElementById('addWindow');
      const Content = document.getElementById('addWindowContent');
    }
    Input: {
      Color: {
        const Hex_Input = document.getElementById('colorHex');
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

Project.File.Name.Map = `${Project.Name}.map`;
