#!/usr/bin/env bash

# Test Execution Script for Home Page Search Functionality
# Usage: ./run-search-tests.sh [test-type]

set -e

TEST_TYPE=${1:-"all"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="reports/search-tests-$TIMESTAMP"

echo "🚀 Starting Home Page Search Tests - Type: $TEST_TYPE"
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Report Directory: $REPORT_DIR"

# Create report directory
mkdir -p "$REPORT_DIR"

case $TEST_TYPE in
  "smoke")
    echo "🔥 Running Smoke Tests..."
    npx playwright test tests/smoke/home-page-search-smoke.spec.ts --reporter=html,junit
    ;;
  "functional")
    echo "⚙️ Running Functional Tests..."
    npx playwright test tests/functional/home-page-search.spec.ts --reporter=html,junit
    ;;
  "regression")
    echo "🔄 Running Regression Tests..."
    npx playwright test tests/regression/home-page-search-regression.spec.ts --reporter=html,junit
    ;;
  "all")
    echo "🎯 Running All Search Tests..."
    npx playwright test tests/**/home-page-search*.spec.ts --reporter=html,junit
    ;;
  *)
    echo "❌ Invalid test type. Available options: smoke, functional, regression, all"
    exit 1
    ;;
esac

echo "✅ Test execution completed!"
echo "📊 Check reports in: playwright-report/"

# Optional: Open report automatically
if command -v start &> /dev/null; then
    echo "🌐 Opening test report..."
    start playwright-report/index.html
elif command -v open &> /dev/null; then
    echo "🌐 Opening test report..."
    open playwright-report/index.html
fi