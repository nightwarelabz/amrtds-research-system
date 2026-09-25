/**
 * A.M.R.T.D.S. // FRONTAL GLOBE & GEODESIC RADAR RENDERER
 * 3D Spherical Projection Radar Horizon with dynamic sweep, entropy clutter,
 * and kinetic threat vectors virtually witnessed by humanic eyesight.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class FrontalGlobeRenderer {
  constructor(canvas, circumnav, entropyEngine, threatMatrix) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.circumnav = circumnav;
    this.entropyEngine = entropyEngine;
    this.threatMatrix = threatMatrix;

    // View & Camera Parameters
    this.rotX = 0.22; // Pitch tilt
    this.rotY = 0.0;  // Azimuth rotation
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.sphereRadius = 240;

    // Radar Sweep Parameters
    this.sweepAngle = 0;
    this.sweepSpeed = 1.8; // Rad/sec

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.rotY += dx * 0.006;
      this.rotX = Math.max(-1.1, Math.min(1.1, this.rotX + dy * 0.006));
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;

      this.rotY += dx * 0.006;
      this.rotX = Math.max(-1.1, Math.min(1.1, this.rotX + dy * 0.006));
    });
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.sphereRadius = Math.min(this.width, this.height) * 0.42;
  }

  render(deltaSec, missionTimeSec) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    // Update sweep beam
    this.sweepAngle = (this.sweepAngle + this.sweepSpeed * deltaSec) % (Math.PI * 2);

    // 1. Draw Horizon Glow & Optical Vignette
    this.drawAtmosphere(ctx);

    // 2. Draw 3D Geodesic Spherical Wireframe Grid
    this.drawGeodesicSphere(ctx);

    // 3. Draw Radar Range Rings & Azimuth Crosshairs
    this.drawTacticalRangeRings(ctx);

    // 4. Draw Rotating Radar Sweep Beam
    this.drawRadarSweepBeam(ctx);

    // 5. Draw Dynamic Entropy Clutter Field
    this.drawEntropyClutter(ctx);

    // 6. Draw Targets & Intercept Geometry
    this.drawTargetTracks(ctx);

    // 7. Draw Elimination Wavefront (if active)
    this.drawEliminationWavefront(ctx);

    // 8. Draw Reticle Center and Optical Brackets
    this.drawCenterOptics(ctx);
  }

  drawAtmosphere(ctx) {
    const grad = ctx.createRadialGradient(this.cx, this.cy, this.sphereRadius * 0.2, this.cx, this.cy, this.sphereRadius * 1.05);
    grad.addColorStop(0, 'rgba(0, 45, 75, 0.25)');
    grad.addColorStop(0.7, 'rgba(0, 20, 40, 0.55)');
    grad.addColorStop(1, 'rgba(2, 6, 12, 0.95)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.sphereRadius, 0, Math.PI * 2);
    ctx.fill();

    // Outer Rim Glow
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  project3D(x, y, z) {
    // Rotate Y (Azimuth)
    let cosY = Math.cos(this.rotY);
    let sinY = Math.sin(this.rotY);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // Rotate X (Pitch)
    let cosX = Math.cos(this.rotX);
    let sinX = Math.sin(this.rotX);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    // Orthographic / Slight Weak Perspective
    const fov = 800;
    const scale = fov / (fov + z2);
    return {
      screenX: this.cx + x1 * scale,
      screenY: this.cy - y2 * scale,
      visible: z2 > -this.sphereRadius * 0.4,
      zDepth: z2
    };
  }

  drawGeodesicSphere(ctx) {
    const R = this.sphereRadius;
    ctx.save();

    // Latitudinal Rings
    const latSteps = 6;
    for (let i = -latSteps; i <= latSteps; i++) {
      const lat = (i / latSteps) * (Math.PI / 2);
      const ringR = R * Math.cos(lat);
      const ringY = R * Math.sin(lat);

      ctx.beginPath();
      let first = true;
      const segs = 48;
      for (let j = 0; j <= segs; j++) {
        const lon = (j / segs) * Math.PI * 2;
        const px = ringR * Math.cos(lon);
        const pz = ringR * Math.sin(lon);
        const proj = this.project3D(px, ringY, pz);

        if (proj.visible) {
          if (first) {
            ctx.moveTo(proj.screenX, proj.screenY);
            first = false;
          } else {
            ctx.lineTo(proj.screenX, proj.screenY);
          }
        } else {
          first = true;
        }
      }
      ctx.strokeStyle = i === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = i === 0 ? 1.2 : 0.6;
      ctx.stroke();
    }

    // Longitudinal Meridians
    const lonSteps = 12;
    for (let i = 0; i < lonSteps; i++) {
      const lon = (i / lonSteps) * Math.PI * 2;
      ctx.beginPath();
      let first = true;
      const segs = 36;
      for (let j = 0; j <= segs; j++) {
        const lat = ((j / segs) - 0.5) * Math.PI;
        const px = R * Math.cos(lat) * Math.cos(lon);
        const py = R * Math.sin(lat);
        const pz = R * Math.cos(lat) * Math.sin(lon);
        const proj = this.project3D(px, py, pz);

        if (proj.visible) {
          if (first) {
            ctx.moveTo(proj.screenX, proj.screenY);
            first = false;
          } else {
            ctx.lineTo(proj.screenX, proj.screenY);
          }
        } else {
          first = true;
        }
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawTacticalRangeRings(ctx) {
    const R = this.sphereRadius;
    const rings = [0.33, 0.66, 1.0];
    const labels = ['50 KM', '150 KM', '300 KM'];

    ctx.save();
    rings.forEach((rRatio, idx) => {
      const ringPx = R * rRatio;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, ringPx, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 2 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 240, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Range text
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.font = '8px monospace';
      ctx.fillText(labels[idx], this.cx + 6, this.cy - ringPx + 10);
    });

    // Azimuth Crosshairs
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(this.cx - R, this.cy);
    ctx.lineTo(this.cx + R, this.cy);
    ctx.moveTo(this.cx, this.cy - R);
    ctx.lineTo(this.cx, this.cy + R);
    ctx.stroke();

    ctx.restore();
  }

  drawRadarSweepBeam(ctx) {
    const R = this.sphereRadius;
    ctx.save();

    const beamWidth = 0.45; // Radians
    const grad = ctx.createConicGradient(this.sweepAngle, this.cx, this.cy);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
    grad.addColorStop(beamWidth, 'rgba(0, 240, 255, 0.0)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Leading Edge Ray
    const leadX = this.cx + Math.cos(this.sweepAngle) * R;
    const leadY = this.cy + Math.sin(this.sweepAngle) * R;
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(leadX, leadY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  drawEntropyClutter(ctx) {
    const clutter = this.entropyEngine.getClutter();
    const R = this.sphereRadius;

    ctx.save();
    clutter.forEach(c => {
      if (c.purged) return;

      const normDist = (c.distanceKm / 300) * R;
      const rad = (c.azimuth * Math.PI) / 180;
      const px = Math.cos(rad) * normDist;
      const pz = Math.sin(rad) * normDist;
      const py = (c.elevation / 90) * R * 0.4;

      const proj = this.project3D(px, py, pz);
      if (proj.visible) {
        // High entropy flicker
        const alpha = 0.3 + Math.random() * 0.4;
        ctx.fillStyle = `rgba(224, 64, 251, ${alpha})`;
        ctx.fillRect(proj.screenX - 1.5, proj.screenY - 1.5, 3, 3);
      }
    });
    ctx.restore();
  }

  drawTargetTracks(ctx) {
    const targets = this.threatMatrix.getFilteredTargets();
    const R = this.sphereRadius;
    const selectedId = this.threatMatrix.selectedTargetId;
    const lockedId = this.threatMatrix.lockedTargetId;

    ctx.save();
    targets.forEach(tgt => {
      const normDist = (tgt.rangeKm / 300) * R;
      const azRad = (tgt.bearing * Math.PI) / 180;
      const elRad = (tgt.elevation * Math.PI) / 180;

      const px = Math.cos(azRad) * Math.cos(elRad) * normDist;
      const py = Math.sin(elRad) * normDist;
      const pz = Math.sin(azRad) * Math.cos(elRad) * normDist;

      const proj = this.project3D(px, py, pz);
      if (!proj.visible) return;

      const isLocked = tgt.id === lockedId;
      const isSelected = tgt.id === selectedId;

      // Color coding based on allegiance
      let color = '#00f0ff';
      let glowColor = 'rgba(0, 240, 255, 0.4)';
      if (tgt.allegiance === 'HOSTILE') {
        color = '#ff003c';
        glowColor = 'rgba(255, 0, 60, 0.5)';
      } else if (tgt.allegiance === 'FRIENDLY') {
        color = '#00ff9d';
        glowColor = 'rgba(0, 255, 157, 0.4)';
      } else if (tgt.allegiance === 'DISSIM') {
        color = '#e040fb';
        glowColor = 'rgba(224, 64, 251, 0.5)';
      } else if (tgt.allegiance === 'NEUTRAL') {
        color = '#ffb703';
        glowColor = 'rgba(255, 183, 3, 0.4)';
      }

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;

      // Target Vector Dot & Velocity Lead
      ctx.beginPath();
      ctx.arc(proj.screenX, proj.screenY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Velocity line
      const velVectorLen = tgt.velocityMach * 4;
      ctx.beginPath();
      ctx.moveTo(proj.screenX, proj.screenY);
      ctx.lineTo(proj.screenX + Math.cos(azRad) * velVectorLen, proj.screenY - Math.sin(elRad) * velVectorLen);
      ctx.stroke();

      // Threat Reticle Brackets
      const boxSize = isLocked ? 14 : 9;
      ctx.strokeRect(proj.screenX - boxSize, proj.screenY - boxSize, boxSize * 2, boxSize * 2);

      if (isLocked) {
        // Rotating Diamond Lock Reticle
        ctx.save();
        ctx.translate(proj.screenX, proj.screenY);
        ctx.rotate(Date.now() * 0.002);
        ctx.strokeStyle = '#ff003c';
        ctx.strokeRect(-boxSize * 1.3, -boxSize * 1.3, boxSize * 2.6, boxSize * 2.6);
        ctx.restore();
      }

      // Metadata Tag
      ctx.font = '8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tgt.callsign, proj.screenX + boxSize + 4, proj.screenY - 2);

      ctx.fillStyle = color;
      ctx.font = '7.5px monospace';
      const meta = `${tgt.rangeKm.toFixed(1)}km | M${tgt.velocityMach.toFixed(1)} | Pk:${(tgt.pk * 100).toFixed(0)}%`;
      ctx.fillText(meta, proj.screenX + boxSize + 4, proj.screenY + 8);
    });

    ctx.restore();
  }

  drawEliminationWavefront(ctx) {
    if (!this.entropyEngine.eliminationWaveActive) return;
    const radiusPx = this.entropyEngine.wavefrontRadius * this.sphereRadius * 1.5;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, radiusPx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.stroke();

    // Trailing Shockwave
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, Math.max(0, radiusPx - 15), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  drawCenterOptics(ctx) {
    ctx.save();
    // Boresight crosshair
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.cx - 8, this.cy);
    ctx.lineTo(this.cx + 8, this.cy);
    ctx.moveTo(this.cx, this.cy - 8);
    ctx.lineTo(this.cx, this.cy + 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 12, 0, Math.PI * 2);
    ctx.setLineDash([2, 3]);
    ctx.stroke();

    ctx.restore();
  }
}
