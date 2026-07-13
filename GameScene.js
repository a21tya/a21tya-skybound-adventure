// GameScene — the main level where you play
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isDarkMode = false;

    // FEATURE: active power-up state
    this.activePowerUps = {
      speed: { active: false, endTime: 0 },
      shield: { active: false, endTime: 0 },
    };
  }

  create() {
    // Reset state variables to support clean restarts
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.totalCoins = 0;
    this.coinsCollected = 0;
    this.totalRobos = 0;
    this.robosDefeated = 0;

    if (this.victoryTimer) {
      this.victoryTimer.destroy();
      this.victoryTimer = null;
    }

    this.activePowerUps = {
      speed: { active: false, endTime: 0 },
      shield: { active: false, endTime: 0 },
    };

    // Ensure physics world and tweens are resumed and time is active
    this.physics.resume();
    this.tweens.resumeAll();
    this.time.paused = false;

    // Explicitly focus the canvas to ensure keyboard inputs work
    if (this.game && this.game.canvas) {
      if (!this.game.canvas.hasAttribute('tabindex')) {
        this.game.canvas.setAttribute('tabindex', '0');
      }
      this.game.canvas.focus();
    }

    const worldW = GAME_CONFIG.world.width;
    const worldH = GAME_CONFIG.world.height;

    this.physics.world.setBounds(0, 0, worldW, worldH);

    this.createBackground(worldW, worldH);
    this.createPlatforms(worldW, worldH);
    this.createDecorations();
    this.createPlayer();
    this.createCoins();
    this.createPowerUps();      // FEATURE: speed boost & shield pickups
    this.createRobo();           // FEATURE: expanded Robo enemy variety
    this.createProjectiles();    // FEATURE: shooter Robo projectiles

    // Set up native physics overlaps for high performance
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    this.physics.add.overlap(this.player, this.Robos, this.onPlayerRoboCollision, null, this);
    this.physics.add.overlap(this.player, this.projectiles, this.onPlayerProjectileCollision, null, this);

    this.createUI();
    this.createPauseOverlay();
    this.createGameOverOverlay();
    this.createVictoryOverlay();
    this.createPlayerEffects();  // FEATURE: shield glow around player
    this.setupCamera();
    this.setupControls();
    this.applyTheme();

    // Start/restart background music cleanly
    musicPlayer.start();
  }

  createBackground(worldW, worldH) {
    this.skyGraphics = this.add.graphics();
    this.skyGraphics.setScrollFactor(0);
    this.skyGraphics.setDepth(-10);

    this.mountains = [];
    for (let x = 0; x < worldW; x += 280) {
      const mountain = this.add.image(x, worldH - 30, 'mountain');
      mountain.setOrigin(0, 1);
      mountain.setScrollFactor(0.2);
      this.mountains.push(mountain);
    }

    this.clouds = [];
    const cloudPositions = [100, 350, 600, 900, 1200, 1500, 1800, 2100];
    cloudPositions.forEach((x, i) => {
      const cloud = this.add.image(x, 50 + (i % 3) * 30, 'cloud');
      cloud.setScale(0.5 + (i % 3) * 0.2);
      cloud.setScrollFactor(0.4);
      this.clouds.push(cloud);
    });
  }

  createPlatforms(worldW, worldH) {
    this.platforms = this.physics.add.staticGroup();
    this.platformSprites = [];
    this.groundSprites = [];

    const groundY = worldH - 32;
    for (let x = 0; x < worldW; x += 64) {
      const tile = this.platforms.create(x + 32, groundY, 'ground');
      this.groundSprites.push(tile);
    }

    const platformData = [
      { x: 280, y: 320 },
      { x: 420, y: 260 },
      { x: 580, y: 300 },
      { x: 750, y: 220 },
      { x: 920, y: 280 },
      { x: 1100, y: 200 },
      { x: 1280, y: 260 },
      { x: 1450, y: 180 },
      { x: 1620, y: 240 },
      { x: 1800, y: 200 },
      { x: 1980, y: 280 },
      { x: 2150, y: 220 },
    ];

    platformData.forEach(({ x, y }) => {
      const tile = this.platforms.create(x, y, 'platform');
      this.platformSprites.push(tile);
    });
  }

  createDecorations() {
    this.trees = [];
    this.grassTufts = [];

    const treePositions = [80, 500, 850, 1350, 1750, 2200];
    treePositions.forEach((x) => {
      const tree = this.add.image(x, GAME_CONFIG.world.height - 32, 'tree');
      tree.setOrigin(0.5, 1);
      this.trees.push(tree);
    });

    const grassPositions = [200, 350, 650, 1000, 1400, 1900, 2300];
    grassPositions.forEach((x) => {
      const grass = this.add.image(x, GAME_CONFIG.world.height - 32, 'grass');
      grass.setOrigin(0.5, 1);
      this.grassTufts.push(grass);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(80, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(GAME_CONFIG.player.bounce);
    this.player.setDisplaySize(32, 40);
    this.player.body.setSize(20, 36);
    this.player.body.setOffset(6, 4);
    this.player.defaultTint = 0xffffff;

    this.physics.add.collider(this.player, this.platforms);
  }

  // FEATURE: glowing shield aura that follows the player
  createPlayerEffects() {
    this.shieldGlow = this.add.graphics();
    this.shieldGlow.setDepth(5);
    this.shieldGlow.setVisible(false);

    this.tweens.add({
      targets: this.shieldGlow,
      alpha: { from: 0.5, to: 0.9 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  createCoins() {
    this.coins = this.physics.add.group();

    const coinPositions = [
      { x: 160, y: 400 }, { x: 360, y: 400 }, { x: 560, y: 400 },
      { x: 800, y: 400 }, { x: 1050, y: 400 }, { x: 1300, y: 400 },
      { x: 1550, y: 400 }, { x: 1800, y: 400 }, { x: 2050, y: 400 },
      { x: 2280, y: 400 },
      { x: 280, y: 290 }, { x: 420, y: 230 }, { x: 580, y: 270 },
      { x: 750, y: 190 }, { x: 920, y: 250 }, { x: 1100, y: 170 },
      { x: 1280, y: 230 }, { x: 1450, y: 150 }, { x: 1620, y: 210 },
      { x: 1800, y: 170 }, { x: 1980, y: 250 }, { x: 2150, y: 190 },
    ];

    this.totalCoins = coinPositions.length;
    this.coinsCollected = 0;

    coinPositions.forEach(({ x, y }) => {
      this.spawnCollectible(this.coins, x, y, 'coin');
    });
  }

  // FEATURE: power-ups scattered through the middle of the map
  createPowerUps() {
    this.powerUps = this.physics.add.group();

    const powerUpData = [
      { x: 650, y: 360, type: 'speed' },
      { x: 820, y: 250, type: 'shield' },
      { x: 1000, y: 360, type: 'speed' },
      { x: 1180, y: 170, type: 'shield' },
      { x: 1350, y: 360, type: 'shield' },
      { x: 1520, y: 150, type: 'speed' },
      { x: 1680, y: 210, type: 'shield' },
      { x: 1850, y: 360, type: 'speed' },
    ];

    powerUpData.forEach(({ x, y, type }) => {
      const texture = type === 'speed' ? 'powerup-speed' : 'powerup-shield';
      const item = this.spawnCollectible(this.powerUps, x, y, texture);
      item.powerUpType = type;
    });
  }

  spawnCollectible(group, x, y, texture) {
    const item = group.create(x, y, texture);
    item.body.setAllowGravity(false);

    this.tweens.add({
      targets: item,
      y: y - 10,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: item,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });

    return item;
  }

  // FEATURE: higher-density Robo spawns with multiple enemy types
  createRobo() {
    this.Robos = this.physics.add.group();
    this.activeRobosList = [];

    const roboData = [
      // Standard patrol Robos — ground and platforms
      { type: 'standard', x: 350, y: 400, patrolLeft: 250, patrolRight: 480 },
      { type: 'standard', x: 750, y: 190, patrolLeft: 680, patrolRight: 820 },
      { type: 'standard', x: 1100, y: 170, patrolLeft: 1060, patrolRight: 1140 },
      { type: 'standard', x: 1450, y: 150, patrolLeft: 1410, patrolRight: 1490 },
      { type: 'standard', x: 1980, y: 250, patrolLeft: 1940, patrolRight: 2020 },
      { type: 'standard', x: 2150, y: 400, patrolLeft: 2050, patrolRight: 2280 },

      // Fast Robos — zip along patrol routes
      { type: 'fast', x: 580, y: 270, patrolLeft: 540, patrolRight: 620 },
      { type: 'fast', x: 1280, y: 230, patrolLeft: 1240, patrolRight: 1320 },
      { type: 'fast', x: 1800, y: 170, patrolLeft: 1760, patrolRight: 1840 },

      // Jumper Robos — hop over small gaps
      { type: 'jumper', x: 420, y: 230, patrolLeft: 380, patrolRight: 460 },
      { type: 'jumper', x: 920, y: 250, patrolLeft: 880, patrolRight: 960 },
      { type: 'jumper', x: 1620, y: 210, patrolLeft: 1580, patrolRight: 1660 },

      // Shooter Robos — fire projectiles at the player
      { type: 'shooter', x: 1100, y: 360, patrolLeft: 1020, patrolRight: 1180 },
      { type: 'shooter', x: 1520, y: 360, patrolLeft: 1440, patrolRight: 1600 },
      { type: 'shooter', x: 1900, y: 360, patrolLeft: 1820, patrolRight: 1980 },
    ];

    this.totalRobos = roboData.length;
    this.robosDefeated = 0;

    roboData.forEach((data, index) => {
      const Robo = this.spawnRobo(data);
      Robo.roboId = index;
      this.activeRobosList.push(Robo);
      console.log(`[SPAWN] Robo added to activeRobosList: id=${index}, type=${data.type}, x=${data.x}, y=${data.y}`);
    });
  }

  spawnRobo({ type, x, y, patrolLeft, patrolRight }) {
    const config = GAME_CONFIG.roboTypes[type];
    const Robo = this.Robos.create(x, y, config.texture);

    Robo.setCollideWorldBounds(false);
    Robo.body.setAllowGravity(true);
    Robo.setVelocityX(-config.speed);
    Robo.setTint(config.tint);
    Robo.roboType = type;
    Robo.patrolLeft = patrolLeft;
    Robo.patrolRight = patrolRight;
    Robo.patrolSpeed = config.speed;
    Robo.isDead = false;

    if (type === 'jumper') {
      Robo.nextJumpTime = this.time.now + config.jumpInterval;
      Robo.jumpForce = config.jumpForce;
      Robo.jumpInterval = config.jumpInterval;
    }

    if (type === 'shooter') {
      Robo.nextFireTime = this.time.now + config.fireInterval;
      Robo.fireInterval = config.fireInterval;
      Robo.projectileSpeed = config.projectileSpeed;
    }

    this.physics.add.collider(Robo, this.platforms);
    return Robo;
  }

  createProjectiles() {
    this.projectiles = this.physics.add.group();
  }

  createUI() {
    const theme = GAME_CONFIG.themes.light;

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: theme.uiColor,
      stroke: theme.uiStroke,
      strokeThickness: 3,
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(10);

    this.progressText = this.add.text(160, 21, 'Coins: 0/0  •  Robos Left: 0', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: theme.uiColor,
      stroke: theme.uiStroke,
      strokeThickness: 2,
    });
    this.progressText.setScrollFactor(0);
    this.progressText.setDepth(10);

    this.updateHUD();

    // FEATURE: power-up timer bars
    this.speedBarBg = this.add.rectangle(16, 52, 120, 10, 0x000000, 0.45).setOrigin(0, 0.5);
    this.speedBarBg.setScrollFactor(0).setDepth(10).setVisible(false);
    this.speedBar = this.add.rectangle(16, 52, 120, 10, 0xffd54f).setOrigin(0, 0.5);
    this.speedBar.setScrollFactor(0).setDepth(11).setVisible(false);
    this.speedLabel = this.add.text(16, 64, '⚡ SPEED', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '11px',
      color: '#ffd54f',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(10).setVisible(false);

    this.shieldBarBg = this.add.rectangle(16, 82, 120, 10, 0x000000, 0.45).setOrigin(0, 0.5);
    this.shieldBarBg.setScrollFactor(0).setDepth(10).setVisible(false);
    this.shieldBar = this.add.rectangle(16, 82, 120, 10, 0x4fc3f7).setOrigin(0, 0.5);
    this.shieldBar.setScrollFactor(0).setDepth(11).setVisible(false);
    this.shieldLabel = this.add.text(16, 94, '🛡 SHIELD', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '11px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(10).setVisible(false);

    this.themeButton = this.add.text(GAME_CONFIG.width - 16, 16, '☀ Light', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: theme.uiColor,
      stroke: theme.uiStroke,
      strokeThickness: 2,
      backgroundColor: '#00000044',
      padding: { x: 8, y: 4 },
    });
    this.themeButton.setOrigin(1, 0);
    this.themeButton.setScrollFactor(0);
    this.themeButton.setDepth(10);
    this.themeButton.setInteractive({ useHandCursor: true });
    this.themeButton.on('pointerdown', () => this.toggleTheme());

    this.hintText = this.add.text(16, GAME_CONFIG.height - 12, 'ESC: Pause  •  L: Toggle theme', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '13px',
      color: theme.hintColor,
    });
    this.hintText.setOrigin(0, 1);
    this.hintText.setScrollFactor(0);
    this.hintText.setDepth(10);
  }

  createPauseOverlay() {
    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setScrollFactor(0);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    const dimmer = this.add.rectangle(
      GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
      GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.55
    );

    const pauseTitle = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 20, 'Game Paused', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#2c3e50',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const pauseHint = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 30, 'Press ESC to resume', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '18px',
      color: '#f1c40f',
    }).setOrigin(0.5);

    this.pauseOverlay.add([dimmer, pauseTitle, pauseHint]);
  }

  createGameOverOverlay() {
    this.gameOverOverlay = this.add.container(0, 0);
    this.gameOverOverlay.setScrollFactor(0);
    this.gameOverOverlay.setDepth(100);
    this.gameOverOverlay.setVisible(false);

    const dimmer = this.add.rectangle(
      GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
      GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.65
    );

    const gameOverTitle = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 30, 'Game Over', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#2c3e50',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const restartHint = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 20, 'Press R to restart  •  ESC for title', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '16px',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    this.gameOverOverlay.add([dimmer, gameOverTitle, restartHint]);
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.world.width, GAME_CONFIG.world.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  setupControls() {
    // Clear any previous listeners to avoid duplicates on restart
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.off('keydown-L');
    this.input.keyboard.off('keydown-R');

    // Reset keyboard keys state (clears movement buffers)
    this.input.keyboard.resetKeys();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.isGameOver || this.isVictory) {
        musicPlayer.stop();
        this.scene.start('TitleScene');
        return;
      }
      this.togglePause();
    });

    this.input.keyboard.on('keydown-L', () => {
      if (!this.isPaused && !this.isGameOver && !this.isVictory) {
        this.toggleTheme();
      }
    });

    this.input.keyboard.on('keydown-R', () => {
      if (this.isGameOver || this.isVictory) {
        musicPlayer.stop();
        this.scene.restart();
      }
    });

    // Clean up listeners on scene shutdown to avoid leaks or triggers on other scenes
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC');
      this.input.keyboard.off('keydown-L');
      this.input.keyboard.off('keydown-R');
      if (this.victoryTimer) {
        this.victoryTimer.destroy();
        this.victoryTimer = null;
      }
    });
  }

  // FEATURE: pause also suspends background music and active sound effects
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      musicPlayer.pause();
      this.pauseOverlay.setVisible(true);
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
      musicPlayer.resume();
      this.pauseOverlay.setVisible(false);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  applyTheme() {
    const themeKey = this.isDarkMode ? 'dark' : 'light';
    const theme = GAME_CONFIG.themes[themeKey];
    const worldW = GAME_CONFIG.world.width;
    const worldH = GAME_CONFIG.world.height;

    this.skyGraphics.clear();
    this.skyGraphics.fillGradientStyle(
      theme.skyTop, theme.skyTop,
      theme.skyBottom, theme.skyBottom, 1
    );
    this.skyGraphics.fillRect(0, 0, worldW, worldH);

    this.mountains.forEach((m) => m.setAlpha(theme.mountainAlpha));
    this.clouds.forEach((c, i) => c.setAlpha(theme.cloudAlpha + (i % 2) * 0.15));
    this.platformSprites.forEach((p) => p.setTint(theme.platformTint));
    this.groundSprites.forEach((g) => g.setTint(theme.groundTint));
    this.trees.forEach((t) => t.setTint(theme.treeTint));
    this.grassTufts.forEach((g) => g.setTint(theme.grassTint));

    this.scoreText.setColor(theme.uiColor);
    this.scoreText.setStroke(theme.uiStroke, 3);
    if (this.progressText) {
      this.progressText.setColor(theme.uiColor);
      this.progressText.setStroke(theme.uiStroke, 2);
    }
    this.hintText.setColor(theme.hintColor);
    this.themeButton.setColor(theme.uiColor);
    this.themeButton.setStroke(theme.uiStroke, 2);
    this.themeButton.setText(this.isDarkMode ? '🌙 Dark' : '☀ Light');
  }

  update(time) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;

    if (!this.lastLogTime || time - this.lastLogTime > 2000) {
      this.lastLogTime = time;
      console.log(`[STATUS] Active Robos remaining: ${this.activeRobosList.length}`);
      this.activeRobosList.forEach(r => {
        console.log(`  - Robo id=${r.roboId}, type=${r.roboType}, x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)}`);
      });
    }

    // Safety check for Robos falling below the world
    for (let i = this.activeRobosList.length - 1; i >= 0; i--) {
      const r = this.activeRobosList[i];
      if (r.y > GAME_CONFIG.world.height) {
        console.log(`[FALLBACK] Robo id=${r.roboId} fell below the world! x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)}`);
        this.activeRobosList.splice(i, 1);
        this.robosDefeated++;
        r.destroy();
        this.updateHUD();
        this.checkWinCondition();
      }
    }

    this.handlePlayerMovement();
    this.handleRoboBehaviors(time);
    this.updatePowerUpEffects(time);
    this.updateShieldGlow();
    this.cleanupProjectiles();
  }

  handlePlayerMovement() {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    // FEATURE: speed boost increases run speed while active
    let speed = GAME_CONFIG.player.speed;
    if (this.activePowerUps.speed.active) {
      speed *= GAME_CONFIG.powerUps.speed.speedMultiplier;
    }

    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.keyW.isDown || this.cursors.space.isDown) && onGround) {
      this.player.setVelocityY(-GAME_CONFIG.player.jumpForce);
    }
  }

  handleRoboBehaviors(time) {
    for (let i = 0; i < this.activeRobosList.length; i++) {
      const Robo = this.activeRobosList[i];
      // Standard patrol reversal
      if (Robo.x <= Robo.patrolLeft) {
        Robo.setVelocityX(Robo.patrolSpeed);
        Robo.setFlipX(false);
      } else if (Robo.x >= Robo.patrolRight) {
        Robo.setVelocityX(-Robo.patrolSpeed);
        Robo.setFlipX(true);
      }

      // FEATURE: jumper Robo — hops when grounded on interval
      if (Robo.roboType === 'jumper' && time >= Robo.nextJumpTime) {
        const onGround = Robo.body.blocked.down || Robo.body.touching.down;
        if (onGround) {
          Robo.setVelocityY(-Robo.jumpForce);
          Robo.nextJumpTime = time + Robo.jumpInterval;
        }
      }

      // FEATURE: shooter Robo — fires a projectile toward the player
      if (Robo.roboType === 'shooter' && time >= Robo.nextFireTime) {
        this.fireRoboProjectile(Robo);
        Robo.nextFireTime = time + Robo.fireInterval;
      }
    }
  }

  // FEATURE: shooter Robo projectile
  fireRoboProjectile(Robo) {
    const direction = this.player.x < Robo.x ? -1 : 1;
    const projectile = this.projectiles.create(Robo.x + direction * 20, Robo.y, 'projectile');
    projectile.body.setAllowGravity(false);
    projectile.setVelocityX(direction * Robo.projectileSpeed);
    projectile.setDepth(4);

    this.tweens.add({
      targets: projectile,
      alpha: 0.6,
      duration: 200,
      yoyo: true,
      repeat: -1,
    });
  }

  collectCoin(player, coin) {
    coin.destroy();
    this.score += 10;
    this.coinsCollected++;
    this.updateHUD();
    musicPlayer.playCoinSound();
    this.showFloatingText('+10!', '#FFD700');
    this.checkWinCondition();
  }

  collectPowerUp(player, item) {
    const type = item.powerUpType;
    item.destroy();
    this.activatePowerUp(type);
    musicPlayer.playPowerUpSound();
  }

  onPlayerProjectileCollision(player, projectile) {
    projectile.destroy();

    // FEATURE: shield blocks projectile damage
    if (this.activePowerUps.shield.active) {
      this.showBlockedEffect();
    } else {
      this.hurtPlayer();
    }
  }

  cleanupProjectiles() {
    const projectiles = this.projectiles.getChildren();
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.x < -50 || p.x > GAME_CONFIG.world.width + 50) {
        p.destroy();
      }
    }
  }

  activatePowerUp(type) {
    const config = GAME_CONFIG.powerUps[type];
    const endTime = this.time.now + config.duration;

    this.activePowerUps[type].active = true;
    this.activePowerUps[type].endTime = endTime;

    if (type === 'speed') {
      this.player.setTint(config.tint);
      this.speedBarBg.setVisible(true);
      this.speedBar.setVisible(true);
      this.speedLabel.setVisible(true);
      this.showFloatingText('⚡ SPEED BOOST!', '#ffd54f');
    }

    if (type === 'shield') {
      this.player.setTint(config.tint);
      this.shieldGlow.setVisible(true);
      this.shieldBarBg.setVisible(true);
      this.shieldBar.setVisible(true);
      this.shieldLabel.setVisible(true);
      this.showFloatingText('🛡 SHIELD ACTIVE!', '#4fc3f7');
    }
  }

  // FEATURE: tick down power-up timers and update UI bars
  updatePowerUpEffects(time) {
    this.updateSinglePowerUp('speed', time, () => {
      this.speedBarBg.setVisible(false);
      this.speedBar.setVisible(false);
      this.speedLabel.setVisible(false);
    });

    this.updateSinglePowerUp('shield', time, () => {
      this.shieldGlow.setVisible(false);
      this.shieldBarBg.setVisible(false);
      this.shieldBar.setVisible(false);
      this.shieldLabel.setVisible(false);
    });

    this.refreshPlayerTint();
  }

  updateSinglePowerUp(type, time, onExpire) {
    const powerUp = this.activePowerUps[type];
    if (!powerUp.active) return;

    const config = GAME_CONFIG.powerUps[type];
    const remaining = powerUp.endTime - time;
    const ratio = Phaser.Math.Clamp(remaining / config.duration, 0, 1);

    if (type === 'speed') {
      this.speedBar.width = 120 * ratio;
    } else {
      this.shieldBar.width = 120 * ratio;
    }

    if (remaining <= 0) {
      powerUp.active = false;
      onExpire();
      this.showFloatingText(type === 'speed' ? 'Speed worn off' : 'Shield expired', '#aaaaaa');
    }
  }

  refreshPlayerTint() {
    if (this.activePowerUps.shield.active) {
      this.player.setTint(GAME_CONFIG.powerUps.shield.tint);
    } else if (this.activePowerUps.speed.active) {
      this.player.setTint(GAME_CONFIG.powerUps.speed.tint);
    } else {
      this.player.clearTint();
    }
  }

  updateShieldGlow() {
    if (!this.shieldGlow.visible) return;

    this.shieldGlow.clear();
    this.shieldGlow.lineStyle(3, 0x4fc3f7, 0.8);
    this.shieldGlow.strokeCircle(this.player.x, this.player.y, 28);
    this.shieldGlow.fillStyle(0x4fc3f7, 0.15);
    this.shieldGlow.fillCircle(this.player.x, this.player.y, 28);
  }

  onPlayerRoboCollision(player, Robo) {
    if (Robo.isDead) return;

    const playerBody = player.body;
    const roboBody = Robo.body;

    const playerFalling = playerBody.velocity.y > 0;
    const landedOnTop = playerBody.bottom <= roboBody.top + 12;

    if (playerFalling && landedOnTop) {
      this.stompRobo(Robo);
    } else if (this.activePowerUps.shield.active) {
      this.showBlockedEffect();
    } else {
      this.hurtPlayer();
    }
  }

  showBlockedEffect() {
    this.cameras.main.flash(80, 79, 195, 247, false);
    this.showFloatingText('BLOCKED!', '#4fc3f7');
  }

  stompRobo(Robo) {
    if (Robo.isDead) return;
    Robo.isDead = true;

    // Definitively remove from game array exactly once
    const index = this.activeRobosList.indexOf(Robo);
    console.log(`[STOMP] Robo stomped: id=${Robo.roboId}, type=${Robo.roboType}, indexInList=${index}`);
    if (index !== -1) {
      this.activeRobosList.splice(index, 1);
      this.robosDefeated++;
    }

    Robo.setVelocityX(0);
    Robo.setActive(false);
    Robo.setVisible(false);
    Robo.body.enable = false;
    Robo.destroy(); // fully destroy the physics object and free resources

    this.player.setVelocityY(-GAME_CONFIG.player.stompBounce);
    this.score += 25;
    this.updateHUD();
    musicPlayer.playStompSound();
    this.showFloatingText('STOMP +25!', '#9B59B6');
    this.checkWinCondition();
  }

  showFloatingText(message, color) {
    const text = this.add.text(this.player.x, this.player.y - 40, message, {
      fontSize: '18px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => text.destroy(),
    });
  }

  hurtPlayer() {
    if (this.isGameOver || this.activePowerUps.shield.active) return;

    this.isGameOver = true;
    this.physics.pause();
    this.tweens.pauseAll();
    musicPlayer.stopMelody();
    musicPlayer.playHitSound();
    this.player.setTint(0xff4444);
    this.player.setVelocityX(0);
    this.player.setVelocityY(-150);
    this.cameras.main.flash(300, 255, 50, 50);
    this.gameOverOverlay.setVisible(true);
  }

  updateHUD() {
    this.scoreText.setText('Score: ' + this.score);
    if (this.progressText) {
      const remainingRobos = this.activeRobosList.length;
      this.progressText.setText(`Coins: ${this.coinsCollected}/${this.totalCoins}  •  Robos Left: ${remainingRobos}`);
    }
  }

  checkWinCondition() {
    if (this.coinsCollected >= this.totalCoins && this.activeRobosList.length <= 0) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    if (this.isVictory || this.isGameOver) return;

    this.isVictory = true;
    this.physics.pause();
    this.tweens.pauseAll();

    // Pause time, stop bg music, play victory sound, and play crowd cheer
    this.time.paused = true;
    musicPlayer.stopMelody();
    musicPlayer.playVictorySound();
    musicPlayer.playCrowdCheer();

    this.victoryScoreText.setText('Final Score: ' + this.score);
    this.victoryOverlay.setVisible(true);

    this.cameras.main.flash(500, 46, 204, 113); // green flash

    // Launch continuous fireworks celebration
    this.victoryTimer = this.time.addEvent({
      delay: 600,
      callback: this.launchFirework,
      callbackScope: this,
      loop: true
    });
  }

  launchFirework() {
    const x = Phaser.Math.Between(100, GAME_CONFIG.width - 100);
    const startY = GAME_CONFIG.height;
    const endY = Phaser.Math.Between(80, 220);

    const rocket = this.add.image(x, startY, 'dot').setTint(0xffffff).setScale(2);
    rocket.setDepth(99);

    // Play launch sound
    musicPlayer.playFireworkLaunchSound();

    this.tweens.add({
      targets: rocket,
      y: endY,
      duration: Phaser.Math.Between(600, 900),
      ease: 'Quad.easeOut',
      onComplete: () => {
        rocket.destroy();
        this.explodeFirework(x, endY);
      }
    });
  }

  explodeFirework(x, y) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0xffffff];
    const color = Phaser.Math.RND.pick(colors);

    // Play pop sound
    musicPlayer.playFireworkPopSound();

    // Create explosion particles using Phaser's built-in particles
    const particles = this.add.particles(x, y, 'dot', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 2.5, end: 0 },
      lifespan: 800,
      gravityY: 100,
      maxParticles: 40,
      tint: color,
    });
    particles.setDepth(99);

    // Destroy the particle manager after it completes
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  createVictoryOverlay() {
    this.victoryOverlay = this.add.container(0, 0);
    this.victoryOverlay.setScrollFactor(0);
    this.victoryOverlay.setDepth(100);
    this.victoryOverlay.setVisible(false);

    const dimmer = this.add.rectangle(
      GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
      GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.65
    );

    const victoryTitle = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 40, 'Level Cleared!', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '46px',
      fontStyle: 'bold',
      color: '#2ecc71',
      stroke: '#2c3e50',
      strokeThickness: 5,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true,
      },
    }).setOrigin(0.5);

    this.victoryScoreText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 15, 'Final Score: 0', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '22px',
      color: '#f1c40f',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const restartHint = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 60, 'Press R to restart  •  ESC for title', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '16px',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    this.victoryOverlay.add([dimmer, victoryTitle, this.victoryScoreText, restartHint]);
  }
}
