// === Export.js - Map Creator ===
import { Project, Model, Page, Tree_View, Icon } from './mcl.js';
import {
  CreateCube,
  CreateSphere,
  CreateCylinder,
  CreateCone,
  CreatePlane,
  CreateCamera,
  CreateLight
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
      let type = 'Object';
      let color = '#ffffff';
      let textureData = null;

      if (obj.geometry === sphere_geometry) type = 'sphere';
      else if (obj.geometry === cylinder_geometry) type = 'cylinder';
      else if (obj.geometry === cone_geometry) type = 'cone';
      else if (obj.geometry === plane_geometry) type = 'plane';
      else if (obj.userData?.isCameraModel) type = 'camera';

      color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
      if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

      return {
        type,
        name: obj.name || 'Object',
        position: {
          x: obj.position?.x || 0,
          y: obj.position?.y || 0,
          z: obj.position?.z || 0
        },
        scale: {
          x: obj.scale?.x || 1,
          y: obj.scale?.y || 1,
          z: obj.scale?.z || 1
        },
        rotation: {
          x: obj.rotation?.x || 0,
          y: obj.rotation?.y || 0,
          z: obj.rotation?.z || 0
        },
        color,
        texture: textureData,
        icon: obj.userData.icon || 'cube'
      };
    })
  };

  const json = JSON.stringify(ExportData, null, 2);
  const HTML = `
  <!DOCTYPE html>
  <html lang="${Project.Lang}">
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
        canvas {
          display: block;
        }
      </style>
    </head>
    <body>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script>
        // --- Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('${ExportData.sceneColor}');

        const camera = new THREE.PerspectiveCamera(
          75,
          document.documentElement.clientWidth / document.documentElement.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        document.body.appendChild(renderer.domElement);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Ajusta o tamanho do canvas para a área visível da página
        function resizeRenderer() {
          const width = document.documentElement.clientWidth;
          const height = document.documentElement.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        resizeRenderer();
        window.addEventListener('resize', resizeRenderer);

        // --- Lights ---
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(5, 10, 5);
        scene.add(ambient, directional);

        // --- Objects (Exemplo: Cubo) ---
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00AFFF });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        scene.add(cube);

        // --- Render loop ---
        function animate() {
          requestAnimationFrame(animate);
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
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
  Export.download = \`\${Project.Name}.html\`;
  Export.click();
  URL.revokeObjectURL(Export.href);

  console.log("ExportMap(); Iniciated.");
}

window.ExportMap = ExportMap;
ExportButton?.addEventListener('click', ExportMap);
