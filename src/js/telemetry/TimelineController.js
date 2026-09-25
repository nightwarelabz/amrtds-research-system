/**
 * A.M.R.T.D.S. // DUAL TIMELINE CONTROLLER
 * Manages 120-second tactical localized render and 300-second (5-minute)
 * macro circumnavigation targeting matrix playback and scrubbing.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class TimelineController {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.currentMode = 120; // 120 or 300 seconds
    this.currentTimeSec = 0.0;
    this.isPlaying = true;
    this.playbackSpeed = 1.0;
    this.loop = true;

    // Tactical Phases
    this.phases = {
      120: [
        { start: 0, end: 30, name: 'PHASE I: INGRESS & COOPERATIVE SYNC' },
        { start: 30, end: 65, name: 'PHASE II: EW JAMMING & ENTROPY SPIKE' },
        { start: 65, end: 90, name: 'PHASE III: REMNANT ANTI-ENTROPY PURGE' },
        { start: 90, end: 110, name: 'PHASE IV: KINETIC INTERCEPT & DISSIMULATION' },
        { start: 110, end: 120, name: 'PHASE V: CIRCUMNAVIGATION EXTRACTION' }
      ],
      300: [
        { start: 0, end: 60, name: 'PHASE I: PLANETARY CIRCUMNAVIGATION INGRESS' },
        { start: 60, end: 140, name: 'PHASE II: MULTI-SPECTRAL DRFM JAMMING' },
        { start: 140, end: 220, name: 'PHASE III: REMNANT WAVEFRONT ELIMINATION' },
        { start: 220, end: 270, name: 'PHASE IV: APEX HYPERSONIC TARGET LOCK' },
        { start: 270, end: 300, name: 'PHASE V: FORENSIC TELEMETRY CRYSTALLIZATION' }
      ]
    };

    this.currentPhaseIndex = 0;
  }

  setMode(seconds) {
    if (seconds === 120 || seconds === 300) {
      this.currentMode = seconds;
      if (this.currentTimeSec > this.currentMode) {
        this.currentTimeSec = 0;
      }
      this.eventBus.emit('timeline:modeChanged', { mode: this.currentMode });
    }
  }

  update(deltaSec) {
    if (!this.isPlaying) return;

    this.currentTimeSec += deltaSec * this.playbackSpeed;

    if (this.currentTimeSec >= this.currentMode) {
      if (this.loop) {
        this.currentTimeSec = 0;
      } else {
        this.currentTimeSec = this.currentMode;
        this.isPlaying = false;
      }
    }

    // Check phase change
    const activePhases = this.phases[this.currentMode];
    let newPhaseIdx = 0;
    for (let i = 0; i < activePhases.length; i++) {
      if (this.currentTimeSec >= activePhases[i].start && this.currentTimeSec <= activePhases[i].end) {
        newPhaseIdx = i;
        break;
      }
    }

    if (newPhaseIdx !== this.currentPhaseIndex) {
      this.currentPhaseIndex = newPhaseIdx;
      this.eventBus.emit('timeline:phase', activePhases[newPhaseIdx]);
    }
  }

  seek(seconds) {
    this.currentTimeSec = Math.max(0, Math.min(this.currentMode, seconds));
    this.eventBus.emit('timeline:seek', { time: this.currentTimeSec });
  }

  seekNormalized(ratio) {
    this.seek(ratio * this.currentMode);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
  }

  getCurrentTime() {
    return this.currentTimeSec;
  }

  getMaxTime() {
    return this.currentMode;
  }

  getCurrentPhase() {
    return this.phases[this.currentMode][this.currentPhaseIndex];
  }

  getFormattedTime() {
    const mins = Math.floor(this.currentTimeSec / 60);
    const secs = Math.floor(this.currentTimeSec % 60);
    const ms = Math.floor((this.currentTimeSec % 1) * 100);
    return `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  getFormattedMaxTime() {
    const mins = Math.floor(this.currentMode / 60);
    const secs = Math.floor(this.currentMode % 60);
    return `T_MAX: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.00`;
  }
}
