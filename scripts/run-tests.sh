#!/bin/bash

# E2E Test Execution Script
# Usage: ./run-tests.sh [test-type] [browser] [environment]

set -e

# Default values
TEST_TYPE="smoke"
BROWSER="chromium"
ENVIRONMENT="dev"
WORKERS=4

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--test-type)
      TEST_TYPE="$2"
      shift 2
      ;;
    -b|--browser)
      BROWSER="$2"
      shift 2
      ;;
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -w|--workers)
      WORKERS="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  -t, --test-type    Test type (smoke|functional|regression|api|visual)"
      echo "  -b, --browser      Browser (chromium|firefox|webkit)"
      echo "  -e, --environment  Environment (dev|staging|prod)"
      echo "  -w, --workers      Number of parallel workers"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🚀 Starting E2E Tests"
echo "📋 Test Type: $TEST_TYPE"
echo "🌐 Browser: $BROWSER"
echo "🏗️ Environment: $ENVIRONMENT"
echo "⚡ Workers: $WORKERS"

# Set environment-specific configuration
case $ENVIRONMENT in
  dev)
    CONFIG_FILE="config/playwright.dev.config.ts"
    ;;
  staging)
    CONFIG_FILE="config/playwright.staging.config.ts"
    ;;
  prod)
    CONFIG_FILE="config/playwright.prod.config.ts"
    ;;
  *)
    CONFIG_FILE="config/playwright.config.ts"
    ;;
esac

# Clean previous results
echo "🧹 Cleaning previous results..."
npm run clean

# Run tests based on type
echo "🔄 Running $TEST_TYPE tests..."
case $TEST_TYPE in
  smoke)
    npx playwright test tests/smoke --config="$CONFIG_FILE" --project="$BROWSER" --workers="$WORKERS"
    ;;
  functional)
    npx playwright test tests/functional --config="$CONFIG_FILE" --project="$BROWSER" --workers="$WORKERS"
    ;;
  regression)
    npx playwright test tests/regression --config="$CONFIG_FILE" --project="$BROWSER" --workers="$WORKERS"
    ;;
  api)
    npx playwright test tests/api --config="$CONFIG_FILE" --workers="$WORKERS"
    ;;
  visual)
    npx playwright test tests/visual --config="$CONFIG_FILE" --project="$BROWSER" --workers=1
    ;;
  all)
    npx playwright test --config="$CONFIG_FILE" --project="$BROWSER" --workers="$WORKERS"
    ;;
  *)
    echo "❌ Unknown test type: $TEST_TYPE"
    exit 1
    ;;
esac

# Generate report
echo "📊 Generating test report..."
npm run test:report

echo "✅ Test execution completed!"
echo "📁 Results available in: playwright-report/"