#!/usr/bin/env python3
"""
A.M.R.T.D.S. // TACTICAL SIMULATION VIDEO & AUDIO GENERATOR
Produces a high-fidelity MP4 demo with multi-channel audio frequencies,
audible control panel sounds, pulse-Doppler tracking, and kinetic attack audio.
Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
"""

import os
import sys
import math
import time
import subprocess
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================
OUTPUT_DIR = "/home/ckb/amrtds-research-system"
MP4_OUTPUT = os.path.join(OUTPUT_DIR, "amrtds_simulation_demo.mp4")
WAV_OUTPUT = os.path.join(OUTPUT_DIR, "amrtds_demo_audio.wav")

WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION_SEC = 30.0
TOTAL_FRAMES = int(FPS * DURATION_SEC)
SAMPLE_RATE = 44100

# Color Palette
COLOR_BG = (3, 7, 13)
COLOR_PANEL_BG = (7, 16, 26)
COLOR_BORDER = (0, 240, 255, 60)
COLOR_CYAN = (0, 240, 255)
COLOR_CYAN_DIM = (0, 140, 160)
COLOR_HOSTILE = (255, 0, 60)
COLOR_FRIENDLY = (0, 255, 157)
COLOR_DISSIM = (224, 64, 251)
COLOR_NEUTRAL = (255, 183, 3)
COLOR_TEXT_MAIN = (212, 244, 255)
COLOR_TEXT_MUTED = (94, 131, 158)
COLOR_TEXT_DIM = (50, 80, 104)

# Load System Font or Fallback
try:
    FONT_MONO_SM = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoMono-Regular.ttf", 10)
    FONT_MONO_MD = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoMono-Regular.ttf", 12)
    FONT_MONO_LG = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    FONT_WATERMARK = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 54)
except Exception:
    FONT_MONO_SM = ImageFont.load_default()
    FONT_MONO_MD = ImageFont.load_default()
    FONT_MONO_LG = ImageFont.load_default()
    FONT_WATERMARK = ImageFont.load_default()

