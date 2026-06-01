# k6 Performance Framework

A scaffolded k6 performance test framework with environment configs, reusable services, payloads, scenarios, hooks, and CI support.

## Structure

- `config/` - environment-specific JSON settings
- `src/tests/` - smoke, load, stress, soak, and spike test entry points
- `src/services/` - API request helpers
- `src/payloads/` - request payload builders
- `src/utils/` - shared helpers and config loaders
- `src/data/` - sample test data files
- `src/scenarios/` - reusable k6 scenario definitions
- `src/hooks/` - setup and teardown modules
- `reports/` - generated test reporting output
- `scripts/` - shell wrappers for common runs
- `.github/workflows/` - GitHub Actions performance workflow

## Install

```sh
npm install
```

## Run

```sh
npm run smoke
npm run load
npm run load:allure
npm run stress
npm run soak
npm run spike
npm run booking
```

## Load test Allure results

The load test writes Allure-compatible results to `allure-results/` when you run:

```sh
npm run load:allure
```

This generates:
- `allure-results/k6-load-test.xml`
- `allure-results/k6-load-test.json`

To view the report locally:

```sh
allure serve allure-results
```

Or generate a static HTML report:

```sh
allure generate allure-results --clean -o allure-report
open allure-report/index.html
```

If the report looks empty, verify the generated XML contains a `<testsuite>` and `<testcase>` entry. The current framework writes a single synthetic test case from the k6 summary, so the report will be minimal until more detailed test steps are added.

## Booking API coverage

The framework now includes a `bookingSmokeTest.js` that exercises the Restful Booker endpoints with the following flows:

- `POST /booking` — create a booking
- `GET /booking/{id}` — read booking details
- `PUT /booking/{id}` — update a booking fully
- `PATCH /booking/{id}` — partial update
- `DELETE /booking/{id}` — delete a booking
- `GET /booking` with query params — search by dates or guest name

## Docker

```sh
docker-compose run --rm k6 run src/tests/load/loadTest.js
```

## Environment

Set `K6_ENV` to choose config values:
- `dev`
- `qa`
- `stage`
- `prod`

