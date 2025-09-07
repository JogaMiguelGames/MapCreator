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

// garante que o canvas fique dentro do container da cena
const sceneContainer = document.getElementById('sceneContainer') || document.body;
sceneContainer.style.position = "relative";
sceneContainer.appendChild(renderer.domElement);

// --- Texto no canto superior direito ---
(function() {
    if (!sceneContainer) return;

    const cornerText = document.createElement('div');
    cornerText.textContent = 'Map Creator 3D';
    cornerText.id = 'cornerText';

    Object.assign(cornerText.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: 'white',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '6px',
        zIndex: '10',
        pointerEvents: 'none',
    });

    sceneContainer.appendChild(cornerText);

    window.addEventListener('resize', () => {
        cornerText.style.top = '10px';
        cornerText.style.right = '10px';
    });
})();

// --- Core Tools ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();
const group = new THREE.Group();

// --- Basic Mesh (placeholder) ---
const mesh = new THREE.Mesh();

// --- Geometries (Core) ---
const box_geometry = new THREE.BoxGeometry(1, 1, 1);
const circle_geometry = new THREE.CircleGeometry(1, 32);
const cone_geometry = new THREE.ConeGeometry(1, 2, 32);
const cylinder_geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
const dodecahedron_geometry = new THREE.DodecahedronGeometry(1, 0);
const extrude_geometry = new THREE.ExtrudeGeometry([], { depth: 1, bevelEnabled: false });
const icosahedron_geometry = new THREE.IcosahedronGeometry(1, 0);
const lathe_geometry = new THREE.LatheGeometry([new THREE.Vector2(0,0), new THREE.Vector2(1,2)], 12);
const octahedron_geometry = new THREE.OctahedronGeometry(1, 0);
const plane_geometry = new THREE.PlaneGeometry(1, 1);
const ring_geometry = new THREE.RingGeometry(0.5, 1, 32);
const shape_geometry = new THREE.ShapeGeometry([]);
const sphere_geometry = new THREE.SphereGeometry(0.5, 16, 8);
const tetrahedron_geometry = new THREE.TetrahedronGeometry(1, 0);
const torus_geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
const torus_knot_geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);

// --- Geometry Helpers ---
const wireframe_geometry = new THREE.WireframeGeometry(box_geometry);
const edges_geometry = new THREE.EdgesGeometry(box_geometry);

// --- Materials ---
const white_material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const basic_material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const phong_material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const lambert_material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
const physical_material = new THREE.MeshPhysicalMaterial({ color: 0xffff00 });

// --- Lights ---
const ambient_light = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient_light);

const directional_light = new THREE.DirectionalLight(0xffffff, 1);
directional_light.position.set(5, 10, 5);
directional_light.castShadow = true;
scene.add(directional_light);

const point_light = new THREE.PointLight(0xffffff, 1, 100);
point_light.position.set(2, 5, 2);
scene.add(point_light);

const spot_light = new THREE.SpotLight(0xffffff, 1);
spot_light.position.set(0, 5, 0);
scene.add(spot_light);

const hemisphere_light = new THREE.HemisphereLight(0x4040ff, 0x404000, 0.5);
scene.add(hemisphere_light);

// --- Math / Utils ---
const v2 = new THREE.Vector2();
const v3 = new THREE.Vector3();
const v4 = new THREE.Vector4();

const euler = new THREE.Euler();
const quat = new THREE.Quaternion();
const mat4 = new THREE.Matrix4();
const box3 = new THREE.Box3();
const color = new THREE.Color('#ffffff');

// --- Animation Loop (exemplo) ---
function animate() {
    requestAnimationFrame(animate);

    // Atualiza objetos aqui, se necessário
    renderer.render(scene, camera);
}
animate();

// --- Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
