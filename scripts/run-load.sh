#!/usr/bin/env sh
cd "$(dirname "$0")/.."
K6_ENV=qa k6 run src/tests/load/loadTest.js
