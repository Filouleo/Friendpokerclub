#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

PORTS=(8000 8001 8002 8003 8080)

for PORT in "${PORTS[@]}"; do
  if ! curl -fsS "http://localhost:$PORT" >/dev/null 2>&1; then
    echo "Démarrage du site sur http://localhost:$PORT"
    python3 -m http.server "$PORT" &
    SERVER_PID=$!
    sleep 1
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "http://localhost:$PORT" >/dev/null 2>&1 || true
    fi
    wait "$SERVER_PID"
    exit 0
  fi
done

echo "Aucun port libre trouvé dans la liste 8000-8003,8080."
echo "Essaye manuellement : python3 -m http.server 8000"
exit 1
