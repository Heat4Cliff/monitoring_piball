"""
Web Dashboard Runner for PiBal (Pilot Balloon) Analysis
Serves the built production dashboard locally and opens the browser.
"""

import os
import sys
import webbrowser
import http.server
import socketserver
from functools import partial

PORT = 5173

def run():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, "dashboard", "dist")
    
    if not os.path.exists(dist_dir) or not os.path.exists(os.path.join(dist_dir, "index.html")):
        print("[!] Build directory not found. Please build the frontend first:")
        print("    cd dashboard && npm run build")
        sys.exit(1)

    # Change directory to dist
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=dist_dir)
    
    # Try binding to port
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), handler) as httpd:
                url = f"http://localhost:{p}"
                print("=" * 70)
                print("  PIBAL ANALYTICS HUB - STAMET TUNGGUL WULUNG CILACAP")
                print("=" * 70)
                print(f"  > Dashboard berjalan di: {url}")
                print(f"  > Melayani dokumen: {dist_dir}")
                print("  > Tekan Ctrl + C untuk menghentikan server")
                print("=" * 70)
                
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                    
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    run()
