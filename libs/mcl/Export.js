// === Export.js - Map Creator === 
import { Project, Model, Page, Tree_View, Icon } from './mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from './add.js';

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
        position: { x: obj.position?.x || 0, y: obj.position?.y || 0, z: obj.position?.z || 0 },
        scale: { x: obj.scale?.x || 1, y: obj.scale?.y || 1, z: obj.scale?.z || 1 },
        rotation: { x: obj.rotation?.x || 0, y: obj.rotation?.y || 0, z: obj.rotation?.z || 0 },
        color,
        texture: textureData,
        icon: obj.userData.icon || "cube"
      };
    })
  };

  const json = JSON.stringify(ExportData, null, 2);
  const HTML = `
  <!DOCTYPE html>
  <html lang=${Project.Lang}>
    <head>
      <title>
        ${Project.Name}
      </title>
      <style>
        body {
          background-color: rgba(240, 240, 240, 1);
        }
        .RenderCanvas {
          background-color: rgba(255, 255, 255, 1);
        }
      </style>
    </head>
    <body>
      <canvas id="RenderCanvas" class="RenderCanvas" width="800" height="600"></canvas>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script>
        // -- Kernelium Framework -- kfw.js
        
        // --- Base Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#00AFFF');
        
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        
        // --- Core Tools ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const clock = new THREE.Clock();
        const group = new THREE.Group();
        
        // --- Basic Mesh (placeholder) ---
        const mesh = new THREE.Mesh();
        
        // --- Geometries (Core) ---
        const box_geometry = new THREE.BoxGeometry(1, 1, 1);
        const circle_geometry = new THREE.CircleGeometry(1, 16);
        const cone_geometry = new THREE.ConeGeometry(1, 2, 32);
        const pyramid_geometry = new THREE.ConeGeometry(1, 2, 4);
        const cylinder_geometry = new THREE.CylinderGeometry(1, 1, 2, 16);
        const dodecahedron_geometry = new THREE.DodecahedronGeometry(1, 0);
        const extrude_geometry = new THREE.ExtrudeGeometry([], { depth: 1, bevelEnabled: false }); // precisa de Shape
        const icosahedron_geometry = new THREE.IcosahedronGeometry(1, 0);
        const lathe_geometry = new THREE.LatheGeometry([new THREE.Vector2(0,0), new THREE.Vector2(1,2)], 12);
        const octahedron_geometry = new THREE.OctahedronGeometry(1, 0);
        const plane_geometry = new THREE.PlaneGeometry(1, 1);
        
        const ring_geometry = new THREE.RingGeometry(0.5, 1, 32);
        const shape_geometry = new THREE.ShapeGeometry([]); // precisa de Shape
        const sphere_geometry = new THREE.SphereGeometry(0.5, 16, 8);
        const tetrahedron_geometry = new THREE.TetrahedronGeometry(1, 0);
        const torus_geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
        const torus_knot_geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        
        // --- Geometry Helpers ---
        const wireframe_geometry = new THREE.WireframeGeometry(box_geometry);
        const edges_geometry = new THREE.EdgesGeometry(box_geometry);
        
        pyramid_geometry.rotateX(Math.PI / 2);
        
        // --- Geometries from examples/jsm (não fazem parte do core) ---
        // import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
        // import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
        // import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
        // import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
        
        // --- Materials ---
        const white_material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const basic_material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const phong_material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const lambert_material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        const physical_material = new THREE.MeshPhysicalMaterial({ color: 0xffff00 });
        
        // --- Lights ---
        const ambient_light = new THREE.AmbientLight(0xffffff, 0.4);
        const directional_light = new THREE.DirectionalLight(0xffffff, 1);
        directional_light.position.set(5, 10, 5);
        directional_light.castShadow = true;
        
        const point_light = new THREE.PointLight(0xffffff, 1, 100);
        point_light.position.set(2, 5, 2);
        
        const spot_light = new THREE.SpotLight(0xffffff, 1);
        spot_light.position.set(0, 5, 0);
        
        const hemisphere_light = new THREE.HemisphereLight(0x4040ff, 0x404000, 0.5);
        
        // --- Math / Utils ---
        const v2 = new THREE.Vector2();
        const v3 = new THREE.Vector3();
        const v4 = new THREE.Vector4();
        
        const euler = new THREE.Euler();
        const quat = new THREE.Quaternion();
        const mat4 = new THREE.Matrix4();
        const box3 = new THREE.Box3();
        const color = new THREE.Color('#ffffff');
      </script>
      <script>
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(2, 2, 5);
        scene.add(light);

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
  `
  const blob = new Blob([HTML], { type: 'text/html' });
  const Export = document.createElement('a');
  Export.href = URL.createObjectURL(blob);
  Export.download = `${Project.Name}.html`;
  Export.click();
  URL.revokeObjectURL(Export.href);

  console.log("ExportMap(); Iniciated.");
}

window.ExportMap = ExportMap;

ExportButton?.addEventListener('click', ExportMap);
