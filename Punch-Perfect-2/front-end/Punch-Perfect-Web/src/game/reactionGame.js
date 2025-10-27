import Phaser from 'phaser';

let game;
let screenRect;
let instructionText;
let reactionTimeText;
let replayButton;
let waitingForGreen = false;
let greenStartTime = 0;
let isRightPunching = false;
let isLeftPunching = false;
let gameState = 'waiting'; // 'waiting', 'ready', 'green', 'finished'
let punchCooldown = false; // Prevents punch detection during cooldown
let lastPunchDetected = false; // Tracks previous punch state for edge detection
let currentDelayTimer = null; // Reference to the current delay timer

class ReactionGame extends Phaser.Scene {
  constructor() {
    super({ key: 'ReactionGame' });
  }

  preload() {
    // No assets to preload
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create full screen rectangle (starts red)
    screenRect = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000);

    // Instruction text
    instructionText = this.add.text(width / 2, height / 2, 'Wait for GREEN...', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    });
    instructionText.setOrigin(0.5);

    // Reaction time text (hidden initially)
    reactionTimeText = this.add.text(width / 2, height / 2 + 80, '', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    });
    reactionTimeText.setOrigin(0.5);
    reactionTimeText.setVisible(false);

    // Replay button (hidden initially)
    replayButton = this.add.text(width / 2, height / 2 + 150, 'REPLAY', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    replayButton.setOrigin(0.5);
    replayButton.setInteractive({ useHandCursor: true });
    replayButton.on('pointerdown', () => this.restartGame());
    replayButton.setVisible(false);

    // Start the game after a short delay
    this.time.delayedCall(1000, () => this.startReactionTest());
  }

  startReactionTest() {
    gameState = 'ready';
    screenRect.setFillStyle(0xff0000);
    instructionText.setText('Wait for GREEN...');
    reactionTimeText.setVisible(false);
    replayButton.setVisible(false);

    // Cancel any existing delay timer
    if (currentDelayTimer) {
      currentDelayTimer.remove();
      currentDelayTimer = null;
    }

    // Random delay between 2-5 seconds before turning green
    const randomDelay = Phaser.Math.Between(2000, 5000);
    
    currentDelayTimer = this.time.delayedCall(randomDelay, () => {
      if (gameState === 'ready') { // Check if user didn't punch early
        this.turnGreen();
      }
      currentDelayTimer = null;
    });
  }

  turnGreen() {
    gameState = 'green';
    screenRect.setFillStyle(0x00ff00);
    instructionText.setText('PUNCH NOW!');
    greenStartTime = Date.now();
    waitingForGreen = true;
  }

  update() {
    // Detect punch edge (only trigger on new punch, not held punch)
    const isPunching = isRightPunching || isLeftPunching;
    const punchJustStarted = isPunching && !lastPunchDetected;
    
    // Don't update lastPunchDetected during cooldown to prevent edge detection
    if (!punchCooldown) {
      lastPunchDetected = isPunching;
    }

    // Check if player punched during green screen (no cooldown here)
    if (gameState === 'green' && waitingForGreen && punchJustStarted) {
      this.recordReactionTime();
      return; // Exit to prevent multiple triggers
    }

    // Check for early punch (punching before green) (no cooldown here)
    if (gameState === 'ready' && punchJustStarted && !punchCooldown) {
      this.earlyPunch();
      return; // Exit to prevent multiple triggers
    }

    // Ignore punches during cooldown ONLY for restart
    if (punchCooldown) {
      return;
    }

    // Check if player punched to restart after finished state
    if (gameState === 'finished' && punchJustStarted) {
      this.restartGame();
    }
  }

  recordReactionTime() {
    waitingForGreen = false;
    gameState = 'finished';
    const reactionTime = Date.now() - greenStartTime;
    
    screenRect.setFillStyle(0x0066ff); // Blue for success
    instructionText.setText('Great!');
    reactionTimeText.setText(`Reaction Time: ${reactionTime} ms\n\nPunch anywhere to restart`);
    reactionTimeText.setVisible(true);
    replayButton.setVisible(false); // Hide the button

    // Enable punch cooldown to prevent immediate restart
    punchCooldown = true;
    this.time.delayedCall(500, () => {
      punchCooldown = false;
    });
  }

  earlyPunch() {
    gameState = 'finished';
    waitingForGreen = false;
    
    screenRect.setFillStyle(0xff6600); // Orange for early punch
    instructionText.setText('Too Early!');
    reactionTimeText.setText('Wait for the green screen\n\nPunch anywhere to restart');
    reactionTimeText.setVisible(true);
    replayButton.setVisible(false); // Hide the button

    // Enable punch cooldown to prevent immediate restart
    punchCooldown = true;
    this.time.delayedCall(500, () => {
      punchCooldown = false;
    });
  }

  restartGame() {
    // Activate cooldown immediately when restarting
    punchCooldown = true;
    
    this.startReactionTest();
    
    // Clear cooldown after 500ms
    this.time.delayedCall(500, () => {
      punchCooldown = false;
    });
  }
}

export function initReactionGame(container, width, height) {
  const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: container,
    scene: ReactionGame,
    backgroundColor: '#1a1a2e'
  };

  game = new Phaser.Game(config);
}

export function setPunchingReaction(rightPunching, leftPunching) {
  isRightPunching = rightPunching;
  isLeftPunching = leftPunching;
}

export function stopReactionGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
