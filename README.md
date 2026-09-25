# A.M.R.T.D.S. // PROJECT CHRONO-VECTOR
### Automated Military Radar Targeting & Dissimulation System
**SECURITY CLASSIFICATION:** `RESTRICTED // RESEARCH-SYSTEM-ONLY // SPEC-884-HUD`  
**SOVEREIGN CORE:** `REMNANT-AUTONOMOUS-CORE-07`  

---

## 1. SYSTEM OVERVIEW

The **Automated Military Radar Targeting & Dissimulation System (AMRTDS)** is a simulation visual containment system engineered for autonomous military strike-reconnaissance robots. The platform operates five cooperative circumnavigation systems simultaneously to navigate hostile planetary terrain under total GPS and communications denial, while employing an AI-driven radar targeting and electronic dissimulation matrix.

```
       +=======================================================+
       |             A.M.R.T.D.S. AUTONOMOUS STACK             |
       +=======================================================+
       |  PERIPHERAL LAYERS: Human Links / Uplinks / Comms     |
       |  ---------------------------------------------------  |
       |  MIDDLEWARE: Cooperative Circumnavigation (x5 Array)  |
       |  ---------------------------------------------------  |
       |  TACTICAL CORE: Radar Targeting & Allegiance (IFF)    |
       |  ===================================================  |
       |  >>> [ THE REMNANT ] - INVIOLABLE SOVEREIGN CORE <<<  |
       |      - Dynamic Entropy Elimination Wavefront          |
       |      - Autonomous Dissimulative Vectoring             |
       |      - 120s / 300s Mission Envelope Continuation      |
       |      - Microsecond Forensic Telemetry Crystallization |
       +=======================================================+
```

---

## 2. KEY ARCHITECTURAL PILLARS

### I. The 5 Simultaneous, Cooperative Circumnavigation Systems
Traversing contested theaters without GNSS requires cooperative consensus across distinct physical modalities:
1. **CIRC-1: INS-RLG** (Relativistic Ring Laser Gyro): Monolithic glass-ceramic cavity providing 2,000 Hz dead-reckoning.
2. **CIRC-2: STELL-EPHEM** (Exo-Atmospheric Celestial Star Tracker): 48,000-star catalog triangulation correcting long-term drift.
3. **CIRC-3: MAG-GRAV** (Lithospheric Geomagnetic & Gravimetric Gradient): Passive SQUID quantum sensor mapping crustal anomalies; zero RF signature.
4. **CIRC-4: TERCOM-SAR** (Topographic Synthetic Aperture Radar): Millimeter-wave contour correlation against elevation models.
5. **CIRC-5: DISSIM-SWARM** (Swarm Relative Ghost Vectoring): Mesh positioning relative to active dissimulated phantom nodes.

*Fused via a dynamic Kalman-Bucy Consensus Matrix calculating real-time covariance and variance weighting.*

### II. Conception of "The Remnant" and Its Responsibility
The **Remnant** is the sovereign autonomous black-box fail-safe core. When communications are severed or electronic warfare is detected:
- **Autonomous Stewardship:** Prevents sensory divergence across the circumnavigation array.
- **Dynamic Entropy Elimination:** Analyzes ambient spectral entropy ($H(X)$); fires anti-entropy wavefronts to collapse DRFM decoys.
- **Active Dissimulation Cloak:** Synthesizes phantom radar cross-sections along divergent corridors to misdirect hostile interceptors.
- **Forensic Telemetry Crystallization:** Streams microsecond memory states into non-volatile optical registers for computational analysis.

### III. Visual Containment System ("HUD") for Humanic Eyesight
- **3D Frontal Globe Radar Grid:** Geodesic spherical projection with pitch ladder, azimuth compass tape, range rings (50km to 300km), and rotating radar sweep beam.
- **Dynamic Allegiance & Threat Matrix (IFF Mode-5):** Color-coded tracking (Hostile Crimson, Friendly Emerald, Dissimulated Magenta, Neutral Amber) with Mach speed, range, and Time-To-Impact (TTI) vectors.
- **Dynamic Entropy Detection Scope:** Real-time Shannon entropy gauge and RF spectral chaos oscilloscope.
- **Dual Timescale Playback:**
  - **120-Second Locale Window:** High-speed kinetic engagement cycle.
  - **300-Second (5-Minute) Matrix:** Macro circumnavigation traverse.

### IV. Blazingly Fast System Dumps
- Microsecond-precision streaming memory view running at **12,000+ vectors/second**.
- Zero-latency buffer inspection with one-click export to formatted **JSON** and **CSV** datasets.