# ==============================================================================
# AUDIO SYNTHESIS ENGINE (MULTI-CHANNEL FREQUENCIES & TACTICAL SOUNDS)
# ==============================================================================
def synthesize_audio(duration_sec, sample_rate):
    print("[*] Synthesizing tactical audio frequencies, tracking pings, and attack soundscapes...")
    num_samples = int(duration_sec * sample_rate)
    t = np.linspace(0, duration_sec, num_samples, False)

    # Stereo buffers
    left = np.zeros(num_samples, dtype=np.float32)
    right = np.zeros(num_samples, dtype=np.float32)

    # 1. Background Avionics Transformer Hum (60Hz + 120Hz + 180Hz)
    hum = (
        0.04 * np.sin(2 * np.pi * 60 * t) +
        0.02 * np.sin(2 * np.pi * 120 * t) +
        0.01 * np.sin(2 * np.pi * 180 * t)
    )
    left += hum
    right += hum

    # 2. Subtle RF Noise Bed (White Noise filtered)
    noise = (np.random.rand(num_samples).astype(np.float32) - 0.5) * 0.012
    left += noise
    right += noise

    # Helper: Add transient console click
    def add_click(t_pos, freq=800, dur=0.035, vol=0.25):
        start = int(t_pos * sample_rate)
        length = int(dur * sample_rate)
        if start + length > num_samples:
            return
        t_click = np.linspace(0, dur, length, False)
        env = np.exp(-t_click / (dur * 0.25))
        sig = np.sin(2 * np.pi * freq * t_click) * env * vol
        left[start:start+length] += sig
        right[start:start+length] += sig

    # Helper: Add double confirmation beep
    def add_double_beep(t_pos, freq1=1046, freq2=1318):
        add_click(t_pos, freq=freq1, dur=0.06, vol=0.18)
        add_click(t_pos + 0.08, freq=freq2, dur=0.08, vol=0.22)

    # 3. Audible Control Panel Sounds (Switch toggles & clicks at operational moments)
    panel_events = [0.4, 1.2, 5.0, 7.5, 11.0, 11.2, 17.0, 19.5, 23.0, 26.5, 28.5]
    for pt in panel_events:
        add_click(pt, freq=np.random.choice([750, 920, 1100, 640]), dur=0.03, vol=0.22)

    add_double_beep(1.0)
    add_double_beep(17.2)

    # 4. Periodic Radar Sweep Pings (every 3.6 seconds)
    sweep_period = 3.6
    for st in np.arange(0.2, duration_sec, sweep_period):
        s_idx = int(st * sample_rate)
        dur_ping = 0.25
        len_ping = int(dur_ping * sample_rate)
        if s_idx + len_ping < num_samples:
            tp = np.linspace(0, dur_ping, len_ping, False)
            f_sweep = 1420 * np.exp(-tp * 5.0)
            sig_ping = np.sin(2 * np.pi * f_sweep * tp) * np.exp(-tp / 0.06) * 0.14
            # Pan across stereo field
            left[s_idx:s_idx+len_ping] += sig_ping * 0.8
            right[s_idx:s_idx+len_ping] += sig_ping * 0.4

    # 5. Phase II (5.0s - 11.0s): High-Entropy EW Noise & Heterodyne Whistle
    ew_start = int(5.0 * sample_rate)
    ew_end = int(11.0 * sample_rate)
    ew_t = t[ew_start:ew_end] - 5.0
    # Modulated whistle
    ew_mod = np.sin(2 * np.pi * 3.5 * ew_t)
    ew_carrier = 2600 + ew_mod * 400
    ew_sig = np.sin(2 * np.pi * ew_carrier * ew_t) * 0.07
    ew_noise = (np.random.rand(len(ew_t)).astype(np.float32) - 0.5) * 0.06
    # Gated pulse alarm
    alarm_gate = (np.sin(2 * np.pi * 4.0 * ew_t) > 0.0).astype(np.float32)
    alarm_sig = np.sin(2 * np.pi * 920 * ew_t) * alarm_gate * 0.12
    left[ew_start:ew_end] += (ew_sig + ew_noise + alarm_sig)
    right[ew_start:ew_end] += (ew_sig + ew_noise + alarm_sig)

    # 6. Phase III (11.0s - 13.5s): Anti-Entropy Wavefront Elimination Discharge
    wf_start = int(10.8 * sample_rate)
    # Charge-up spool (10.8s to 11.2s)
    spool_len = int(0.4 * sample_rate)
    spool_t = np.linspace(0, 0.4, spool_len, False)
    f_spool = 60 + (spool_t / 0.4)**2 * 320
    spool_sig = np.sin(2 * np.pi * f_spool * spool_t) * (spool_t / 0.4) * 0.25
    left[wf_start:wf_start+spool_len] += spool_sig
    right[wf_start:wf_start+spool_len] += spool_sig

    # Blast explosion & anti-entropy shockwave (11.2s to 13.5s)
    blast_start = int(11.2 * sample_rate)
    blast_dur = 2.0
    blast_len = int(blast_dur * sample_rate)
    blast_t = np.linspace(0, blast_dur, blast_len, False)
    # Resonant sub-bass thump (45 Hz -> 25 Hz)
    sub_boom = np.sin(2 * np.pi * (45 - blast_t * 10) * blast_t) * np.exp(-blast_t / 0.5) * 0.55
    # High-energy discharge noise whoosh
    blast_noise = (np.random.rand(blast_len).astype(np.float32) - 0.5) * np.exp(-blast_t / 0.35) * 0.4
    # Resonant sweep
    shimmer = np.sin(2 * np.pi * 3200 * np.exp(-blast_t * 4) * blast_t) * np.exp(-blast_t / 0.25) * 0.2
    total_blast = sub_boom + blast_noise + shimmer
    left[blast_start:blast_start+blast_len] += total_blast
    right[blast_start:blast_start+blast_len] += total_blast

    # 7. Phase IV (16.5s - 23.0s): Tracing, Tracking & Target Lock Sirens
    # Pulse-Doppler tracking cadence (ch-ch-ch-ch at 12 Hz)
    track_start = int(16.5 * sample_rate)
    track_end = int(19.5 * sample_rate)
    track_t = t[track_start:track_end] - 16.5
    track_cadence = (np.sin(2 * np.pi * 12.0 * track_t) > 0.6).astype(np.float32)
    track_sig = np.sin(2 * np.pi * 2200 * track_t) * track_cadence * 0.16
    left[track_start:track_end] += track_sig
    right[track_start:track_end] += track_sig

    # High-urgency Target Lock Two-Tone Siren (19.5s - 23.0s)
    lock_start = int(19.5 * sample_rate)
    lock_end = int(23.0 * sample_rate)
    lock_t = t[lock_start:lock_end] - 19.5
    lock_mod = (np.sin(2 * np.pi * 6.25 * lock_t) > 0).astype(np.float32)
    f_lock = 880 + lock_mod * 880  # Alternates 880Hz and 1760Hz
    lock_sig = (
        np.sin(2 * np.pi * f_lock * lock_t) * 0.22 +
        0.08 * (np.sin(2 * np.pi * (f_lock * 2) * lock_t))
    )
    left[lock_start:lock_end] += lock_sig
    right[lock_start:lock_end] += lock_sig

    # 8. Phase V (23.0s - 28.0s): Attack Sounds (Kinetic Launch & Impact Detonation)
    # Missile Launch Rocket Ignition (23.0s - 24.5s)
    msl_start = int(23.0 * sample_rate)
    msl_dur = 2.0
    msl_len = int(msl_dur * sample_rate)
    msl_t = np.linspace(0, msl_dur, msl_len, False)
    msl_roar = (np.random.rand(msl_len).astype(np.float32) - 0.5) * np.exp(-msl_t / 0.8) * 0.42
    msl_tone = np.sin(2 * np.pi * (180 + msl_t * 600) * msl_t) * np.exp(-msl_t / 0.7) * 0.25
    left[msl_start:msl_start+msl_len] += (msl_roar + msl_tone)
    right[msl_start:msl_start+msl_len] += (msl_roar + msl_tone)

    # Detonation / Impact Explosion (26.5s - 29.5s)
    det_start = int(26.5 * sample_rate)
    det_dur = 3.0
    det_len = int(det_dur * sample_rate)
    det_t = np.linspace(0, det_dur, det_len, False)
    # Heavy low frequency shockwave
    det_sub = np.sin(2 * np.pi * (38 - det_t * 8) * det_t) * np.exp(-det_t / 0.9) * 0.65
    det_crack = (np.random.rand(det_len).astype(np.float32) - 0.5) * np.exp(-det_t / 0.4) * 0.6
    det_rumble = (np.random.rand(det_len).astype(np.float32) - 0.5) * np.exp(-det_t / 1.8) * 0.25
    det_sig = det_sub + det_crack + det_rumble
    left[det_start:det_start+det_len] += det_sig
    right[det_start:det_start+det_len] += det_sig

    # Resolution Confirmation Chime (28.5s)
    add_double_beep(28.5, freq1=1318, freq2=1760)

    # Normalize & Soft Clamp
    max_amp = max(np.max(np.abs(left)), np.max(np.abs(right)), 1.0)
    left = np.tanh(left / (max_amp * 0.92))
    right = np.tanh(right / (max_amp * 0.92))

    # Convert to 16-bit PCM Stereo
    left_pcm = (left * 32767).astype(np.int16)
    right_pcm = (right * 32767).astype(np.int16)
    stereo = np.empty((num_samples * 2,), dtype=np.int16)
    stereo[0::2] = left_pcm
    stereo[1::2] = right_pcm

    with wave.open(WAV_OUTPUT, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(stereo.tobytes())

    print(f"[+] Audio track synthesized successfully: {WAV_OUTPUT}")

# ==============================================================================
# VISUAL RENDERING ENGINE (TACTICAL HUD / FRONTAL GLOBE / TELEMETRY DUMPS)
# ==============================================================================
def render_frame(frame_idx, total_frames, t_sec):
    # Base Canvas
    img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # 1. Top Classification & Doctrine Bar
    draw.rectangle([0, 0, WIDTH, 24], fill=(4, 12, 20))
    draw.line([(0, 24), (WIDTH, 24)], fill=COLOR_BORDER)
    # Research badge
    draw.rectangle([10, 3, 150, 20], fill=(255, 0, 60, 60), outline=COLOR_HOSTILE)
    draw.text((16, 6), "RESEARCH-SYSTEM-ONLY", fill=(255, 60, 90), font=FONT_MONO_SM)
    draw.text((165, 6), "RESTRICTED // SPEC-884-HUD // DARPA-AMRTDS", fill=COLOR_CYAN, font=FONT_MONO_SM)
    draw.text((580, 6), "REMNANT-AUTONOMOUS-CORE-07 // ORBITAL-7", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Core indicator
    core_color = COLOR_FRIENDLY if t_sec < 5.0 or t_sec > 13.0 else COLOR_HOSTILE
    draw.ellipse([1080, 8, 1088, 16], fill=core_color)
    draw.text((1095, 6), "REMNANT: ARMED", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)
    draw.text((1215, 6), "60 FPS", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # 2. Header Bar with Timecode & Title
    draw.rectangle([0, 25, WIDTH, 75], fill=(7, 16, 26))
    draw.line([(0, 75), (WIDTH, 75)], fill=COLOR_BORDER)
    draw.text((16, 32), "A.M.R.T.D.S. // PROJECT CHRONO-VECTOR", fill=(255, 255, 255), font=FONT_MONO_LG)
    draw.text((16, 52), "AUTOMATED MILITARY RADAR TARGETING & DISSIMULATION SYSTEM", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Timecode & Timeline
    mins = int(t_sec // 60)
    secs = int(t_sec % 60)
    csecs = int((t_sec % 1) * 100)
    time_str = f"T+{mins:02d}:{secs:02d}.{csecs:02d}"
    draw.text((560, 34), time_str, fill=COLOR_CYAN, font=FONT_MONO_LG)
    draw.text((660, 37), "T_MAX: 02:00.00", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Phase text
    if t_sec < 5.0:
        phase_str = "PHASE I: INGRESS & COOPERATIVE SYNC"
    elif t_sec < 11.2:
        phase_str = "PHASE II: EW JAMMING & ENTROPY SPIKE [CRITICAL]"
    elif t_sec < 17.0:
        phase_str = "PHASE III: REMNANT ANTI-ENTROPY PURGE WAVEFRONT"
    elif t_sec < 23.0:
        phase_str = "PHASE IV: TARGET TRACKING & KINETIC LOCK ACQUISITION"
    elif t_sec < 28.0:
        phase_str = "PHASE V: KINETIC INTERCEPT STRIKE & DETONATION"
    else:
        phase_str = "PHASE VI: FORENSIC TELEMETRY CRYSTALLIZATION SEAL"
    draw.text((560, 55), phase_str, fill=COLOR_CYAN if t_sec < 5 or t_sec > 11.2 else COLOR_HOSTILE, font=FONT_MONO_SM)

    # Progress scrubber
    draw.rectangle([880, 48, 1260, 54], fill=(12, 30, 48))
    scrub_x = 880 + (t_sec / DURATION_SEC) * 380
    draw.rectangle([880, 48, int(scrub_x), 54], fill=COLOR_CYAN)
    draw.rectangle([int(scrub_x)-3, 45, int(scrub_x)+3, 57], fill=(255, 255, 255))

    # 3. Watermark (Diagonal Background)
    draw.text((290, 320), "RESEARCH-SYSTEM-ONLY", fill=(0, 240, 255, 14), font=FONT_WATERMARK)

    # 4. LEFT BAY (Kinematics + 5x Circumnav + Remnant Log)
    draw.rectangle([10, 85, 290, 600], fill=COLOR_PANEL_BG, outline=COLOR_BORDER)
    # Bay header
    draw.rectangle([10, 85, 290, 105], fill=(0, 240, 255, 20))
    draw.text((18, 90), "PLATFORM KINEMATICS", fill=COLOR_CYAN, font=FONT_MONO_SM)
    # Kinematics stats
    draw.text((18, 115), "MACH: M 3.42", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)
    draw.text((120, 115), "ALT: 18,450 m", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)
    draw.text((215, 115), f"HDG: {142.6 + math.sin(t_sec*0.4)*1.2:.1f}°", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)
    draw.text((18, 132), "POS: 34.0522°N, 118.2437°W  |  WGS-84/GEO", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)
    draw.line([(10, 148), (290, 148)], fill=COLOR_BORDER)

    # 5x Cooperative Circumnavigation Modules
    draw.text((18, 155), "COOPERATIVE CIRCUMNAV (x5)", fill=COLOR_CYAN, font=FONT_MONO_SM)

    circ_sys = [
        ("CIRC-1: INS-RLG", 0.28, "SYNC", COLOR_FRIENDLY),
        ("CIRC-2: STELL-EPHEM", 0.26, "SYNC", COLOR_FRIENDLY),
        ("CIRC-3: MAG-GRAV", 0.20, "SYNC", COLOR_FRIENDLY),
        ("CIRC-4: TERCOM-SAR", 0.16, "DIVERGE" if 5.0 <= t_sec <= 11.2 else "SYNC", COLOR_HOSTILE if 5.0 <= t_sec <= 11.2 else COLOR_FRIENDLY),
        ("CIRC-5: DISSIM-SWARM", 0.10, "DISSIM" if t_sec > 17.0 else "SYNC", COLOR_DISSIM if t_sec > 17.0 else COLOR_FRIENDLY)
    ]

    for idx, (c_name, c_wt, c_stat, c_col) in enumerate(circ_sys):
        y_c = 175 + idx * 36
        draw.rectangle([16, y_c, 284, y_c + 30], fill=(2, 10, 18), outline=(0, 240, 255, 40))
        draw.text((20, y_c + 3), c_name, fill=(255, 255, 255), font=FONT_MONO_SM)
        draw.text((235, y_c + 3), c_stat, fill=c_col, font=FONT_MONO_SM)
        # Weight bar
        draw.rectangle([20, y_c + 18, 275, y_c + 22], fill=(0, 240, 255, 30))
        draw.rectangle([20, y_c + 18, int(20 + c_wt * 255), y_c + 22], fill=c_col)

    # Kalman Consensus
    draw.rectangle([16, 360, 284, 405], fill=(0, 240, 255, 12), outline=COLOR_BORDER)
    draw.text((20, 365), "KALMAN-BUCY CONSENSUS INTEGRITY", fill=COLOR_CYAN, font=FONT_MONO_SM)
    var_val = 0.0084 if 5.0 <= t_sec <= 11.2 else 0.0034
    integ_val = 92.4 if 5.0 <= t_sec <= 11.2 else 99.88
    draw.text((20, 385), f"VARIANCE: {var_val:.5f}", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)
    draw.text((170, 385), f"LOCK: {integ_val:.2f}%", fill=COLOR_FRIENDLY, font=FONT_MONO_SM)

    # Remnant Sovereign Core Monitor
    draw.rectangle([16, 415, 284, 590], fill=(4, 10, 18), outline=COLOR_BORDER)
    draw.text((20, 420), "REMNANT SOVEREIGN CORE", fill=COLOR_CYAN, font=FONT_MONO_SM)
    # Log feeds
    logs = [
        ("[T+00.2] CONSENSUS: 5x Arrays Synced", COLOR_TEXT_MUTED),
        ("[T+05.0] SURGE: High Entropy Detected", COLOR_HOSTILE),
        ("[T+11.2] PURGE: Wavefront Discharged", COLOR_FRIENDLY),
        ("[T+17.0] ACQUIRE: Apex Hostile Isolated", COLOR_HOSTILE),
        ("[T+23.0] LAUNCH: Interceptor Away", COLOR_CYAN),
        ("[T+26.5] KILL: Kinetic Neutralization", COLOR_FRIENDLY),
    ]
    cur_log_y = 440
    for l_text, l_col in logs:
        draw.text((20, cur_log_y), l_text, fill=l_col, font=FONT_MONO_SM)
        cur_log_y += 22

    # 5. CENTER BAY (3D FRONTAL GLOBE RADAR TARGETING HUD)
    cx, cy = 640, 340
    r_globe = 220
    draw.rectangle([300, 85, 980, 600], fill=(2, 6, 12), outline=COLOR_BORDER)

    # Globe background gradient circle
    draw.ellipse([cx - r_globe, cy - r_globe, cx + r_globe, cy + r_globe], outline=COLOR_CYAN, width=2)
    draw.ellipse([cx - r_globe*0.66, cy - r_globe*0.66, cx + r_globe*0.66, cy + r_globe*0.66], outline=(0, 240, 255, 70), width=1)
    draw.ellipse([cx - r_globe*0.33, cy - r_globe*0.33, cx + r_globe*0.33, cy + r_globe*0.33], outline=(0, 240, 255, 70), width=1)

    # Geodesic latitude/longitude wireframe arcs
    rot_angle = t_sec * 0.4
    for lat_i in range(-3, 4):
        lat_r = math.cos(lat_i * 0.4) * r_globe
        lat_y = cy + math.sin(lat_i * 0.4) * r_globe * 0.35
        draw.ellipse([cx - lat_r, lat_y - lat_r*0.25, cx + lat_r, lat_y + lat_r*0.25], outline=(0, 240, 255, 30))

    # Sweeping Radar Beam (Rotating 360)
    sweep_rad = (t_sec * 1.8) % (2 * math.pi)
    beam_x = cx + math.cos(sweep_rad) * r_globe
    beam_y = cy + math.sin(sweep_rad) * r_globe
    draw.line([(cx, cy), (beam_x, beam_y)], fill=(255, 255, 255), width=2)
    # Trailing sector
    trail_rad = sweep_rad - 0.35
    t_bx = cx + math.cos(trail_rad) * r_globe
    t_by = cy + math.sin(trail_rad) * r_globe
    draw.polygon([(cx, cy), (beam_x, beam_y), (t_bx, t_by)], fill=(0, 240, 255, 40))

    # Azimuth crosshairs
    draw.line([(cx - r_globe, cy), (cx + r_globe, cy)], fill=(0, 240, 255, 60))
    draw.line([(cx, cy - r_globe), (cx, cy + r_globe)], fill=(0, 240, 255, 60))
    draw.text((cx - 20, cy - r_globe + 8), "300 KM", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Boresight Crosshair
    draw.line([(cx - 10, cy), (cx + 10, cy)], fill=COLOR_CYAN, width=1)
    draw.line([(cx, cy - 10), (cx, cy + 10)], fill=COLOR_CYAN, width=1)

    # Pitch Ladder
    for pr in [-30, -15, 15, 30]:
        py = cy + pr
        draw.line([(cx - 25, py), (cx + 25, py)], fill=(0, 240, 255, 80))

    # DRFM Ghost Decoys (Present during Phase II, purged in Phase III)
    if 5.0 <= t_sec <= 11.2:
        for gx, gy in [(cx + 90, cy - 80), (cx - 110, cy - 60), (cx + 120, cy + 50)]:
            draw.rectangle([gx - 4, gy - 4, gx + 4, gy + 4], outline=COLOR_DISSIM, width=1)
            draw.text((gx + 8, gy - 6), "DRFM-GHOST", fill=COLOR_DISSIM, font=FONT_MONO_SM)

    # Hostile Target: APEX-VECTOR-01
    tgt_dist = max(18.0, 84.0 - t_sec * 2.2)
    tgt_norm = (tgt_dist / 100.0) * r_globe
    tgt_x = cx + math.cos(0.75) * tgt_norm
    tgt_y = cy - math.sin(0.75) * tgt_norm

    # Target status
    if t_sec < 26.5:
        # Bounding box
        draw.rectangle([tgt_x - 10, tgt_y - 10, tgt_x + 10, tgt_y + 10], outline=COLOR_HOSTILE, width=2)
        # Velocity lead
        draw.line([(tgt_x, tgt_y), (tgt_x - 15, tgt_y + 12)], fill=COLOR_HOSTILE, width=1)
        draw.text((tgt_x + 14, tgt_y - 10), "APEX-VECTOR-01 [HOSTILE]", fill=COLOR_HOSTILE, font=FONT_MONO_SM)
        draw.text((tgt_x + 14, tgt_y + 3), f"RNG: {tgt_dist:.1f}km | M 4.8 | Pk: 98%", fill=COLOR_TEXT_MAIN, font=FONT_MONO_SM)

        # Active Lock Reticle (Phase IV onwards: rotating diamond)
        if t_sec >= 17.0:
            diamond_r = 16
            draw.polygon([
                (tgt_x, tgt_y - diamond_r),
                (tgt_x + diamond_r, tgt_y),
                (tgt_x, tgt_y + diamond_r),
                (tgt_x - diamond_r, tgt_y)
            ], outline=COLOR_HOSTILE, width=2)
            draw.text((tgt_x - 28, tgt_y - 28), "KINETIC LOCK", fill=COLOR_HOSTILE, font=FONT_MONO_SM)

        # Kinetic Interceptor Missile Streak (Phase V: 23.0s - 26.5s)
        if 23.0 <= t_sec <= 26.5:
            prog = (t_sec - 23.0) / 3.5
            msl_x = cx + (tgt_x - cx) * prog
            msl_y = cy + (tgt_y - cy) * prog
            # Streak line
            draw.line([(cx, cy), (msl_x, msl_y)], fill=(0, 240, 255), width=2)
            # Rocket head
            draw.ellipse([msl_x - 4, msl_y - 4, msl_x + 4, msl_y + 4], fill=(255, 255, 255))
            draw.text((msl_x + 8, msl_y - 5), "INTERCEPTOR-01", fill=COLOR_CYAN, font=FONT_MONO_SM)

    else:
        # Target Destroyed / Explosion Flash (26.5s+)
        exp_age = t_sec - 26.5
        exp_r = min(60, int(exp_age * 40))
        if exp_age < 0.6:
            draw.ellipse([tgt_x - exp_r*1.5, tgt_y - exp_r*1.5, tgt_x + exp_r*1.5, tgt_y + exp_r*1.5], fill=(255, 255, 255))
        draw.ellipse([tgt_x - exp_r, tgt_y - exp_r, tgt_x + exp_r, tgt_y + exp_r], outline=COLOR_HOSTILE, width=3)
        draw.text((tgt_x - 45, tgt_y - 8), "TARGET DESTROYED", fill=COLOR_FRIENDLY, font=FONT_MONO_LG)

    # Anti-Entropy Elimination Shockwave (11.2s - 13.5s)
    if 11.2 <= t_sec <= 13.5:
        wave_age = t_sec - 11.2
        wave_r = (wave_age / 2.3) * r_globe * 1.6
        draw.ellipse([cx - wave_r, cy - wave_r, cx + wave_r, cy + wave_r], outline=(0, 240, 255), width=4)
        draw.ellipse([cx - wave_r*0.85, cy - wave_r*0.85, cx + wave_r*0.85, cy + wave_r*0.85], outline=(0, 255, 157), width=2)
        draw.text((cx - 100, cy - wave_r - 18), "ANTI-ENTROPY ELIMINATION WAVEFRONT", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # 6. RIGHT BAY (Entropy Detection Engine + Allegiance Matrix)
    draw.rectangle([990, 85, 1270, 600], fill=COLOR_PANEL_BG, outline=COLOR_BORDER)
    draw.rectangle([990, 85, 1270, 105], fill=(0, 240, 255, 20))
    draw.text((998, 90), "DYNAMIC ENTROPY DETECTION", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # Shannon Entropy Meter
    entropy_val = 0.86 if 5.0 <= t_sec <= 11.2 else (0.12 if t_sec > 11.2 else 0.22)
    ent_color = COLOR_HOSTILE if entropy_val > 0.65 else COLOR_FRIENDLY
    draw.text((1000, 115), f"CHAOS FLUX (H): {entropy_val*100:.1f}%", fill=ent_color, font=FONT_MONO_SM)
    draw.rectangle([1000, 132, 1260, 142], fill=(0, 240, 255, 30))
    draw.rectangle([1000, 132, int(1000 + entropy_val * 260), 142], fill=ent_color)

    # Real-Time Oscilloscope Waveform Box
    draw.rectangle([1000, 155, 1260, 235], fill=(2, 6, 12), outline=COLOR_BORDER)
    draw.line([(1000, 195), (1260, 195)], fill=(0, 240, 255, 40))
    # Waveform points
    wave_pts = []
    chaos = 1.0 if 5.0 <= t_sec <= 11.2 else 0.15
    for xi in range(1000, 1261, 4):
        norm_x = (xi - 1000) / 260.0
        carrier = math.sin(norm_x * math.pi * 6 + t_sec * 12)
        noise = (math.sin(xi * 13.5 + t_sec * 30) * chaos) * 25
        yi = 195 + carrier * 15 + noise
        wave_pts.append((xi, yi))
    draw.line(wave_pts, fill=ent_color, width=2)

    # IFF Allegiance & Threat Registry
    draw.rectangle([990, 250, 1270, 270], fill=(0, 240, 255, 20))
    draw.text((998, 255), "ALLEGIANCE MATRIX (IFF MODE-5)", fill=COLOR_CYAN, font=FONT_MONO_SM)

    targets_ui = [
        ("APEX-VECTOR-01", "HOSTILE", COLOR_HOSTILE, "M 4.8 | RNG 48km | LOCKED" if t_sec >= 17.0 else "M 4.8 | RNG 82km"),
        ("HYPERSONIC-9", "HOSTILE", COLOR_HOSTILE, "M 6.2 | RNG 142km"),
        ("DRFM-PHANTOM-A", "DISSIM", COLOR_DISSIM, "PURGED" if t_sec > 11.2 else "ACTIVE DECOY"),
        ("AEGIS-SHIELD-V", "FRIENDLY", COLOR_FRIENDLY, "M 1.8 | ESCORT RELAY"),
        ("STRATO-BEACON", "NEUTRAL", COLOR_NEUTRAL, "M 0.8 | CIVIL MET")
    ]

    for ti, (t_name, t_cls, t_cl, t_sub) in enumerate(targets_ui):
        ty = 280 + ti * 58
        draw.rectangle([998, ty, 1262, ty + 50], fill=(2, 10, 18), outline=(0, 240, 255, 40))
        draw.text((1004, ty + 5), t_name, fill=(255, 255, 255), font=FONT_MONO_SM)
        draw.text((1200, ty + 5), t_cls, fill=t_cl, font=FONT_MONO_SM)
        draw.text((1004, ty + 24), t_sub, fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # 7. BOTTOM DOCK (HIGH SPEED SYSTEM DUMPS & BENCHMARKS)
    draw.rectangle([10, 610, WIDTH - 10, 710], fill=(2, 6, 12), outline=COLOR_BORDER)
    draw.rectangle([10, 610, WIDTH - 10, 626], fill=(0, 240, 255, 20))
    draw.text((18, 613), "LIVE OPTICAL REGISTERS // MICROSECOND TELEMETRY DUMP STREAM", fill=COLOR_CYAN, font=FONT_MONO_SM)
    draw.text((820, 613), "STREAMING: 12,480 vec/s  |  LATENCY: 0.08 ms  |  BUFFER: 98.4%", fill=COLOR_FRIENDLY, font=FONT_MONO_SM)

    # Microsecond data lines
    msec_base = int((t_sec * 1000000) % 1000000)
    for di in range(4):
        dy = 632 + di * 18
        stamp = f"T+{mins:02d}:{secs:02d}.{msec_base - di*250:06d}"
        hex_ck = f"0x{(int(t_sec*1000) + di*137) & 0xFFFFFF:06X}"
        subsys = "CIRC-CONSENSUS" if di % 2 == 0 else "ENTROPY-DETECTOR"
        payload = f"H:{entropy_val:.3f} | VAR:{var_val:.5f} | MACH:3.42 | LAT:34.0522 | LON:-118.2437 | TGTS:5 | VEC_LOCK:OK"
        draw.text((18, dy), stamp, fill=COLOR_TEXT_DIM, font=FONT_MONO_SM)
        draw.text((160, dy), subsys, fill=COLOR_CYAN, font=FONT_MONO_SM)
        draw.text((290, dy), hex_ck, fill=COLOR_NEUTRAL, font=FONT_MONO_SM)
        draw.text((380, dy), payload, fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    return img

# ==============================================================================
# MASTER EXECUTION PIPELINE
# ==============================================================================
def main():
    print("=" * 68)
    print("   A.M.R.T.D.S. // TACTICAL SIMULATION DEMO GENERATOR")
    print(f"   Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS | Duration: {DURATION_SEC}s")
    print(f"   Target Video: {MP4_OUTPUT}")
    print("=" * 68)

    # Step 1: Synthesize Audio
    synthesize_audio(DURATION_SEC, SAMPLE_RATE)

    # Step 2: Render Frames & Pipe into FFmpeg
    print(f"[*] Rendering {TOTAL_FRAMES} frames and encoding MP4 video...")
    t_start = time.time()

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",  # Pipe input
        "-i", WAV_OUTPUT,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        MP4_OUTPUT
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    for i in range(TOTAL_FRAMES):
        t_sec = i / FPS
        frame_img = render_frame(i, TOTAL_FRAMES, t_sec)
        proc.stdin.write(frame_img.tobytes())

        if i % 150 == 0 or i == TOTAL_FRAMES - 1:
            progress = (i + 1) / TOTAL_FRAMES * 100
            elapsed = time.time() - t_start
            fps_actual = (i + 1) / elapsed if elapsed > 0 else 0
            print(f"    -> Progress: {progress:5.1f}% ({i+1}/{TOTAL_FRAMES} frames) | {fps_actual:.1f} fps")

    proc.stdin.close()
    proc.wait()

    if proc.returncode == 0:
        elapsed = time.time() - t_start
        file_size_mb = os.path.getsize(MP4_OUTPUT) / (1024 * 1024)
        print("=" * 68)
        print(f"[+] DEMO GENERATION COMPLETE in {elapsed:.2f}s!")
        print(f"[+] MP4 File: {MP4_OUTPUT} ({file_size_mb:.2f} MB)")
        print(f"[+] Audio Master: {WAV_OUTPUT}")
        print("=" * 68)
    else:
        err = proc.stderr.read().decode('utf-8', errors='ignore')
        print(f"[-] FFmpeg error:\n{err}")
        sys.exit(1)

if __name__ == "__main__":
    main()
