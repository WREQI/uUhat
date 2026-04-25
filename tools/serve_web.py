#!/usr/bin/env python3
from __future__ import annotations

import http.server
import socketserver
import sys


class PerryWasmHandler(http.server.SimpleHTTPRequestHandler):
  # Python may not map wasm correctly on older versions
  extensions_map = {
    **http.server.SimpleHTTPRequestHandler.extensions_map,
    ".wasm": "application/wasm",
    ".js": "text/javascript; charset=utf-8",
  }

  def end_headers(self) -> None:
    # Enable cross-origin isolation for SharedArrayBuffer / WASM threads.
    # See: https://web.dev/articles/coop-coep
    self.send_header("Cross-Origin-Opener-Policy", "same-origin")
    self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
    super().end_headers()

  def do_GET(self) -> None:
    # Some Perry-generated HTML shells rely on the root taking full height.
    # If the browser shows a blank page (no errors), force a sane layout.
    if self.path.endswith("/uUhat.html") or self.path == "/uUhat.html":
      try:
        with open("uUhat.html", "rb") as f:
          raw = f.read()
        extra = (
          b"\n<style>\n"
          b"  html, body { display: flex; flex-direction: column; }\n"
          b"  #perry-root { height: 100%; }\n"
          b"</style>\n"
        )
        if b"</head>" in raw:
          raw = raw.replace(b"</head>", extra + b"</head>", 1)
        # Serve patched HTML
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)
        return
      except Exception:
        # Fall back to default handler
        pass

    return super().do_GET()


def main() -> int:
  port = 8765
  if len(sys.argv) >= 2:
    port = int(sys.argv[1])

  with socketserver.TCPServer(("", port), PerryWasmHandler) as httpd:
    print(f"Serving on http://localhost:{port}")
    print(f"Open: http://localhost:{port}/uUhat.html")
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      return 0


if __name__ == "__main__":
  raise SystemExit(main())