---

## 3. FILE AND DIRECTORY ORGANIZATION

```
/home/ckb/amrtds-research-system/
├── index.html                   # Master Tactical HUD Containment Interface
├── launch_system.py             # Python HTTP server & automated browser launcher
├── package.json                 # Node.js runner configuration
├── README.md                    # System documentation & manual
├── docs/
│   ├── REMNANT_RESPONSIBILITY_CHARTER.md   # Remnant doctrine & fail-safe specification
│   ├── CIRCUMNAVIGATION_MATRICES.md        # Mathematical specifications of the 5 circumnav engines
│   └── ENTROPY_ELIMINATION_ECCM.md         # Spectral entropy detection & elimination equations
├── src/
│   ├── css/
│   │   ├── amrtds-hud.css                  # High-density aerospace tactical HUD styling
│   │   ├── tactical-grid.css               # Geodesic grid & reticle overlays styling
│   │   └── telemetry-dump.css              # Blazingly fast data terminal & dump panels
│   ├── js/
│   │   ├── app.js                          # Master HUD orchestrator & main 60 FPS loop
│   │   ├── core/
│   │   │   ├── RemnantCore.js              # Sovereign fail-safe state machine & logs
│   │   │   ├── CircumnavigationArray.js    # 5 cooperative circumnav systems & Kalman consensus
│   │   │   ├── EntropyEliminator.js        # Dynamic entropy calculation & wavefront purge
│   │   │   └── ThreatAllegianceMatrix.js   # IFF targets, kinematics, and locks
│   │   └── render/
│   │       ├── FrontalGlobeRenderer.js     # 3D Geodesic spherical radar canvas
│   │       ├── EntropyWaveformRenderer.js  # Live spectral chaos oscilloscope
│   │       └── AudioSynthesizer.js         # Procedural defense audio feedback (Web Audio)
│   └── telemetry/
│       ├── HighSpeedDataDumper.js          # Microsecond ring buffer & export engine
│       └── TimelineController.js           # 120s / 300s dual temporal controller
└── data/
    └── sample_telemetry_dump.json          # Pre-recorded baseline research dataset
```

---

## 4. QUICK START INSTRUCTIONS

### Option A: Python Launcher (Recommended)
```bash
cd /home/ckb/amrtds-research-system
python3 launch_system.py
```
*Automatically starts the local server at `http://localhost:8088` and launches your default browser.*

### Option B: Node.js / NPM
```bash
cd /home/ckb/amrtds-research-system
npm run serve
```

### Option C: Direct File Access
Simply open `/home/ckb/amrtds-research-system/index.html` in Firefox or any modern web browser.

---

## 5. INTERACTIVE CONTROLS REFERENCE

| Control | Action |
|---|---|
| **Rotate 3D Radar Globe** | Click and drag across the central radar viewport |
| **Play / Pause Timeline** | Click `PAUSE` / `PLAY` button or scrub the timeline slider |
| **120s / 300s Timescale** | Switch between 120-second engagement and 5-minute circumnavigation |
| **Purge Wavefront** | Click `★ PURGE WAVEFRONT` to fire the anti-entropy elimination wave |
| **Inject Jamming** | Click `⚡ INJECT JAMMING` to test high-entropy EW noise response |
| **Dissimulation Cloak** | Toggle `◆ DISSIMULATION CLOAK` to deploy synthetic ghost decoys |
| **Target Lock** | Click any target card in the right bay to acquire dynamic lock |
---

## 6. SIMULATION VIDEO DEMO & AUDIBLE TELEMETRY

A standalone broadcast-grade MP4 demonstration (`amrtds_simulation_demo.mp4`) is generated using procedural mathematical audio synthesis and real-time canvas rendering:
- **Audio Frequencies:** 60Hz avionics power carrier, 1420Hz Ka-band radar sweep pings, 2600Hz heterodyne EW jamming whistle.
- **Audible Control Panel Sounds:** High-tech tactile relays, console mode switches, confirmation beeps.
- **Tracing & Tracking:** Pulse-Doppler tracking cadence (12 Hz pulse) and escalating two-tone target lock siren (880 Hz / 1760 Hz).
- **Attack & Elimination:** Anti-Entropy Wavefront sub-bass discharge blast (45 Hz -> 25 Hz), kinetic interceptor rocket ignition roar, and hypersonic kinetic impact detonation.

To re-generate or customize the demo:
```bash
python3 generate_amrtds_demo.py
```

---
**RESEARCH-SYSTEM-ONLY**: Strictly For Computational Simulation & Research Analysis.
