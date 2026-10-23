#!/bin/sh
set -eu

if [ ! -x ".venv/bin/uvicorn" ]; then
  echo "Python environment is missing. Create it and install requirements.txt first."
  exit 1
fi

.venv/bin/uvicorn permissionguard_api:app --host 127.0.0.1 --port 8010 &
API_PID=$!
cleanup() {
  kill "$API_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 1
if ! kill -0 "$API_PID" 2>/dev/null; then
  wait "$API_PID"
  exit 1
fi

npm run frontend
