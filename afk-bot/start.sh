#!/usr/bin/env bash
# Simple launcher that keeps trying to start the bot until successful
cd "$(dirname "$0")"
while true; do
  npm start
  echo "bot exited — restarting in 5s..."
  sleep 5
done
