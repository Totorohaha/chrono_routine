// Synthesizes natural, acoustic, and relaxing sounds using Web Audio API
// 0 bytes external downloads, offline, instant response, zero latency
class SoundManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGainNode: GainNode | null = null;
  private currentType: 'rain' | 'waves' | 'stream' | 'none' = 'none';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Premium acoustic success chime (Apple iOS / Zen Marimba style)
   * Two uplifting, crystal-clear harmonic notes (E5 -> B5) with soft overtones
   * Replaces previous sliding siren whistle with an elegant, gentle acoustic tone
   */
  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Two warm, pleasant musical notes (E5: 659.25Hz, then B5: 987.77Hz 70ms later)
      const notes = [
        { freq: 659.25, time: now, duration: 0.9, gain: 0.22 },
        { freq: 987.77, time: now + 0.07, duration: 1.1, gain: 0.20 },
      ];

      notes.forEach(({ freq, time, duration, gain: maxGain }) => {
        if (!this.ctx) return;

        // Primary fundamental note
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, time);

        // Soft acoustic octave overtone for wooden/crystal resonance
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time);

        // Fast gentle attack (6ms) to avoid click artifacts, then natural exponential decay
        gain1.gain.setValueAtTime(0.0001, time);
        gain1.gain.exponentialRampToValueAtTime(maxGain, time + 0.006);
        gain1.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        gain2.gain.setValueAtTime(0.0001, time);
        gain2.gain.exponentialRampToValueAtTime(maxGain * 0.2, time + 0.006);
        gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.55);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc1.stop(time + duration);
        osc2.start(time);
        osc2.stop(time + duration);
      });
    } catch {
      // Audio error handling
    }
  }

  /**
   * Deep Tibetan Singing Bowl / Zen Temple Bell
   * Multi-timbral chord with natural micro-detuned acoustic beating (~0.5Hz chorus)
   */
  playBell() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Authentic singing bowl harmonic spectrum with natural acoustic shimmer
      const harmonics = [
        { f: 261.63, g: 0.30, d: 3.5 }, // Fundamental C4
        { f: 262.25, g: 0.22, d: 3.2 }, // Micro-detune (+0.6Hz acoustic warmth & chorus)
        { f: 523.25, g: 0.14, d: 2.6 }, // Octave harmonic C5
        { f: 784.88, g: 0.06, d: 1.8 }, // Pure fifth harmonic G5
      ];

      harmonics.forEach(({ f, g, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(g, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + d);
      });
    } catch {
      // Audio error handling
    }
  }

  /**
   * Authentic wooden fish temple block (赛博木鱼 · 沉浸空灵纯木质笃声)
   * High transient mallet tap + resonant 410Hz hollow cavity + 205Hz wooden depth
   */
  playWoodenFish() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. High transient mallet tap click (15ms)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(820, now);
      clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.015);
      clickGain.gain.setValueAtTime(0.35, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.018);

      // 2. Main hollow wooden cavity resonance (410Hz)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(410, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(395, now + 0.09);
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.48, now + 0.003);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.1);

      // 3. Low depth wood body tone (205Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(205, now);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.075);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Crisp metal lighter flint flick + gas ignition puff
   */
  playLighterFlick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Flint wheel spark noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.26, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);

      // 2. Gas ignition puff (at +25ms)
      const puffTime = now + 0.025;
      const puffOsc = this.ctx.createOscillator();
      const puffGain = this.ctx.createGain();
      puffOsc.type = 'sine';
      puffOsc.frequency.setValueAtTime(140, puffTime);
      puffOsc.frequency.exponentialRampToValueAtTime(60, puffTime + 0.08);

      puffGain.gain.setValueAtTime(0.001, puffTime);
      puffGain.gain.exponentialRampToValueAtTime(0.22, puffTime + 0.015);
      puffGain.gain.exponentialRampToValueAtTime(0.001, puffTime + 0.09);

      puffOsc.connect(puffGain);
      puffGain.connect(this.ctx.destination);
      puffOsc.start(puffTime);
      puffOsc.stop(puffTime + 0.095);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Subtle burning ember sizzle during inhalation
   */
  playSmokeInhale() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const isCrackle = Math.random() < 0.005;
        output[i] = (Math.random() * 2 - 1) * 0.2 + (isCrackle ? (Math.random() - 0.5) * 1.1 : 0);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(750, now + 1.2);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Soft relaxing exhale air release
   */
  playSmokeExhale() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.0);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.linearRampToValueAtTime(280, now + 1.8);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Crisp organic water droplet pop (Soft tactile bubble burst)
   * Replaces old 160Hz cartoon laser pitch slide with an authentic physical bubble pop
   */
  playBubblePop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Realistic water droplet burst: brief 40ms acoustic resonance
      const baseFreq = 750 + Math.random() * 250;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Subtle upward cavitation chirp over 10ms, then soft settle
      osc.frequency.setValueAtTime(baseFreq * 0.9, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.01);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.04);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Ethereal celesta wind chime (For Gravity Stardust Sandbox)
   * High crystalline Pentatonic notes with soft overtone shimmer
   */
  playPentatonicChime(noteIndex?: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Higher relaxing pentatonic scale (C5, D5, E5, G5, A5, C6, D6, E6)
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
      const idx = typeof noteIndex === 'number' ? noteIndex % notes.length : Math.floor(Math.random() * notes.length);
      const freq = notes[idx];

      // Primary chime tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // Crystalline overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.006);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(0.04, now + 0.006);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.25);
      osc2.start(now);
      osc2.stop(now + 0.55);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Meditative Handpan / Hang Drum harmonic tone (D-Kurd therapeutic scale)
   * Warm metallic strike transient + resonant octave & fifth body ring
   */
  playHandpanTone(noteIndex?: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // D-Kurd / Celtic Minor contemplative scale (D3, A3, Bb3, C4, D4, E4, F4, A4)
      const notes = [146.83, 220.0, 233.08, 261.63, 293.66, 329.63, 349.23, 440.0];
      const idx = typeof noteIndex === 'number' ? Math.abs(noteIndex) % notes.length : Math.floor(Math.random() * notes.length);
      const freq = notes[idx];

      // 1. Fundamental resonant tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.24, now + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      // 2. Octave overtone (Hang drum acoustic characteristic)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);
      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.006);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      // 3. Soft metallic transient slap (bandpassed triangle)
      const slapOsc = this.ctx.createOscillator();
      const slapGain = this.ctx.createGain();
      slapOsc.type = 'triangle';
      slapOsc.frequency.setValueAtTime(freq * 3, now);
      slapOsc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.02);
      slapGain.gain.setValueAtTime(0.10, now);
      slapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      slapOsc.connect(slapGain);
      slapGain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.85);
      osc2.start(now);
      osc2.stop(now + 1.25);
      slapOsc.start(now);
      slapOsc.stop(now + 0.03);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Tibetan Singing Bowl resonance with slow acoustic chorus beating
   */
  playSingingBowlResonance(noteIndex?: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Meditative singing bowl frequencies
      const bowlBases = [216.0, 256.0, 288.0, 324.0, 384.0, 432.0];
      const idx = typeof noteIndex === 'number' ? Math.abs(noteIndex) % bowlBases.length : Math.floor(Math.random() * bowlBases.length);
      const baseFreq = bowlBases[idx];

      const harmonics = [
        { f: baseFreq, g: 0.22, d: 2.8 },
        { f: baseFreq + 0.75, g: 0.16, d: 2.6 }, // Micro-detuned beating
        { f: baseFreq * 2.02, g: 0.08, d: 2.0 },
        { f: baseFreq * 3.01, g: 0.03, d: 1.4 },
      ];

      harmonics.forEach(({ f, g, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(g, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + d + 0.05);
      });
    } catch {
      // Audio error handling
    }
  }

  /**
   * Cosmic Supernova explosive burst with ethereal low-frequency sweep
   */
  playSupernovaBurst() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Low sub bass expansion boom (95Hz -> 32Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.85);
      subGain.gain.setValueAtTime(0.38, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.95);

      // 2. Shimmering cosmic whoosh noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.75);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Subtle wooden tap for tactile UI feedback
   */
  playTap() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.02);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Audio error handling
    }
  }

  /**
   * Ambient sound generator with dynamic modulation (LFO ocean swells, gentle rain)
   */
  startAmbient(type: 'rain' | 'waves' | 'stream') {
    try {
      this.stopAmbient();
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink noise synthesis for a warm, natural acoustic bed
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      const mainGain = this.ctx.createGain();

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
        mainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 0.3);
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        // LFO ocean wave swell simulation: 7-second periodic swell & recede cycle
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime); // ~7.1s cycle
        lfoGain.gain.setValueAtTime(160, this.ctx.currentTime); // frequency modulation
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.lfoNode = lfo;
        this.lfoGainNode = lfoGain;

        mainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.22, this.ctx.currentTime + 0.4);
      } else {
        // Stream / Forest breeze
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);
        mainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + 0.3);
      }

      noiseSource.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(this.ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.gainNode = mainGain;
      this.currentType = type;
    } catch {
      // Audio error handling
    }
  }

  stopAmbient() {
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      } catch {
        // Ignore
      }
    }

    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {
        // Ignore
      }
      this.lfoNode = null;
    }

    if (this.lfoGainNode) {
      try {
        this.lfoGainNode.disconnect();
      } catch {
        // Ignore
      }
      this.lfoGainNode = null;
    }

    if (this.noiseNode) {
      setTimeout(() => {
        try {
          if (this.noiseNode) {
            (this.noiseNode as AudioScheduledSourceNode).stop();
            this.noiseNode.disconnect();
          }
        } catch {
          // Ignore
        }
        this.noiseNode = null;
        this.gainNode = null;
      }, 100);
    }
    this.currentType = 'none';
  }

  getCurrentAmbient() {
    return this.currentType;
  }
}

export const soundManager = new SoundManager();
