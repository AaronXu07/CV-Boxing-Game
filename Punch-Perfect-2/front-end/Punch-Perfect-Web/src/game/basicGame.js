import * as THREE from 'three';

let scene, camera, renderer;
let cube;
let animationId;

export function initBasicGame(container) {
  console.log('Initializing basic game...');
  console.log('Container dimensions:', container.clientWidth, container.clientHeight);
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  console.log('Renderer canvas added to container');

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Create a rotating cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  console.log('Cube created and added to scene');

  // Handle window resize
  window.addEventListener('resize', () => {
    if (container.clientWidth && container.clientHeight) {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
  });

  // Start animation
  animate();
  console.log('Animation started');
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Rotate the cube
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

export function stopBasicGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}
