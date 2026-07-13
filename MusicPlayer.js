// Creates simple placeholder music using the browser's built-in audio tools.
// No music files needed — the notes are generated automatically.
class MusicPlayer {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.intervalId = null;
    this.noteIndex = 0;
    this.pauseStartedAt = 0;
    this.activeCheerSource = null;
    this.noiseBuffer = null;

    // A cheerful little melody (frequencies in Hz)
    this.melody = [
      523, 587, 659, 698, 784, 698, 659, 587,
      523, 659, 784, 880, 784, 659, 523, 440,
    ];
    this.noteDuration = 0.25;
  }

  start() {
    if (this.isPlaying && !this.isPaused) return;

    if (this.isPaused && this.audioContext) {
      this.resume();
      return;
    }

    // Reuse existing context if available
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    this.isPlaying = true;
    this.isPaused = false;
    this.noteIndex = 0;
    this.playNextNote();
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.clearMelodyTimer();
    this.stopCelebration();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  stopMelody() {
    this.isPlaying = false;
    this.clearMelodyTimer();
    this.stopCelebration();
  }

  // FEATURE: pause background music and any active Web Audio output
  pause() {
    if (!this.isPlaying || this.isPaused || !this.audioContext) return;

    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    this.clearMelodyTimer();

    // Suspend the audio context — freezes music and any playing SFX in place
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  // FEATURE: resume music seamlessly from the same melody position
  resume() {
    if (!this.isPlaying || !this.isPaused || !this.audioContext) return;

    this.isPaused = false;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Continue the melody from the next scheduled note
    this.playNextNote();
  }

  clearMelodyTimer() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  playNextNote() {
    if (!this.isPlaying || this.isPaused || !this.audioContext) return;

    const frequency = this.melody[this.noteIndex];
    this.playTone(frequency, this.noteDuration * 0.9);

    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    this.intervalId = setTimeout(() => this.playNextNote(), this.noteDuration * 1000);
  }

  playTone(frequency, duration) {
    if (!this.audioContext || this.isPaused) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCoinSound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    });
  }

  playStompSound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    });
  }

  playHitSound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    });
  }

  playPowerUpSound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.22);
      gainNode.gain.setValueAtTime(0.16, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    });
  }

  playVictorySound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'sine';
      const now = ctx.currentTime;
      
      // Triumphant rising arpeggio
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.setValueAtTime(0.15, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      oscillator.start(now);
      oscillator.stop(now + 0.6);
    });
  }

  playEffect(setupFn) {
    if (!this.audioContext || this.isPaused) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    setupFn(oscillator, gainNode, this.audioContext);
  }

  getNoiseBuffer() {
    if (!this.audioContext) return null;
    if (!this.noiseBuffer) {
      const bufferSize = 3 * this.audioContext.sampleRate;
      this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  stopCelebration() {
    if (this.activeCheerSource) {
      try {
        this.activeCheerSource.stop();
      } catch (e) {}
      this.activeCheerSource = null;
    }
  }

  playCrowdCheer() {
    if (!this.audioContext || this.isPaused) return;

    const noise = this.getNoiseBuffer();
    if (!noise) return;

    try {
      const bufferSource = this.audioContext.createBufferSource();
      bufferSource.buffer = noise;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 1.5);
      filter.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 3.0);
      filter.Q.value = 1.0;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, this.audioContext.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3.0);

      bufferSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      bufferSource.start();
      bufferSource.stop(this.audioContext.currentTime + 3.0);

      this.activeCheerSource = bufferSource;
    } catch (e) {
      // Ignore audio errors during rapid state transitions
    }
  }

  playFireworkLaunchSound() {
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'triangle';
      const now = ctx.currentTime;
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.6);

      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      oscillator.start(now);
      oscillator.stop(now + 0.6);
    });
  }

  playFireworkPopSound() {
    // 1. Bass thump
    this.playEffect((oscillator, gainNode, ctx) => {
      oscillator.type = 'sine';
      const now = ctx.currentTime;
      oscillator.frequency.setValueAtTime(100, now);
      oscillator.frequency.exponentialRampToValueAtTime(10, now + 0.3);

      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    });

    // 2. High-frequency crackle/burst
    if (!this.audioContext || this.isPaused) return;
    const noise = this.getNoiseBuffer();
    if (!noise) return;

    try {
      const bufferSource = this.audioContext.createBufferSource();
      bufferSource.buffer = noise;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

      bufferSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      bufferSource.start();
      bufferSource.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      // Ignore audio errors during rapid state transitions
    }
  }
}

// One shared music player for the whole game
const musicPlayer = new MusicPlayer();
