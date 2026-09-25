#!/usr/bin/env python3
"""
A.M.R.T.D.S. // RESEARCH HUD LAUNCHER
Automated Military Radar Targeting & Dissimulation System
Classification: RESTRICTED // RESEARCH-SYSTEM-ONLY
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time

PORT = 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Suppress routine GET requests for high speed streaming
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), QuietHandler) as httpd:
                print("=" * 68)
                print("   A.M.R.T.D.S. // PROJECT CHRONO-VECTOR (SPEC-884-HUD)")
                print("   RESTRICTED // RESEARCH-SYSTEM-ONLY // SOVEREIGN REMNANT")
                print("=" * 68)
                print(f"[*] Visual Containment HUD Online at: http://localhost:{p}")
                print(f"[*] Serving Root Directory: {DIRECTORY}")
                print("[*] Press Ctrl+C to terminate simulation server.")
                print("=" * 68)
                webbrowser.open(f"http://localhost:{p}")
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    start_server()
