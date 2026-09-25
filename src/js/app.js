/**
 * A.M.R.T.D.S. // MASTER SIMULATION APPLICATION & ORCHESTRATOR
 * Automated Military Radar Targeting & Dissimulation System
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

import { RemnantCore } from './core/RemnantCore.js';
import { CircumnavigationArray } from './core/CircumnavigationArray.js';
import { EntropyEliminator } from './core/EntropyEliminator.js';
import { ThreatAllegianceMatrix } from './core/ThreatAllegianceMatrix.js';
import { FrontalGlobeRenderer } from './render/FrontalGlobeRenderer.js';
import { EntropyWaveformRenderer } from './render/EntropyWaveformRenderer.js';
import { AudioSynthesizer } from './render/AudioSynthesizer.js';
import { HighSpeedDataDumper } from './telemetry/HighSpeedDataDumper.js';
import { TimelineController } from './telemetry/TimelineController.js';

// Simple Event Bus
class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

class AMRTDSApplication {
  constructor() {
    this.eventBus = new EventBus();
    this.audio = new AudioSynthesizer();
    this.remnant = new RemnantCore(this.eventBus);
    this.circumnav = new CircumnavigationArray(this.eventBus);
    this.entropy = new EntropyEliminator(this.eventBus);
    this.threatMatrix = new ThreatAllegianceMatrix(this.eventBus);
    this.timeline = new TimelineController(this.eventBus);

    this.lastTime = performance.now();
    this.fpsCounter = 60;
    this.frameCount = 0;
    this.fpsTimer = performance.now();

    this.initDOM();
    this.initRenderers();
    this.bindEvents();
    this.startMainLoop();
  }

  initDOM() {
    // Canvas elements
    this.globeCanvas = document.getElementById('frontal-globe-canvas');
    this.waveformCanvas = document.getElementById('entropy-waveform-canvas');
    this.dumpTerminalEl = document.getElementById('dump-stream-terminal');

    // Telemetry and HUD Readouts
    this.timeCurrentEl = document.getElementById('time-readout-current');
    this.timeMaxEl = document.getElementById('time-readout-max');
    this.timeScrubber = document.getElementById('timeline-scrubber');
    this.phaseLabelEl = document.getElementById('timeline-phase-label');
    this.fpsEl = document.getElementById('hud-fps-val');

    // Kinematics Readouts
    this.latEl = document.getElementById('kin-lat');
    this.lonEl = document.getElementById('kin-lon');
    this.altEl = document.getElementById('kin-alt');
    this.machEl = document.getElementById('kin-mach');
    this.headingEl = document.getElementById('kin-heading');
    this.consensusVarianceEl = document.getElementById('consensus-variance');
    this.consensusIntegrityEl = document.getElementById('consensus-integrity');

    // Entropy UI
    this.entropyValEl = document.getElementById('entropy-val-display');
    this.entropyBarFillEl = document.getElementById('entropy-bar-fill');

    // Remnant UI
    this.remnantStateBadge = document.getElementById('remnant-state-badge');
    this.remnantLogContainer = document.getElementById('remnant-log-feed');

    // Target Track Container
    this.targetListEl = document.getElementById('target-track-list');

    // Benchmark Counters
    this.dumpRateEl = document.getElementById('dump-rate-val');
    this.dumpLatencyEl = document.getElementById('dump-latency-val');
    this.bufferUtilEl = document.getElementById('buffer-util-val');
  }

  initRenderers() {
    this.globeRenderer = new FrontalGlobeRenderer(
      this.globeCanvas,
      this.circumnav,
      this.entropy,
      this.threatMatrix
    );

    this.waveformRenderer = new EntropyWaveformRenderer(
      this.waveformCanvas,
      this.entropy
    );

    this.dumper = new HighSpeedDataDumper(
      this.eventBus,
      this.dumpTerminalEl
    );

    // Initial Resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.globeRenderer.resize();
    this.waveformRenderer.resize();
  }

  bindEvents() {
    // Timeline Play/Pause
    const playBtn = document.getElementById('btn-timeline-play');
    playBtn.addEventListener('click', () => {
      const playing = this.timeline.togglePlay();
      playBtn.innerHTML = playing ? '&#10074;&#10074; PAUSE' : '&#9654; PLAY';
      this.audio.playTactileClick();
    });

    // Timeline 120s / 300s toggle
    const btn120 = document.getElementById('btn-time-120');
    const btn300 = document.getElementById('btn-time-300');
    btn120.addEventListener('click', () => {
      this.timeline.setMode(120);
      btn120.classList.add('active');
      btn300.classList.remove('active');
      this.audio.playTactileClick();
    });
    btn300.addEventListener('click', () => {
      this.timeline.setMode(300);
      btn300.classList.add('active');
      btn120.classList.remove('active');
      this.audio.playTactileClick();
    });

    // Timeline Scrubber
    this.timeScrubber.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.timeline.seekNormalized(val / 100);
    });

    // Speed multiplier buttons
    document.querySelectorAll('.btn-speed-mult').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-speed-mult').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.timeline.setSpeed(parseFloat(btn.dataset.speed));
        this.audio.playTactileClick();
      });
    });

    // Audio Mute Toggle
    const audioBtn = document.getElementById('btn-toggle-audio');
    audioBtn.addEventListener('click', () => {
      const enabled = this.audio.toggle();
      audioBtn.innerHTML = enabled ? '&#128266; AUDIO: ACTIVE' : '&#128263; AUDIO: MUTED';
      audioBtn.classList.toggle('active', enabled);
    });

    // Remnant Dissimulation Toggle
    const dissimBtn = document.getElementById('btn-toggle-dissim');
    dissimBtn.addEventListener('click', () => {
      this.remnant.toggleDissimulationCloak();
      const isDissim = this.remnant.state === 'DISSIMULATION-CLOAK';
      dissimBtn.classList.toggle('active', isDissim);
      this.audio.playTactileClick(1100, 0.05);
    });

    // Manual Entropy Elimination Wavefront Trigger
    const purgeBtn = document.getElementById('btn-fire-purge');
    purgeBtn.addEventListener('click', () => {
      this.eventBus.emit('entropy:pulse');
      this.audio.playEliminationDischarge();
    });

    // Inject Entropy Jamming Anomaly
    const jamBtn = document.getElementById('btn-inject-entropy');
    jamBtn.addEventListener('click', () => {
      this.entropy.injectHighEntropySpike();
      this.circumnav.injectSensorJamming();
      this.audio.playThreatLock();
    });

    // Target Filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.threatMatrix.setFilter(btn.dataset.filter);
        this.renderTargetRegistry();
        this.audio.playTactileClick();
      });
    });

    // Dumps Export
    document.getElementById('btn-export-json').addEventListener('click', () => {
      this.dumper.exportJsonDump();
      this.audio.playTactileClick();
    });
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      this.dumper.exportCsvDump();
      this.audio.playTactileClick();
    });

    // Research Modal
    const modalBackdrop = document.getElementById('research-modal-backdrop');
    document.getElementById('btn-open-charter').addEventListener('click', () => {
      modalBackdrop.classList.add('open');
      this.audio.playTactileClick();
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
      this.audio.playTactileClick();
    });

    // Event bus reactions
    this.eventBus.on('remnant:stateChange', ({ state, level }) => {
      this.remnantStateBadge.textContent = state;
      this.remnantStateBadge.className = `circ-status-badge ${level === 'alert' ? 'badge-diverge' : level === 'dissim' ? 'badge-dissim' : 'badge-sync'}`;
    });

    this.eventBus.on('remnant:logAdded', (log) => {
      this.appendRemnantLog(log);
    });

    this.eventBus.on('timeline:phase', (phase) => {
      this.phaseLabelEl.textContent = phase.name;
    });

    // Render Initial Target Registry
    this.renderTargetRegistry();
  }

  appendRemnantLog(log) {
    const el = document.createElement('div');
    el.className = 'remnant-log-line';
    let catClass = '';
    if (log.category.includes('SURGE') || log.category.includes('ALERT')) catClass = 'log-alert';
    if (log.category.includes('PURGE') || log.category.includes('WAVE')) catClass = 'log-purge';
    if (log.category.includes('DISSIM')) catClass = 'log-dissim';

    el.innerHTML = `<span class="log-time">[${log.time}]</span> <span class="${catClass}">[${log.category}]</span> ${log.message}`;
    this.remnantLogContainer.insertBefore(el, this.remnantLogContainer.firstChild);

    while (this.remnantLogContainer.children.length > 30) {
      this.remnantLogContainer.removeChild(this.remnantLogContainer.lastChild);
    }
  }

  renderTargetRegistry() {
    this.targetListEl.innerHTML = '';
    const targets = this.threatMatrix.getFilteredTargets();

    targets.forEach(tgt => {
      const card = document.createElement('div');
      card.className = `target-track-card ${tgt.allegiance.toLowerCase()} ${tgt.id === this.threatMatrix.selectedTargetId ? 'selected' : ''}`;
      
      let badgeClass = 'tag-friendly';
      if (tgt.allegiance === 'HOSTILE') badgeClass = 'tag-hostile';
      if (tgt.allegiance === 'DISSIM') badgeClass = 'tag-dissim';
      if (tgt.allegiance === 'NEUTRAL') badgeClass = 'tag-neutral';

      card.innerHTML = `
        <div class="target-row-top">
          <span class="target-callsign">${tgt.callsign}</span>
          <span class="target-class-tag ${badgeClass}">${tgt.allegiance}</span>
        </div>
        <div class="target-meta-row">
          <span>RNG: ${tgt.rangeKm.toFixed(1)}km</span>
          <span>VEL: M${tgt.velocityMach.toFixed(1)}</span>
          <span>TTI: ${tgt.ttiSec.toFixed(1)}s</span>
          <span>Pk: ${(tgt.pk * 100).toFixed(0)}%</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.threatMatrix.selectTarget(tgt.id);
        this.threatMatrix.lockTarget(tgt.id);
        this.renderTargetRegistry();
        this.audio.playThreatLock();
      });

      this.targetListEl.appendChild(card);
    });
  }

  startMainLoop() {
    const loop = (now) => {
      const deltaSec = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      // Update simulation models
      this.timeline.update(deltaSec);
      const missionTimeSec = this.timeline.getCurrentTime();

      this.circumnav.update(deltaSec, missionTimeSec);
      this.entropy.update(deltaSec, missionTimeSec);
      this.threatMatrix.update(deltaSec, missionTimeSec);

      const circState = this.circumnav.getConsensusState();
      const entropyLvl = this.entropy.getEntropyLevel();

      // Render Visual Containment Viewports
      this.globeRenderer.render(deltaSec, missionTimeSec);
      this.waveformRenderer.render();

      // Update Blazingly Fast System Dumper
      this.dumper.update(deltaSec, missionTimeSec, circState, entropyLvl, this.threatMatrix.getAllTargets());

      // Update Telemetry Readouts
      this.updateUI(circState, entropyLvl);

      // FPS Calculation
      this.frameCount++;
      if (now - this.fpsTimer >= 1000) {
        this.fpsCounter = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = now;
        if (this.fpsEl) this.fpsEl.textContent = `${this.fpsCounter} FPS`;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updateUI(circState, entropyLvl) {
    // Time & Timeline
    this.timeCurrentEl.textContent = this.timeline.getFormattedTime();
    this.timeMaxEl.textContent = this.timeline.getFormattedMaxTime();
    this.timeScrubber.value = (this.timeline.getCurrentTime() / this.timeline.getMaxTime()) * 100;

    // Kinematics
    this.latEl.textContent = `${circState.kinematics.lat.toFixed(4)}°N`;
    this.lonEl.textContent = `${Math.abs(circState.kinematics.lon).toFixed(4)}°W`;
    this.altEl.textContent = `${Math.round(circState.kinematics.alt)} m`;
    this.machEl.textContent = `M ${circState.kinematics.mach.toFixed(2)}`;
    this.headingEl.textContent = `${circState.kinematics.heading.toFixed(1)}°`;

    this.consensusVarianceEl.textContent = circState.consensusVariance.toFixed(5);
    this.consensusIntegrityEl.textContent = `${circState.consensusIntegrity.toFixed(2)}%`;

    // Circumnavigation Subsystem Cards
    circState.subsystems.forEach((sys, i) => {
      const errEl = document.getElementById(`circ-${i}-err`);
      const wtEl = document.getElementById(`circ-${i}-wt`);
      const barEl = document.getElementById(`circ-${i}-bar`);
      const statEl = document.getElementById(`circ-${i}-stat`);

      if (errEl) errEl.textContent = `±${sys.errorMeters.toFixed(2)}m`;
      if (wtEl) wtEl.textContent = `${(sys.weight * 100).toFixed(1)}%`;
      if (barEl) barEl.style.width = `${sys.weight * 100}%`;
      if (statEl) {
        statEl.textContent = sys.status;
        statEl.className = `circ-status-badge ${sys.status === 'DIVERGE' ? 'badge-diverge' : sys.status === 'DISSIM' ? 'badge-dissim' : 'badge-sync'}`;
      }
    });

    // Entropy Gauge
    this.entropyValEl.textContent = `${(entropyLvl * 100).toFixed(1)}%`;
    this.entropyBarFillEl.style.width = `${Math.min(100, entropyLvl * 100)}%`;
    if (entropyLvl > 0.65) {
      this.entropyValEl.className = 'entropy-val-highlight critical';
    } else {
      this.entropyValEl.className = 'entropy-val-highlight';
    }

    // Benchmark Counters
    const metrics = this.dumper.getMetrics();
    this.dumpRateEl.textContent = `${metrics.throughput.toLocaleString()} vec/s`;
    this.dumpLatencyEl.textContent = `${metrics.latency.toFixed(2)} ms`;
    this.bufferUtilEl.textContent = `${metrics.utilization}%`;
  }
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new AMRTDSApplication();
});
