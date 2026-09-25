/**
 * A.M.R.T.D.S. // THREAT ALLEGIANCE MATRIX (IFF MODE-5 / ENHANCED)
 * Maintains 3D spatial tracks for Hostile, Friendly, Dissimulated Ghost, and Neutral assets.
 * Computes kinetic intercept vectors, kill probabilities (Pk), and targeting reticle states.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class ThreatAllegianceMatrix {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.selectedTargetId = null;
    this.lockedTargetId = null;
    this.filterMode = 'ALL'; // ALL, HOSTILE, FRIENDLY, DISSIM, NEUTRAL

    this.targets = [
      {
        id: 'TGT-884-H',
        callsign: 'APEX-VECTOR-01',
        allegiance: 'HOSTILE',
        bearing: 42.4,
        elevation: 8.5,
        rangeKm: 84.2,
        velocityMach: 4.8,
        rcsDb: 1.45,
        pk: 0.94,
        ttiSec: 28.4,
        entropy: 0.72,
        isGhost: false,
        purged: false,
        lat: 34.42,
        lon: -117.85
      },
      {
        id: 'TGT-912-H',
        callsign: 'HYPERSONIC-GLIDE-9',
        allegiance: 'HOSTILE',
        bearing: 312.1,
        elevation: 14.2,
        rangeKm: 142.0,
        velocityMach: 6.2,
        rcsDb: 0.82,
        pk: 0.88,
        ttiSec: 41.2,
        entropy: 0.85,
        isGhost: false,
        purged: false,
        lat: 34.90,
        lon: -118.95
      },
      {
        id: 'GHOST-04-D',
        callsign: 'DRFM-PHANTOM-A',
        allegiance: 'DISSIM',
        bearing: 48.0,
        elevation: 9.1,
        rangeKm: 82.0,
        velocityMach: 4.8,
        rcsDb: 3.20,
        pk: 0.12,
        ttiSec: 0.0,
        entropy: 0.94,
        isGhost: true,
        purged: false,
        lat: 34.40,
        lon: -117.80
      },
      {
        id: 'GHOST-09-D',
        callsign: 'DRFM-PHANTOM-B',
        allegiance: 'DISSIM',
        bearing: 318.5,
        elevation: 15.0,
        rangeKm: 139.5,
        velocityMach: 6.1,
        rcsDb: 2.80,
        pk: 0.08,
        ttiSec: 0.0,
        entropy: 0.91,
        isGhost: true,
        purged: false,
        lat: 34.88,
        lon: -118.90
      },
      {
        id: 'ALLY-104-F',
        callsign: 'AEGIS-SHIELD-V',
        allegiance: 'FRIENDLY',
        bearing: 184.2,
        elevation: -2.4,
        rangeKm: 42.6,
        velocityMach: 1.8,
        rcsDb: 4.10,
        pk: 0.0,
        ttiSec: 0.0,
        entropy: 0.05,
        isGhost: false,
        purged: false,
        lat: 33.72,
        lon: -118.25
      },
      {
        id: 'ALLY-220-F',
        callsign: 'ORBITAL-RELAY-9',
        allegiance: 'FRIENDLY',
        bearing: 220.8,
        elevation: 48.2,
        rangeKm: 320.0,
        velocityMach: 7.4,
        rcsDb: 1.20,
        pk: 0.0,
        ttiSec: 0.0,
        entropy: 0.02,
        isGhost: false,
        purged: false,
        lat: 33.10,
        lon: -119.20
      },
      {
        id: 'NEUT-502-N',
        callsign: 'STRATO-BEACON-X',
        allegiance: 'NEUTRAL',
        bearing: 110.5,
        elevation: 3.1,
        rangeKm: 115.4,
        velocityMach: 0.8,
        rcsDb: 6.40,
        pk: 0.0,
        ttiSec: 0.0,
        entropy: 0.10,
        isGhost: false,
        purged: false,
        lat: 33.85,
        lon: -117.15
      }
    ];

    this.selectedTargetId = 'TGT-884-H';
    this.lockedTargetId = 'TGT-884-H';

    this.init();
  }

  init() {
    this.eventBus.on('remnant:wavefrontFired', () => {
      this.purgeDissimulatedDecoys();
    });

    this.eventBus.on('remnant:dissimToggled', ({ active }) => {
      if (active) {
        this.deployFriendlyDissimSwarm();
      } else {
        this.collapseFriendlyDissimSwarm();
      }
    });
  }

  update(deltaSec, missionTimeSec) {
    // Dynamic trajectory simulation
    this.targets.forEach(tgt => {
      if (tgt.purged) return;

      // Hostiles close in
      if (tgt.allegiance === 'HOSTILE') {
        tgt.rangeKm = Math.max(12, tgt.rangeKm - tgt.velocityMach * 0.34 * deltaSec);
        tgt.ttiSec = Math.max(1.2, tgt.rangeKm / (tgt.velocityMach * 0.34));
      } else if (tgt.allegiance === 'DISSIM' && tgt.isGhost) {
        tgt.rangeKm = Math.max(10, tgt.rangeKm - tgt.velocityMach * 0.34 * deltaSec);
      }
    });
  }

  purgeDissimulatedDecoys() {
    this.targets.forEach(tgt => {
      if (tgt.allegiance === 'DISSIM' && tgt.isGhost) {
        tgt.purged = true;
      }
    });
    this.eventBus.emit('allegiance:targetsPurged', { count: 2 });
  }

  deployFriendlyDissimSwarm() {
    const ghostId = `SWARM-GHOST-${Math.floor(Math.random() * 900 + 100)}`;
    this.targets.push({
      id: ghostId,
      callsign: 'REMNANT-GHOST-1',
      allegiance: 'DISSIM',
      bearing: 160.0 + (Math.random() - 0.5) * 40,
      elevation: 5.0,
      rangeKm: 25.0,
      velocityMach: 3.4,
      rcsDb: 8.5,
      pk: 0.0,
      ttiSec: 0.0,
      entropy: 0.15,
      isGhost: true,
      purged: false,
      isFriendlyDecoy: true
    });
  }

  collapseFriendlyDissimSwarm() {
    this.targets = this.targets.filter(t => !t.isFriendlyDecoy);
  }

  selectTarget(id) {
    this.selectedTargetId = id;
    this.eventBus.emit('target:selected', this.getTargetById(id));
  }

  lockTarget(id) {
    this.lockedTargetId = (this.lockedTargetId === id) ? null : id;
    this.eventBus.emit('target:locked', { id: this.lockedTargetId, target: this.getTargetById(id) });
  }

  getTargetById(id) {
    return this.targets.find(t => t.id === id);
  }

  setFilter(filter) {
    this.filterMode = filter;
  }

  getFilteredTargets() {
    return this.targets.filter(t => {
      if (t.purged) return false;
      if (this.filterMode === 'ALL') return true;
      return t.allegiance === this.filterMode;
    });
  }

  getAllTargets() {
    return this.targets;
  }
}
