#!/usr/bin/env sh
cd "$(dirname "$0")/.."
K6_ENV=stage k6 run src/tests/stress/stressTest.js
