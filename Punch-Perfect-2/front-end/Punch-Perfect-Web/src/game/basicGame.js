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
      target.rotation.y += 0.05;
    });
    
    // Check for collisions with targets
    checkCollisions();
    
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );
}

function createTargets() {
  // Create 2 targets in random positions - same z-plane as hands
  for (let i = 0; i < 2; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0x330000
    });
    const target = new THREE.Mesh(geometry, material);
    
    // Random position within visible range
    const randomX = (Math.random() - 0.5) * 12; // Range: -6 to 6
    const randomY = (Math.random() - 0.5) * 6;  // Range: -3 to 3
    target.position.set(randomX, randomY, 0);
    
    target.userData.isActive = true;
    target.userData.index = i;
    scene.add(target);
    targets.push(target);
  }
}

function checkCollisions() {
  if (!leftHand || !rightHand) return;

  targets.forEach(target => {
    if (!target.userData.isActive) return;

    // Check collision with left hand (only when punching)
    if (isLeftPunching) {
      const leftDistance = leftHand.position.distanceTo(target.position);
      if (leftDistance < 1.5) { // Increased collision threshold for easier hits
        hitTarget(target);
      }
    }

    // Check collision with right hand (only when punching)
    if (isRightPunching) {
      const rightDistance = rightHand.position.distanceTo(target.position);
      if (rightDistance < 1.5) { // Increased collision threshold for easier hits
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
      // Reset the target after 2 seconds at a new random position
      setTimeout(() => {
        target.scale.copy(originalScale);
        target.material.color.setHex(0xff0000);
        target.material.emissive.setHex(0x330000);
        target.userData.isActive = true;
        
        // Randomize position when respawning
        const randomX = (Math.random() - 0.5) * 12; // Range: -6 to 6
        const randomY = (Math.random() - 0.5) * 6;  // Range: -3 to 3
        target.position.set(randomX, randomY, 0);
      }, 2000);
    }
  }, 16);
}

export function setHandPosition(x, y) {
  if (rightHand) {
    rightHand.position.x = -x * 8.5;
    rightHand.position.y = y * 3;
  }
}

export function setLeftHandPosition(x, y) {
  if (leftHand) {
    leftHand.position.x = -x * 8.5;
    leftHand.position.y = y * 3;
  }
}

export function setPunching(rightPunching, leftPunching) {
  isRightPunching = rightPunching;
  isLeftPunching = leftPunching;
  
  if (rightHand) {
    if (rightPunching) {
      rightHand.material.color.setHex(0xff8fe5); 
      rightHand.scale.set(1.5, 1.5, 1.5);
    } else {
      rightHand.material.color.setHex(0x9900ff); 
      rightHand.scale.set(1, 1, 1); 
    }
  }

  if (leftHand) {
    if (leftPunching) {
      leftHand.material.color.setHex(0xa9ff8f); 
      leftHand.scale.set(1.5, 1.5, 1.5); 
    } else {
      leftHand.material.color.setHex(0xff8800); 
      leftHand.scale.set(1, 1, 1);
    }
  }
}

export function stopBasicGame() {
  // Empty for now
}

