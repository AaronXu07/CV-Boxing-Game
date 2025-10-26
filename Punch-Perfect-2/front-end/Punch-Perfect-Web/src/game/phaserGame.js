import Phaser from 'phaser';

let game;
let leftHandSprite, rightHandSprite;
let targets = [];
let isRightPunching = false;
let isLeftPunching = false;

let targetHorizontal = 400;
let targetVertical = 200;

// ========== MOUSE CONTROL TOGGLE ==========
// Set to true to enable mouse control, false to disable
const ENABLE_MOUSE_CONTROL = true;
// ==========================================

class BoxingGame extends Phaser.Scene {
  constructor() {
    super({ key: 'BoxingGame' });
  }

  preload() {
    // No assets to preload for now
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create left hand sprite (orange circle)
    leftHandSprite = this.add.circle(200, 300, 20, 0xff6f00);
    leftHandSprite.setStrokeStyle(2, 0xffffff);

    // Create right hand sprite (purple circle)
    rightHandSprite = this.add.circle(600, 300, 20, 0x034efc);
    rightHandSprite.setStrokeStyle(2, 0xffffff);

    // Create initial targets
    this.createTargets();

    // ========== MOUSE CONTROL SETUP ==========
    if (ENABLE_MOUSE_CONTROL) {
      // Make right hand follow mouse
      this.input.on('pointermove', (pointer) => {
        if (rightHandSprite) {
          rightHandSprite.x = pointer.x;
          rightHandSprite.y = pointer.y;
        }
      });

      // Mouse click = punch
      this.input.on('pointerdown', () => {
        isRightPunching = true;
        if (rightHandSprite) {
          rightHandSprite.setFillStyle(0xff00ff); // Magenta when punching
          rightHandSprite.setRadius(30); // Bigger when punching
        }
      });

      this.input.on('pointerup', () => {
        isRightPunching = false;
        if (rightHandSprite) {
          rightHandSprite.setFillStyle(0x034efc); // Purple normal
          rightHandSprite.setRadius(20); // Normal size
        }
      });
    }
    // ==========================================
  }

  createTargets() {
    // Create 2 targets at random positions
    for (let i = 0; i < 2; i++) {
      const gameWidth = this.cameras.main.width;
      const gameHeight = this.cameras.main.height;
      
      const x = Phaser.Math.Between(targetHorizontal, gameWidth - targetHorizontal);
      const y = Phaser.Math.Between(targetVertical, gameHeight - targetVertical);
      
      // Create a container for the bullseye target
      const targetContainer = this.add.container(x, y);
      
      // Outer red circle (increased from 60 to 80)
      const outerCircle = this.add.circle(0, 0, 80, 0xff0000);
      outerCircle.setStrokeStyle(4, 0x000000);
      
      // White circle (increased from 45 to 60)
      const whiteCircle = this.add.circle(0, 0, 60, 0xffffff);
      
      // Blue circle (increased from 30 to 40)
      const blueCircle = this.add.circle(0, 0, 40, 0x0066ff);
      
      // Red center (bullseye) (increased from 15 to 20)
      const centerCircle = this.add.circle(0, 0, 20, 0xff0000);
      
      // Add all circles to container
      targetContainer.add([outerCircle, whiteCircle, blueCircle, centerCircle]);
      
      // Store properties on container
      targetContainer.isActive = true;
      targetContainer.setData('rotation', 0);
      
      targets.push(targetContainer);
    }
  }

  update() {
    // Rotate targets
    targets.forEach(target => {
      if (target.active) {
        const rotation = target.getData('rotation') + 0.01;
        target.setData('rotation', rotation);
        target.setRotation(rotation);
      }
    });

    // Check for collisions
    this.checkCollisions();
  }

  checkCollisions() {
    targets.forEach(target => {
      if (!target.isActive) return;

      // Check left hand collision
      if (isLeftPunching) {
        const leftDistance = Phaser.Math.Distance.Between(
          leftHandSprite.x, leftHandSprite.y,
          target.x, target.y
        );
        if (leftDistance < 80) { // Updated from 60 to 80 to match larger target
          this.hitTarget(target);
        }
      }

      // Check right hand collision
      if (isRightPunching) {
        const rightDistance = Phaser.Math.Distance.Between(
          rightHandSprite.x, rightHandSprite.y,
          target.x, target.y
        );
        if (rightDistance < 80) { // Updated from 60 to 80 to match larger target
          this.hitTarget(target);
        }
      }
    });
  }

