import * as THREE from 'three';

let leftHand, rightHand, scene, renderer, camera;
let targets = [];
let isRightPunching = false;
let isLeftPunching = false;

export function initBasicGame(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( container.clientWidth, container.clientHeight );
  container.appendChild( renderer.domElement );

  // Add lighting from behind the camera
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(0, 2, 5); // Behind and slightly above camera
  scene.add(mainLight);
  
  // Add a fill light from the side for better depth
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-3, 0, 3);
  scene.add(fillLight);
  
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Create left hand sphere (orange)
  const leftHandGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 }); // Orange
  leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
  leftHand.position.set(-1, 0, 0);
  scene.add(leftHand);

  // Create right hand sphere (purple)
  const rightHandGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0x9900ff }); // Purple
  rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
  rightHand.position.set(1, 0, 0);
  scene.add(rightHand);

  // Create punchable targets
  createTargets();

  camera.position.z = 5;

  function animate() {
    // Rotate targets slightly for visual effect
    targets.forEach(target => {
      target.rotation.y += 0.01;
    });
    
    // Check for collisions with targets
    checkCollisions();
    
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );
}

function createTargets() {
  // Create 4 targets in different positions - same z-plane as hands
  const targetPositions = [
    { x: -4, y: 2, z: 0 },
    { x: 4, y: 2, z: 0 },
    { x: -4, y: -2, z: 0 },
    { x: 4, y: -2, z: 0 }
  ];

  targetPositions.forEach((pos, index) => {
    const geometry = new THREE.BoxGeometry(1, 1, 0.5);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0x330000
    });
    const target = new THREE.Mesh(geometry, material);
    target.position.set(pos.x, pos.y, pos.z);
    target.userData.isActive = true;
    target.userData.index = index;
    scene.add(target);
    targets.push(target);
  });
}

function checkCollisions() {
  if (!leftHand || !rightHand) return;

  targets.forEach(target => {
    if (!target.userData.isActive) return;

    // Check collision with left hand (only when punching)
    if (isLeftPunching) {
      const leftDistance = leftHand.position.distanceTo(target.position);
      if (leftDistance < 2.0) { // Increased collision threshold for easier hits
        hitTarget(target);
      }
    }

    // Check collision with right hand (only when punching)
    if (isRightPunching) {
      const rightDistance = rightHand.position.distanceTo(target.position);
      if (rightDistance < 2.0) { // Increased collision threshold for easier hits
        hitTarget(target);
      }
    }
  });
}

function hitTarget(target) {
  if (!target.userData.isActive) return;
  
  target.userData.isActive = false;
  
  // Visual feedback - make it flash green and shrink
  target.material.color.setHex(0x00ff00);
  target.material.emissive.setHex(0x00ff00);
  
  // Animate the target disappearing
  const originalScale = target.scale.clone();
  let shrinkProgress = 0;
  
  const shrinkInterval = setInterval(() => {
    shrinkProgress += 0.05;
    const scale = 1 - shrinkProgress;
    target.scale.set(originalScale.x * scale, originalScale.y * scale, originalScale.z * scale);
    
    if (shrinkProgress >= 1) {
      clearInterval(shrinkInterval);
      // Reset the target after 2 seconds
      setTimeout(() => {
        target.scale.copy(originalScale);
        target.material.color.setHex(0xff0000);
        target.material.emissive.setHex(0x330000);
        target.userData.isActive = true;
      }, 2000);
    }
  }, 16);
}

export function setHandPosition(x, y) {
  if (rightHand) {
    // Invert x to match mirrored camera, scale for better visibility
    rightHand.position.x = -x * 8;
    rightHand.position.y = y * 3;
  }
}

export function setLeftHandPosition(x, y) {
  if (leftHand) {
    // Invert x to match mirrored camera, scale for better visibility
    leftHand.position.x = -x * 8;
    leftHand.position.y = y * 3;
  }
}

export function setPunching(rightPunching, leftPunching) {
  // Store punching state for collision detection
  isRightPunching = rightPunching;
  isLeftPunching = leftPunching;
  
  // Change right hand color when punching
  if (rightHand) {
    if (rightPunching) {
      rightHand.material.color.setHex(0xff00ff); // Bright magenta when punching
    } else {
      rightHand.material.color.setHex(0x9900ff); // Purple normal
    }
  }

  // Change left hand color when punching
  if (leftHand) {
    if (leftPunching) {
      leftHand.material.color.setHex(0xffff00); // Bright yellow when punching
    } else {
      leftHand.material.color.setHex(0xff8800); // Orange normal
    }
  }
}

export function stopBasicGame() {
  // Empty for now
}

