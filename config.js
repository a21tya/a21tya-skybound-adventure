// Game settings — tweak these to change how the game feels
const GAME_CONFIG = {
  width: 800,
  height: 450,
  backgroundColor: '#87CEEB',

  player: {
    speed: 200,
    jumpForce: 500,
    bounce: 0.1,
    stompBounce: 320,
  },

  world: {
    width: 2400,
    height: 450,
  },

  gravity: 900,

  // FEATURE: power-up durations and effects
  powerUps: {
    speed: {
      duration: 8000,
      speedMultiplier: 1.85,
      tint: 0xffd54f,
    },
    shield: {
      duration: 7000,
      tint: 0x4fc3f7,
    },
  },

  // FEATURE: Robo enemy type definitions
  roboTypes: {
    standard: { speed: 60, tint: 0xffffff, texture: 'enemy' },
    fast: { speed: 115, tint: 0xff6b6b, texture: 'robo-fast' },
    jumper: { speed: 50, tint: 0x69f0ae, texture: 'robo-jumper', jumpForce: 380, jumpInterval: 2200 },
    shooter: { speed: 45, tint: 0xffb74d, texture: 'robo-shooter', fireInterval: 2800, projectileSpeed: 220 },
  },

  // Theme palettes for light / dark mode toggle
  themes: {
    light: {
      skyTop: 0x87CEEB,
      skyBottom: 0xE0F7FA,
      mountainAlpha: 0.7,
      cloudAlpha: 0.6,
      platformTint: 0xffffff,
      groundTint: 0xffffff,
      treeTint: 0xffffff,
      grassTint: 0xffffff,
      uiColor: '#ffffff',
      uiStroke: '#2c3e50',
      hintColor: '#bdc3c7',
    },
    dark: {
      skyTop: 0x0f1729,
      skyBottom: 0x1e2d4a,
      mountainAlpha: 0.5,
      cloudAlpha: 0.25,
      platformTint: 0x6b8f5e,
      groundTint: 0x5c4a32,
      treeTint: 0x2d5a3d,
      grassTint: 0x3d6b45,
      uiColor: '#e2e8f0',
      uiStroke: '#0f1729',
      hintColor: '#94a3b8',
    },
  },
};
