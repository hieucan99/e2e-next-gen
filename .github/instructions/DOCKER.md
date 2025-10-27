# Docker Compose for E2E Tests

This file provides an alternative way to run tests using Docker Compose.

## Usage

### Build the image
```bash
docker-compose build
```

### Run all tests
```bash
docker-compose run --rm e2e-tests
```

### Run specific test suites
```bash
# Smoke tests
docker-compose run --rm smoke-tests

# Functional tests
docker-compose run --rm functional-tests

# Regression tests
docker-compose run --rm regression-tests

# API tests
docker-compose run --rm api-tests
```

### Run with custom environment variables
```bash
# Using environment variables
BASE_URL=https://staging.example.com docker-compose run --rm smoke-tests

# Using .env file
docker-compose --env-file .env.staging run --rm e2e-tests
```

### Run with timestamp
```bash
RUN_TIME=$(date -u +%Y-%m-%dT%H-%M-%S) docker-compose run --rm smoke-tests
```

## Environment Variables

- `BASE_URL`: Base URL for testing (default: https://www.nike.com/vn)
- `HEADLESS`: Run in headless mode (default: true)
- `TIMEOUT`: Test timeout in milliseconds (default: 30000)
- `CI`: CI mode flag (default: true)
- `RUN_TIME`: Test run timestamp
- `TEST_ENV`: Test environment (dev, staging, prod)

## Services

- `e2e-tests`: Base service for all tests
- `smoke-tests`: Runs smoke test suite
- `functional-tests`: Runs functional test suite
- `regression-tests`: Runs regression test suite
- `api-tests`: Runs API test suite
