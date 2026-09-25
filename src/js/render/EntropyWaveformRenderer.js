/**
 * A.M.R.T.D.S. // ENTROPY WAVEFORM RENDERER
 * Real-time RF spectral chaos and phase coherence oscilloscope.
 * Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
 */

export class EntropyWaveformRenderer {
  constructor(canvas, entropyEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entropyEngine = entropyEngine;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const buffer = this.entropyEngine.getWaveform();
    const entropy = this.entropyEngine.getEntropyLevel();

    ctx.clearRect(0, 0, this.width, this.height);

    // Center Zero-line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Color transitions based on entropy severity
    let strokeColor = '#00f0ff';
    if (entropy > 0.65) {
      strokeColor = '#ff003c';
    } else if (entropy > 0.40) {
      strokeColor = '#ffb703';
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();

    const sliceWidth = this.width / buffer.length;
    let x = 0;

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i];
      const y = (this.height / 2) + v * (this.height * 0.38);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    // Glow Effect
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }
}
