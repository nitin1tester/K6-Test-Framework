#!/usr/bin/env node

/**
 * k6-to-allure.js
 *
 * Converts k6's raw JSON output (--out json=file.json) into Allure-compatible
 * result files, so `allure serve allure-results` / `allure generate` renders
 * a real per-check report instead of one synthetic test case.
 *
 * USAGE
 *   1. Run k6 with JSON output enabled:
 *        k6 run --out json=k6-output.json src/tests/load/loadTest.js
 *
 *   2. Convert that output into Allure results:
 *        node scripts/k6-to-allure.js k6-output.json allure-results
 *
 *   3. View the report:
 *        allure generate allure-results --clean -o allure-report
 *        allure open allure-report
 *
 * WHAT IT DOES
 *   k6's JSON output is JSON-Lines: one JSON object per line, per metric
 *   data point. This script streams the file, pulls out every line where
 *   metric === "checks", and groups them by check name (+ group, if any).
 *   Each unique check becomes ONE Allure test case:
 *     - status = "passed" if every sample for that check passed
 *     - status = "failed" if at least one sample failed
 *     - the pass/fail counts and pass rate are attached as parameters
 *       and as a step-level breakdown, so you can see e.g. 998/1000 passed
 *       instead of a single boolean for the whole run.
 *
 *   It also emits one top-level "load-test-execution" container-level
 *   summary test case with overall http_req_duration / http_req_failed
 *   stats pulled from the same file, if present.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

async function main() {
  const [, , inputPathArg, outputDirArg] = process.argv;

  if (!inputPathArg) {
    console.error(
      "Usage: node k6-to-allure.js <k6-json-output-file> [allure-results-dir]"
    );
    process.exit(1);
  }

  const inputPath = path.resolve(inputPathArg);
  const outputDir = path.resolve(outputDirArg || "allure-results");

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // checkName -> { pass: n, fail: n, group: string, firstTs, lastTs }
  const checks = new Map();
  // any non-check metric we want a rollup for
  const metricSamples = new Map(); // metricName -> number[]

  const rl = readline.createInterface({
    input: fs.createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let point;
    try {
      point = JSON.parse(line);
    } catch {
      continue; // skip malformed lines rather than crash the whole run
    }

    if (point.type !== "Point" || !point.data) continue;

    const metricName = point.metric;
    const value = point.data.value;
    const ts = point.data.time ? Date.parse(point.data.time) : Date.now();
    const tags = point.data.tags || {};

    if (metricName === "checks") {
      const checkName = tags.check || "unnamed check";
      const group = tags.group || "";
      const key = group ? `${group} > ${checkName}` : checkName;

      if (!checks.has(key)) {
        checks.set(key, {
          name: checkName,
          group,
          pass: 0,
          fail: 0,
          firstTs: ts,
          lastTs: ts,
        });
      }
      const entry = checks.get(key);
      if (value === 1) entry.pass += 1;
      else entry.fail += 1;
      entry.firstTs = Math.min(entry.firstTs, ts);
      entry.lastTs = Math.max(entry.lastTs, ts);
    } else if (
      ["http_req_duration", "http_req_failed", "http_reqs", "vus"].includes(
        metricName
      )
    ) {
      if (!metricSamples.has(metricName)) metricSamples.set(metricName, []);
      metricSamples.get(metricName).push(value);
    }
  }

  if (checks.size === 0) {
    console.warn(
      "No 'checks' data points found in the input file. Did the test file use k6's check() function, and was --out json= set?"
    );
  }

  const runStart = Math.min(
    ...[...checks.values()].map((c) => c.firstTs),
    Date.now()
  );
  const runEnd = Math.max(
    ...[...checks.values()].map((c) => c.lastTs),
    runStart
  );

  // --- one Allure result per check ---
  for (const [, entry] of checks) {
    writeAllureResult(outputDir, {
      name: entry.name,
      suite: entry.group || "k6 checks",
      status: entry.fail > 0 ? "failed" : "passed",
      start: entry.firstTs,
      stop: entry.lastTs,
      params: [
        { name: "passed", value: String(entry.pass) },
        { name: "failed", value: String(entry.fail) },
        {
          name: "pass rate",
          value:
            ((entry.pass / (entry.pass + entry.fail)) * 100).toFixed(2) + "%",
        },
      ],
      statusDetails:
        entry.fail > 0
          ? {
              message: `${entry.fail} of ${
                entry.pass + entry.fail
              } iterations failed this check`,
            }
          : undefined,
    });
  }

  // --- one summary result for overall run metrics ---
  const summaryParams = [];
  for (const [metricName, values] of metricSamples) {
    if (metricName === "http_req_duration") {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      summaryParams.push({ name: "avg http_req_duration (ms)", value: avg.toFixed(2) });
      summaryParams.push({ name: "max http_req_duration (ms)", value: max.toFixed(2) });
    } else if (metricName === "http_req_failed") {
      const failRate = (values.reduce((a, b) => a + b, 0) / values.length) * 100;
      summaryParams.push({ name: "http_req_failed rate", value: failRate.toFixed(2) + "%" });
    } else if (metricName === "http_reqs") {
      summaryParams.push({ name: "total http_reqs", value: String(values.length) });
    } else if (metricName === "vus") {
      summaryParams.push({ name: "max vus", value: String(Math.max(...values)) });
    }
  }

  const anyChecksFailed = [...checks.values()].some((c) => c.fail > 0);
  writeAllureResult(outputDir, {
    name: "k6 run summary",
    suite: "k6 run summary",
    status: anyChecksFailed ? "failed" : "passed",
    start: runStart,
    stop: runEnd,
    params: summaryParams,
  });

  console.log(
    `Wrote ${checks.size + 1} Allure result file(s) to ${outputDir}`
  );
}

function writeAllureResult(outputDir, { name, suite, status, start, stop, params = [], statusDetails }) {
  const uuid = crypto.randomUUID();
  const result = {
    uuid,
    historyId: crypto.createHash("md5").update(name).digest("hex"),
    name,
    fullName: `${suite} > ${name}`,
    status, // "passed" | "failed" | "broken" | "skipped"
    stage: "finished",
    start,
    stop,
    labels: [
      { name: "suite", value: suite },
      { name: "framework", value: "k6" },
    ],
    parameters: params,
    ...(statusDetails ? { statusDetails } : {}),
  };

  fs.writeFileSync(
    path.join(outputDir, `${uuid}-result.json`),
    JSON.stringify(result, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
