// === Export.js - Map Creator ===
import { Project, Model, Page, Tree_View, Icon } from './mcl.js';
import {
  CreateCube,
  CreateSphere,
  CreateCylinder,
  CreateCone,
  CreatePlane,
  CreateCamera,
  CreateLight,
  CamPosX,
  CamPosY,
  CamPosZ,
  CamRotX,
  CamRotY,
  CamRotZ
} from './add.js';

export const ExportButton = document.getElementById('ExportButton');

export function ExportMap() {
  const scriptInput = document.getElementById('scriptInput');
  const scriptCode = scriptInput ? scriptInput.value : '';

  if (window.Tree_View?.Selected?.Item && window.Tree_View.Selected.Item.content !== undefined) {
    window.Tree_View.Selected.Item.content = scriptCode;
  }

  const ExportData = {
    sceneColor: `#${scene.background.getHexString()}`,
    customFolders: window.customFolders || [],
    customScripts: (window.customScripts || []).map(s => ({
      id: s.id,
      name: s.name,
      content: s.content || ''
    })),
    Objects: Model.Objects.map(obj => {
      let type = 'cube';
      if (obj.geometry === sphere_geometry) type = 'sphere';
      else if (obj.geometry === cylinder_geometry) type = 'cylinder';
      else if (obj.geometry === cone_geometry) type = 'cone';
      else if (obj.geometry === plane_geometry) type = 'plane';
      else if (obj.userData?.isCameraModel) type = 'camera';

      const color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
      const textureData = obj.material?.map?.image?.src || null;

      return {
        type,
        name: obj.name || 'Object',
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        color,
        texture: textureData,
        icon: obj.userData.icon || 'cube'
      };
    })
  };

  const HtmlLangs = {
    English: "en",
      
    EnglishOfUnitedKingdom: "en-GB",
    EnglishOfUsa: "en-US",
    EnglishOfCanada: "en-CA",
    EnglishOfAustralia: "en-AU",
    
    Spanish: "es",
    
    SpanishOfSpain: "es-ES",
    SpanishOfMexico: "es-MX",
    SpanishOfArgentina: "es-AR",
    
    Portuguese: "pt",
    
    PortugueseOfPortugal: "pt-PT",
    PortugueseOfBrazil: "pt-BR"
  }

  let PageLang = HtmlLangs[Project.Language] || "en";

  const json = JSON.stringify(ExportData);

  const HTML = `
  <!DOCTYPE html>
  <html lang="${PageLang}">
    <head>
      <meta charset="UTF-8">
      <title>${Project.Name}</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: rgba(240, 240, 240, 1);
        }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script>
        let YCamPoint = CamPosY -90;
        // --- Map Data ---
        const mapData = ${json};

        // --- Setup Scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(mapData.sceneColor);

        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        camera.position.set(${CamPosX}, ${CamPosY}, ${CamPosZ});
        camera.rotation.set(${CamRotX}, ${YCamPoint}, ${CamRotZ});

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(innerWidth, innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
          renderer.setSize(innerWidth, innerHeight);
          camera.aspect = innerWidth / innerHeight;
          camera.updateProjectionMatrix();
        });

        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(5, 10, 5);
        scene.add(ambient, directional);

        // --- Geometries ---
        const box_geometry = new THREE.BoxGeometry(1, 1, 1);
        const sphere_geometry = new THREE.SphereGeometry(0.5, 16, 8);
        const cylinder_geometry = new THREE.CylinderGeometry(1, 1, 2, 16);
        const cone_geometry = new THREE.ConeGeometry(1, 2, 32);
        const plane_geometry = new THREE.PlaneGeometry(1, 1);

        // --- Load Objects ---
        const textureLoader = new THREE.TextureLoader();

        mapData.Objects.forEach(data => {
          let geometry;
          switch (data.type) {
            case 'sphere': geometry = sphere_geometry; break;
            case 'cylinder': geometry = cylinder_geometry; break;
            case 'cone': geometry = cone_geometry; break;
            case 'plane': geometry = plane_geometry; break;
            default: geometry = box_geometry;
          }

          const material = new THREE.MeshStandardMaterial({ color: data.color || '#ffffff' });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(data.position.x, data.position.y, data.position.z);
          mesh.scale.set(data.scale.x, data.scale.y, data.scale.z);
          mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (data.texture) {
            const tex = textureLoader.load(data.texture);
            mesh.material.map = tex;
            mesh.material.needsUpdate = true;
          }

          scene.add(mesh);
        });

        // --- Animate ---
        function animate() {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        }
        animate();
      </script>
    </body>
  </html>
  `;

  const blob = new Blob([HTML], { type: 'text/html' });
  const Export = document.createElement('a');
  Export.href = URL.createObjectURL(blob);
  Export.download = `${Project.Name}.html`;
  Export.click();
  URL.revokeObjectURL(Export.href);

  console.log("ExportMap(); completed and exported.");
}

window.ExportMap = ExportMap;
ExportButton?.addEventListener('click', ExportMap);
