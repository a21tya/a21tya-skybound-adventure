// TitleScene — the opening screen with the game name
class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Ensure the game canvas has focus so keyboard inputs work immediately
    if (this.game && this.game.canvas) {
      if (!this.game.canvas.hasAttribute('tabindex')) {
        this.game.canvas.setAttribute('tabindex', '0');
      }
      this.game.canvas.focus();
    }

    const { width, height } = this.cameras.main;

    // Sky gradient background
    this.drawBackground(width, height);

    // Decorative clouds
    this.add.image(150, 80, 'cloud').setScale(0.8).setAlpha(0.7);
    this.add.image(550, 60, 'cloud').setScale(1).setAlpha(0.6);
    this.add.image(700, 100, 'cloud').setScale(0.6).setAlpha(0.5);

    // Mountains in the distance
    this.add.image(200, height - 60, 'mountain').setScale(0.7).setOrigin(0.5, 1);
    this.add.image(600, height - 40, 'mountain').setScale(0.9).setOrigin(0.5, 1);

    // Title text
    this.add.text(width / 2, height / 2 - 60, 'Skybound Adventure', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#2c3e50',
      strokeThickness: 6,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true,
      },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2, 'A sky-high platform adventure', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '18px',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    // Blinking "press to start" prompt
    const startText = this.add.text(width / 2, height / 2 + 60, 'Press SPACE or Click to Start', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '20px',
      color: '#f1c40f',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Controls hint
    this.add.text(width / 2, height - 40, 'Arrow Keys or A/D to move  •  SPACE or W to jump  •  ESC to pause  •  L for theme', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '14px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    // Start game on space or click (clear any previous ones first)
    this.input.keyboard.off('keydown-SPACE');
    this.input.off('pointerdown');
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());
  }

  drawBackground(width, height) {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB0E0E6, 0xB0E0E6, 1);
    graphics.fillRect(0, 0, width, height);
  }

  startGame() {
    musicPlayer.start();
    // Clean up input listeners to prevent duplicates/leaks
    this.input.keyboard.off('keydown-SPACE');
    this.input.off('pointerdown');
    this.scene.start('GameScene');
  }
}
