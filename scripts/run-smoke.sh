#!/usr/bin/env sh
cd "$(dirname "$0")/.."
K6_ENV=dev k6 run src/tests/smoke/smokeTest.js
