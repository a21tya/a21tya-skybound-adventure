// BootScene runs first — it draws all our placeholder art before the game starts
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Nothing to load from files — we draw everything ourselves below
  }

  create() {
    this.createPlayerTexture();
    this.createPlatformTexture();
    this.createGrassTexture();
    this.createTreeTexture();
    this.createCloudTexture();
    this.createMountainTexture();
    this.createCoinTexture();
    this.createEnemyTexture();
    this.createRoboVariantTextures();
    this.createPowerUpTextures();
    this.createProjectileTexture();
    this.createGroundTexture();
    this.createDotTexture();

    // Move to the title screen
    this.scene.start('TitleScene');
  }

  // Our hero: "Aero" — a small sky adventurer with a cape
  createPlayerTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 32;
    const h = 40;

    // Cape (flows behind)
    graphics.fillStyle(0xe74c3c);
    graphics.fillTriangle(8, 18, 24, 18, 16, 32);

    // Body
    graphics.fillStyle(0x3498db);
    graphics.fillRoundedRect(10, 14, 12, 16, 3);

    // Head
    graphics.fillStyle(0xf5cba7);
    graphics.fillCircle(16, 10, 8);

    // Goggles
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(13, 9, 3);
    graphics.fillCircle(19, 9, 3);
    graphics.fillStyle(0x85c1e9);
    graphics.fillCircle(13, 9, 1.5);
    graphics.fillCircle(19, 9, 1.5);

    // Boots
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(10, 28, 5, 6);
    graphics.fillRect(17, 28, 5, 6);

    graphics.generateTexture('player', w, h);
    graphics.destroy();
  }

  createPlatformTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const width = 80;

    // Dirt base
    graphics.fillStyle(0x8B6914);
    graphics.fillRect(0, 8, width, 16);

    // Grass top
    graphics.fillStyle(0x4CAF50);
    graphics.fillRect(0, 0, width, 10);

    // Grass blades
    graphics.fillStyle(0x66BB6A);
    for (let i = 4; i < width; i += 8) {
      graphics.fillTriangle(i, 0, i + 3, 0, i + 1.5, -4);
    }

    graphics.generateTexture('platform', width, 24);
    graphics.destroy();
  }

  createGrassTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x4CAF50);
    graphics.fillRect(0, 12, 16, 4);
    graphics.fillStyle(0x66BB6A);
    graphics.fillTriangle(4, 12, 8, 12, 6, 6);
    graphics.fillTriangle(10, 12, 14, 12, 12, 8);
    graphics.generateTexture('grass', 16, 16);
    graphics.destroy();
  }

  createTreeTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Trunk
    graphics.fillStyle(0x6D4C41);
    graphics.fillRect(22, 50, 12, 30);

    // Foliage layers
    graphics.fillStyle(0x2E7D32);
    graphics.fillCircle(28, 40, 22);
    graphics.fillStyle(0x388E3C);
    graphics.fillCircle(20, 32, 16);
    graphics.fillCircle(36, 32, 16);
    graphics.fillStyle(0x43A047);
    graphics.fillCircle(28, 24, 14);

    graphics.generateTexture('tree', 56, 80);
    graphics.destroy();
  }

  createCloudTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFFFFFF, 0.85);
    graphics.fillCircle(30, 30, 20);
    graphics.fillCircle(55, 28, 25);
    graphics.fillCircle(80, 30, 20);
    graphics.fillCircle(45, 20, 18);
    graphics.fillCircle(65, 18, 16);
    graphics.generateTexture('cloud', 110, 50);
    graphics.destroy();
  }

  createMountainTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Back mountain (darker)
    graphics.fillStyle(0x5D6D7E);
    graphics.fillTriangle(0, 120, 100, 20, 200, 120);

    // Snow cap
    graphics.fillStyle(0xECF0F1);
    graphics.fillTriangle(85, 35, 100, 20, 115, 35);

    // Front mountain
    graphics.fillStyle(0x7F8C8D);
    graphics.fillTriangle(120, 120, 220, 40, 320, 120);
    graphics.fillStyle(0xECF0F1);
    graphics.fillTriangle(205, 55, 220, 40, 235, 55);

    graphics.generateTexture('mountain', 320, 120);
    graphics.destroy();
  }

  createCoinTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(12, 12, 10);
    graphics.fillStyle(0xFFA000);
    graphics.fillCircle(12, 12, 7);
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(12, 12, 5);

    // Shine
    graphics.fillStyle(0xFFF9C4);
    graphics.fillCircle(9, 9, 2);

    graphics.generateTexture('coin', 24, 24);
    graphics.destroy();
  }

  // "Robo" — a grumpy purple patrol enemy
  createEnemyTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Body
    graphics.fillStyle(0x9B59B6);
    graphics.fillEllipse(20, 22, 32, 28);

    // Angry eyes
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(12, 18, 5);
    graphics.fillCircle(28, 18, 5);
    graphics.fillStyle(0x2C3E50);
    graphics.fillCircle(13, 18, 3);
    graphics.fillCircle(29, 18, 3);

    // Frown
    graphics.lineStyle(2, 0x6C3483);
    graphics.beginPath();
    graphics.arc(20, 26, 6, 0.2, Math.PI - 0.2, false);
    graphics.strokePath();

    // Little feet
    graphics.fillStyle(0x7D3C98);
    graphics.fillEllipse(12, 34, 8, 4);
    graphics.fillEllipse(28, 34, 8, 4);

    graphics.generateTexture('enemy', 40, 38);
    graphics.destroy();
  }

  // FEATURE: distinct Robo variants (fast, jumper, shooter)
  createRoboVariantTextures() {
    this.createRoboFastTexture();
    this.createRoboJumperTexture();
    this.createRoboShooterTexture();
  }

  createRoboFastTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xe74c3c);
    graphics.fillEllipse(20, 22, 34, 28);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(12, 18, 5);
    graphics.fillCircle(28, 18, 5);
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(14, 18, 2);
    graphics.fillCircle(30, 18, 2);
    // Speed streaks
    graphics.fillStyle(0xffcdd2);
    graphics.fillTriangle(2, 20, 10, 18, 2, 26);
    graphics.fillTriangle(2, 28, 10, 26, 2, 34);
    graphics.fillStyle(0xc0392b);
    graphics.fillEllipse(12, 34, 8, 4);
    graphics.fillEllipse(28, 34, 8, 4);
    graphics.generateTexture('robo-fast', 40, 38);
    graphics.destroy();
  }

  createRoboJumperTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2ecc71);
    graphics.fillEllipse(20, 22, 32, 28);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(12, 18, 5);
    graphics.fillCircle(28, 18, 5);
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(13, 17, 3);
    graphics.fillCircle(29, 17, 3);
    // Spring legs
    graphics.lineStyle(3, 0x27ae60);
    graphics.beginPath();
    graphics.moveTo(10, 30);
    graphics.lineTo(8, 36);
    graphics.lineTo(12, 36);
    graphics.strokePath();
    graphics.beginPath();
    graphics.moveTo(30, 30);
    graphics.lineTo(28, 36);
    graphics.lineTo(32, 36);
    graphics.strokePath();
    graphics.generateTexture('robo-jumper', 40, 38);
    graphics.destroy();
  }

  createRoboShooterTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xf39c12);
    graphics.fillEllipse(20, 22, 32, 28);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(12, 18, 5);
    graphics.fillCircle(28, 18, 5);
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(13, 18, 3);
    graphics.fillCircle(29, 18, 3);
    // Cannon arm
    graphics.fillStyle(0x7f8c8d);
    graphics.fillRect(32, 20, 10, 6);
    graphics.fillStyle(0xe67e22);
    graphics.fillCircle(42, 23, 4);
    graphics.fillStyle(0xd35400);
    graphics.fillEllipse(12, 34, 8, 4);
    graphics.fillEllipse(28, 34, 8, 4);
    graphics.generateTexture('robo-shooter', 48, 38);
    graphics.destroy();
  }

  // FEATURE: collectible power-up item textures
  createPowerUpTextures() {
    const speedGfx = this.make.graphics({ x: 0, y: 0, add: false });
    speedGfx.fillStyle(0xff9800, 0.3);
    speedGfx.fillCircle(14, 14, 14);
    speedGfx.fillStyle(0xffd54f);
    speedGfx.fillTriangle(14, 4, 22, 20, 6, 20);
    speedGfx.fillStyle(0xfff176);
    speedGfx.fillRect(12, 10, 4, 10);
    speedGfx.generateTexture('powerup-speed', 28, 28);
    speedGfx.destroy();

    const shieldGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shieldGfx.fillStyle(0x29b6f6, 0.3);
    shieldGfx.fillCircle(14, 14, 14);
    shieldGfx.fillStyle(0x4fc3f7);
    shieldGfx.fillCircle(14, 14, 10);
    shieldGfx.lineStyle(3, 0xb3e5fc);
    shieldGfx.strokeCircle(14, 14, 10);
    shieldGfx.fillStyle(0xe1f5fe);
    shieldGfx.fillTriangle(14, 6, 18, 14, 14, 20);
    shieldGfx.fillTriangle(14, 6, 10, 14, 14, 20);
    shieldGfx.generateTexture('powerup-shield', 28, 28);
    shieldGfx.destroy();
  }

  createProjectileTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff5722);
    graphics.fillCircle(6, 6, 6);
    graphics.fillStyle(0xffeb3b);
    graphics.fillCircle(6, 6, 3);
    graphics.generateTexture('projectile', 12, 12);
    graphics.destroy();
  }

  createGroundTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x8B6914);
    graphics.fillRect(0, 10, 64, 22);
    graphics.fillStyle(0x4CAF50);
    graphics.fillRect(0, 0, 64, 12);
    graphics.fillStyle(0x66BB6A);
    for (let i = 2; i < 64; i += 6) {
      graphics.fillTriangle(i, 0, i + 2, 0, i + 1, -3);
    }

    graphics.generateTexture('ground', 64, 32);
    graphics.destroy();
  }

  createDotTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('dot', 4, 4);
    graphics.destroy();
  }
}