  hitTarget(target) {
    if (!target.isActive) return;

    target.isActive = false;

    // Store original position for particle effects
    const hitX = target.x;
    const hitY = target.y;

    // Create breaking pieces (arc fragments for bullseye)
    const fragmentCount = 16;
    const fragments = [];
    const colors = [0xff0000, 0xffffff, 0x0066ff, 0xff0000]; // Target colors
    
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (Math.PI * 2 * i) / fragmentCount;
      
      // Create arc-shaped fragments (pieces of the rings)
      const fragment = this.add.circle(
        hitX,
        hitY,
        Phaser.Math.Between(10, 25),
        colors[i % colors.length]
      );
      fragment.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      fragments.push(fragment);

      // Animate each fragment flying outward
      this.tweens.add({
        targets: fragment,
        x: hitX + Math.cos(angle) * Phaser.Math.Between(100, 180),
        y: hitY + Math.sin(angle) * Phaser.Math.Between(100, 180) + Phaser.Math.Between(50, 100), // Add gravity effect
        rotation: fragment.rotation + Phaser.Math.FloatBetween(-3, 3),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(500, 800),
        ease: 'Cubic.easeOut',
        onComplete: () => {
          fragment.destroy();
        }
      });
    }

    // Create flash effect
    const flash = this.add.circle(hitX, hitY, 80, 0x00ff00, 0.8);
    this.tweens.add({
      targets: flash,
      radius: 150,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    // Add ring shockwave effect
    const shockwave = this.add.circle(hitX, hitY, 60, 0xffffff, 0);
    shockwave.setStrokeStyle(4, 0xffff00, 1);
    this.tweens.add({
      targets: shockwave,
      radius: 120,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        shockwave.destroy();
      }
    });

    // Make original target invisible
    target.setAlpha(0);

    // Wait then respawn at random position
    this.time.delayedCall(2000, () => {
      const gameWidth = this.cameras.main.width;
      const gameHeight = this.cameras.main.height;
      
      target.x = Phaser.Math.Between(targetHorizontal, gameWidth - targetHorizontal);
      target.y = Phaser.Math.Between(targetVertical, gameHeight - targetVertical);
      target.setScale(1);
      target.setAlpha(1);
      target.isActive = true;
    });
  }
}

export function initPhaserGame(container, width, height) {
  const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: container,
    scene: BoxingGame,
    backgroundColor: '#1a1a2e'
  };

  game = new Phaser.Game(config);
}

export function setRightHandPosition(x, y) {
  if (rightHandSprite && game) {
    // x and y are normalized (0-1), convert directly to screen coordinates
    // Flip x for mirrored camera
    const screenX = (1 - x) * game.config.width;
    const screenY = y * game.config.height;
    rightHandSprite.x = screenX;
    rightHandSprite.y = screenY;
  }
}

export function setLeftHandPosition(x, y) {
  if (leftHandSprite && game) {
    // x and y are normalized (0-1), convert directly to screen coordinates
    // Flip x for mirrored camera
    const screenX = (1 - x) * game.config.width;
    const screenY = y * game.config.height;
    leftHandSprite.x = screenX;
    leftHandSprite.y = screenY;
  }
}

export function setPunching(rightPunching, leftPunching) {
  isRightPunching = rightPunching;
  isLeftPunching = leftPunching;

  // Change right hand color and size when punching
  if (rightHandSprite) {
    if (rightPunching) {
      rightHandSprite.setFillStyle(0x35fc03); // Green
      rightHandSprite.setRadius(35); // Bigger when punching
    } else {
      rightHandSprite.setFillStyle(0x034efc); // Blue normal
      rightHandSprite.setRadius(20); // Normal size
    }
  }

  // Change left hand color and size when punching
  if (leftHandSprite) {
    if (leftPunching) {
      leftHandSprite.setFillStyle(0x35fc03); // Green
      leftHandSprite.setRadius(35); // Bigger when punching
    } else {
      leftHandSprite.setFillStyle(0xff6f00); // Orange normal
      leftHandSprite.setRadius(20); // Normal size
    }
  }
}

export function stopPhaserGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
