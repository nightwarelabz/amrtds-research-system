/**
 * A.M.R.T.D.S. // COOPERATIVE CIRCUMNAVIGATION ARRAY
 * Operates 5 simultaneous, cooperative navigation systems:
 * 1. INS-RLG: Relativistic Ring Laser Gyro
 * 2. STELL-EPHEM: Celestial Star-Tracker Ephemeris
 * 3. MAG-GRAV: Crustal Geomagnetic & Gravimetric Gradient
 * 4. TERCOM-SAR: Synthetic Aperture Contour Radar
 * 5. DISSIM-SWARM: Swarm-Relative Ghost Vectoring
 * Fused via Kalman-Bucy Consensus Matrix.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class CircumnavigationArray {
  constructor(eventBus) {
    this.eventBus = eventBus;

    // Platform State (Simulated Kinematics)
    this.kinematics = {
      lat: 34.0522, // Base origin
      lon: -118.2437,
      alt: 18450, // Meters
      heading: 142.6, // Degrees
      pitch: 2.1,
      roll: -0.8,
      mach: 3.42, // Hypersonic cruise
      velocity: 1164.2 // m/s
    };

    // 5 Cooperative Subsystems
    this.subsystems = [
      {
        id: 'CIRC-1: INS-RLG',
        name: 'Relativistic Ring-Laser Gyro',
        rate: '2000 Hz',
        drift: 0.00015, // deg/hr
        errorMeters: 0.42,
        weight: 0.28,
        status: 'SYNC',
        entropy: 0.04
      },
      {
        id: 'CIRC-2: STELL-EPHEM',
        name: 'Celestial Star Ephemeris',
        rate: '20 Hz',
        drift: 0.00001,
        errorMeters: 0.18,
        weight: 0.26,
        status: 'SYNC',
        entropy: 0.08
      },
      {
        id: 'CIRC-3: MAG-GRAV',
        name: 'Crustal Mag & Gravimetric',
        rate: '50 Hz',
        drift: 0.00020,
        errorMeters: 0.95,
        weight: 0.20,
        status: 'SYNC',
        entropy: 0.12
      },
      {
        id: 'CIRC-4: TERCOM-SAR',
        name: 'Terrain SAR Contour Lock',
        rate: '10 Hz',
        drift: 0.00008,
        errorMeters: 0.28,
        weight: 0.16,
        status: 'SYNC',
        entropy: 0.15
      },
      {
        id: 'CIRC-5: DISSIM-SWARM',
        name: 'Swarm Dissimulation Mesh',
        rate: '100 Hz',
        drift: 0.00040,
        errorMeters: 1.10,
        weight: 0.10,
        status: 'SYNC',
        entropy: 0.22
      }
    ];

    this.consensusVariance = 0.0034;
    this.consensusIntegrity = 99.88; // %
    this.jammingActive = false;

    this.init();
  }

  init() {
    this.eventBus.on('entropy:update', (entropy) => {
      this.updateFromEntropy(entropy);
    });

    this.eventBus.on('remnant:dissimToggled', ({ active }) => {
      const swarmSys = this.subsystems.find(s => s.id.includes('DISSIM-SWARM'));
      if (swarmSys) {
        swarmSys.status = active ? 'DISSIM' : 'SYNC';
        swarmSys.weight = active ? 0.32 : 0.10;
        this.normalizeWeights();
      }
    });
  }

  update(deltaSec, missionTimeSec) {
    // Traverse platform along trajectory
    const speedDegPerSec = 0.0018;
    this.kinematics.lat += Math.cos(this.kinematics.heading * Math.PI / 180) * speedDegPerSec * deltaSec;
    this.kinematics.lon += Math.sin(this.kinematics.heading * Math.PI / 180) * speedDegPerSec * deltaSec;
    
    // Slight attitude oscillations
    this.kinematics.heading = (this.kinematics.heading + Math.sin(missionTimeSec * 0.4) * 0.05) % 360;
    this.kinematics.pitch = Math.sin(missionTimeSec * 0.8) * 1.5;
    this.kinematics.roll = Math.cos(missionTimeSec * 0.6) * 2.2;

    // Simulate sensor drift micro-fluctuations
    this.subsystems.forEach((sys, idx) => {
      const noise = (Math.random() - 0.5) * 0.02;
      sys.errorMeters = Math.max(0.05, sys.errorMeters + noise * (idx + 1) * 0.1);
    });

    this.recomputeConsensus();
  }

  updateFromEntropy(entropy) {
    // If high entropy (jamming), SAR and SWARM suffer higher noise
    const sar = this.subsystems.find(s => s.id.includes('TERCOM-SAR'));
    const rlg = this.subsystems.find(s => s.id.includes('INS-RLG'));
    const mag = this.subsystems.find(s => s.id.includes('MAG-GRAV'));

    if (entropy > 0.55) {
      if (sar) {
        sar.entropy = Math.min(0.95, entropy * 1.2);
        sar.status = entropy > 0.7 ? 'DIVERGE' : 'SYNC';
      }
      // Rely more on passive MAG-GRAV and Relativistic INS
      if (rlg) rlg.weight = 0.40;
      if (mag) mag.weight = 0.35;
      if (sar) sar.weight = 0.05;
    } else {
      if (sar) {
        sar.entropy = 0.15;
        sar.status = 'SYNC';
      }
      this.resetNominalWeights();
    }

    this.normalizeWeights();
    this.recomputeConsensus();
  }

  resetNominalWeights() {
    this.subsystems[0].weight = 0.28;
    this.subsystems[1].weight = 0.26;
    this.subsystems[2].weight = 0.20;
    this.subsystems[3].weight = 0.16;
    this.subsystems[4].weight = 0.10;
  }

  normalizeWeights() {
    const sum = this.subsystems.reduce((acc, s) => acc + s.weight, 0);
    this.subsystems.forEach(s => s.weight /= sum);
  }

  recomputeConsensus() {
    let weightedError = 0;
    this.subsystems.forEach(s => {
      weightedError += s.errorMeters * s.weight;
    });
    this.consensusVariance = weightedError * 0.008;
    this.consensusIntegrity = Math.max(88.0, 100.0 - weightedError * 2.5);
  }

  injectSensorJamming() {
    this.jammingActive = !this.jammingActive;
    if (this.jammingActive) {
      this.updateFromEntropy(0.82);
    } else {
      this.updateFromEntropy(0.20);
    }
    return this.jammingActive;
  }

  getConsensusState() {
    return {
      kinematics: { ...this.kinematics },
      subsystems: this.subsystems.map(s => ({ ...s })),
      consensusVariance: this.consensusVariance,
      consensusIntegrity: this.consensusIntegrity
    };
  }
}
