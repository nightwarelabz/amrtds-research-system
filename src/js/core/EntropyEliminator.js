/**
 * A.M.R.T.D.S. // DYNAMIC ENTROPY DETECTION & ELIMINATIONAL ENGINE
 * Responsibility: Shannon entropy monitoring, DRFM jamming detection,
 * synthetic phantom echo synthesis, and active elimination wavefront purging.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class EntropyEliminator {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.dynamicEntropy = 0.22; // 0.00 to 1.00
    this.baseEntropy = 0.18;
    this.chaosFrequency = 1.2;
    this.eliminationWaveActive = false;
    this.wavefrontRadius = 0; // Normalized 0.0 to 1.0
    this.phantomClutterParticles = [];
    this.waveformBuffer = new Float32Array(128); // Real-time spectral buffer

    this.init();
  }

  init() {
    this.eventBus.on('remnant:wavefrontFired', () => {
      this.executeEliminationWavefront();
    });

    this.generateClutter(25);
  }

  generateClutter(count) {
    this.phantomClutterParticles = [];
    for (let i = 0; i < count; i++) {
      this.phantomClutterParticles.push({
        id: `CLUTTER-${i.toString().padStart(3, '0')}`,
        azimuth: Math.random() * 360,
        elevation: (Math.random() - 0.5) * 60,
        distanceKm: 20 + Math.random() * 180,
        entropyDensity: 0.4 + Math.random() * 0.6,
        phaseCoherence: Math.random() * 0.3,
        purged: false
      });
    }
  }

  update(deltaSec, missionTimeSec) {
    // Waveform simulation
    const phaseOffset = missionTimeSec * this.chaosFrequency;
    for (let i = 0; i < this.waveformBuffer.length; i++) {
      const x = i / this.waveformBuffer.length;
      // High entropy creates noisy chaotic waveform; low entropy creates smooth sine carrier
      const carrier = Math.sin(x * Math.PI * 8 + phaseOffset);
      const noise = (Math.random() - 0.5) * (this.dynamicEntropy * 2.2);
      this.waveformBuffer[i] = carrier * (1 - this.dynamicEntropy * 0.5) + noise;
    }

    // Expand elimination wavefront if active
    if (this.eliminationWaveActive) {
      this.wavefrontRadius += deltaSec * 0.85; // sweeps in ~1.2s
      if (this.wavefrontRadius >= 1.2) {
        this.eliminationWaveActive = false;
        this.wavefrontRadius = 0;
      }

      // Purge clutter within wavefront radius
      this.phantomClutterParticles.forEach(p => {
        const normDist = p.distanceKm / 200;
        if (!p.purged && normDist <= this.wavefrontRadius) {
          p.purged = true;
        }
      });
    }

    // Natural entropy recovery
    if (this.dynamicEntropy > this.baseEntropy && !this.eliminationWaveActive) {
      this.dynamicEntropy = Math.max(this.baseEntropy, this.dynamicEntropy - deltaSec * 0.05);
    }

    this.eventBus.emit('entropy:update', this.dynamicEntropy);
  }

  executeEliminationWavefront() {
    this.eliminationWaveActive = true;
    this.wavefrontRadius = 0.02;
    // Rapidly collapse dynamic entropy down to clean baseline
    this.dynamicEntropy = 0.12;

    // Purge clutter
    this.phantomClutterParticles.forEach(p => {
      p.purged = true;
    });

    // Notify listeners
    this.eventBus.emit('entropy:wavefrontSwept', { radius: this.wavefrontRadius });
  }

  injectHighEntropySpike() {
    this.dynamicEntropy = Math.min(0.96, this.dynamicEntropy + 0.45);
    // Respawn unpurged clutter
    this.generateClutter(35);
    this.eventBus.emit('entropy:surgeInjected', { level: this.dynamicEntropy });
  }

  getClutter() {
    return this.phantomClutterParticles;
  }

  getWaveform() {
    return this.waveformBuffer;
  }

  getEntropyLevel() {
    return this.dynamicEntropy;
  }
}
