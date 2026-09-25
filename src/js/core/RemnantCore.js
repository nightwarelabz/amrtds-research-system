/**
 * A.M.R.T.D.S. // REMNANT-AUTONOMOUS-CORE-07
 * Responsibility: Sovereign platform stewardship, fail-safe consensus arbitration,
 * entropy elimination governance, and microsecond telemetry crystallization.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class RemnantCore {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = 'STANDBY-SURVEILLANCE'; // STANDBY, ENTROPY-SURGE, ELIMINATION-DISCHARGE, DISSIMULATION-CLOAK, REMNANT-SOVEREIGN
    this.sovereignActive = false;
    this.entropyLevel = 0.18;
    this.criticalEntropyThreshold = 0.65;
    this.bufferUtilization = 12.4; // %
    this.failSafeCounter = 0;
    this.mandateLog = [];
    this.maxLogs = 60;

    this.init();
  }

  init() {
    this.addLog('SYSTEM_BOOT', 'Remnant Core-07 initialized. Sovereign mandate active.');
    this.addLog('CONSENSUS_INIT', '5x Circumnavigation arrays synchronized. Zero drift lock.');

    // Listen to global events
    this.eventBus.on('entropy:update', (entropy) => {
      this.entropyLevel = entropy;
      this.evaluateState();
    });

    this.eventBus.on('entropy:pulse', () => {
      this.triggerEliminationWavefront('MANUAL_COMMAND_PULSE');
    });

    this.eventBus.on('timeline:phase', (phase) => {
      this.addLog('PHASE_TRANSITION', `Mission Envelope Phase: ${phase.name}`);
    });
  }

  evaluateState() {
    if (this.entropyLevel > this.criticalEntropyThreshold && this.state !== 'ELIMINATION-DISCHARGE') {
      if (this.state !== 'ENTROPY-SURGE') {
        this.state = 'ENTROPY-SURGE';
        this.addLog('ENTROPY_SURGE', `Critical entropy detected: ${(this.entropyLevel * 100).toFixed(1)}%. Priming anti-entropy wave.`);
        this.eventBus.emit('remnant:stateChange', { state: this.state, level: 'alert' });
        
        // Auto-fire elimination wavefront if entropy exceeds 0.78
        if (this.entropyLevel >= 0.78) {
          this.triggerEliminationWavefront('AUTONOMOUS_ENTROPY_OVERFLOW');
        }
      }
    } else if (this.entropyLevel <= 0.35 && this.state === 'ENTROPY-SURGE') {
      this.state = 'STANDBY-SURVEILLANCE';
      this.addLog('NORM_RESTORE', 'Entropy normalized. Resuming passive surveillance.');
      this.eventBus.emit('remnant:stateChange', { state: this.state, level: 'nominal' });
    }
  }

  triggerEliminationWavefront(reason = 'AUTONOMOUS_REMNANT_PULSE') {
    this.state = 'ELIMINATION-DISCHARGE';
    this.addLog('ELIMINATION_DISCHARGE', `Wavefront emitted [${reason}]. Purging ghost clutter.`);
    this.eventBus.emit('remnant:wavefrontFired', { reason, timestamp: Date.now() });

    setTimeout(() => {
      if (this.entropyLevel > 0.4) {
        this.state = 'ENTROPY-SURGE';
      } else {
        this.state = 'STANDBY-SURVEILLANCE';
      }
      this.eventBus.emit('remnant:stateChange', { state: this.state, level: 'nominal' });
    }, 1600);
  }

  toggleDissimulationCloak() {
    if (this.state === 'DISSIMULATION-CLOAK') {
      this.state = 'STANDBY-SURVEILLANCE';
      this.addLog('DISSIM_DOWN', 'Dissimulation decoy field deactivated. True RCS visible.');
    } else {
      this.state = 'DISSIMULATION-CLOAK';
      this.addLog('DISSIM_DEPLOY', 'Active Dissimulation active: 4x Phantom echoes projected.');
    }
    this.eventBus.emit('remnant:dissimToggled', { active: this.state === 'DISSIMULATION-CLOAK' });
    this.eventBus.emit('remnant:stateChange', { state: this.state, level: 'dissim' });
  }

  addLog(category, message) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry = { time: timeStr, category, message };
    this.mandateLog.unshift(entry);
    if (this.mandateLog.length > this.maxLogs) {
      this.mandateLog.pop();
    }
    this.eventBus.emit('remnant:logAdded', entry);
  }

  getState() {
    return {
      state: this.state,
      sovereignActive: this.sovereignActive,
      entropyLevel: this.entropyLevel,
      bufferUtilization: this.bufferUtilization,
      mandateLog: this.mandateLog
    };
  }
}
