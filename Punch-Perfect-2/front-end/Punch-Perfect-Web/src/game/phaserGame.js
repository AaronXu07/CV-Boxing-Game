import Phaser from 'phaser';

let game;
let leftHandSprite, rightHandSprite;
let targets = [];
let isRightPunching = false;
let isLeftPunching = false;

let targetHorizontal = 400;
let targetVertical = 200;

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
  }

  createTargets() {
    // Create 2 targets at random positions
    for (let i = 0; i < 2; i++) {
      const gameWidth = this.cameras.main.width;
      const gameHeight = this.cameras.main.height;
      
      const x = Phaser.Math.Between(targetHorizontal, gameWidth - targetHorizontal);
      const y = Phaser.Math.Between(targetVertical, gameHeight - targetVertical);
      
      const target = this.add.rectangle(x, y, 120, 120, 0xff0000);
      target.setStrokeStyle(4, 0xff6666);
      target.isActive = true;
      target.setData('rotation', 0);
      
      targets.push(target);
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
        if (leftDistance < 60) {
          this.hitTarget(target);
        }
      }

      // Check right hand collision
      if (isRightPunching) {
        const rightDistance = Phaser.Math.Distance.Between(
          rightHandSprite.x, rightHandSprite.y,
          target.x, target.y
        );
        if (rightDistance < 60) {
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

    // Create breaking pieces (fragments)
    const fragmentCount = 12;
    const fragments = [];
    
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (Math.PI * 2 * i) / fragmentCount;
      const distance = Phaser.Math.Between(20, 40);
      
      const fragment = this.add.rectangle(
        hitX,
        hitY,
        Phaser.Math.Between(15, 30),
        Phaser.Math.Between(15, 30),
        0xff0000
      );
      fragment.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      fragments.push(fragment);

      // Animate each fragment flying outward
      this.tweens.add({
        targets: fragment,
        x: hitX + Math.cos(angle) * Phaser.Math.Between(80, 150),
        y: hitY + Math.sin(angle) * Phaser.Math.Between(80, 150) + Phaser.Math.Between(50, 100), // Add gravity effect
        rotation: fragment.rotation + Phaser.Math.FloatBetween(-2, 2),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(400, 700),
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

    // Make original target invisible and shrink
    target.setAlpha(0);

    // Wait then respawn at random position
    this.time.delayedCall(2000, () => {
      const gameWidth = this.cameras.main.width;
      const gameHeight = this.cameras.main.height;
      
      target.x = Phaser.Math.Between(targetHorizontal, gameWidth - targetHorizontal);
      target.y = Phaser.Math.Between(targetVertical, gameHeight - targetVertical);
      target.setScale(1);
      target.setAlpha(1);
      target.setFillStyle(0xff0000);
      target.setStrokeStyle(4, 0xff6666);
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
