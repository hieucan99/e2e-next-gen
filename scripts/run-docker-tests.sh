#!/bin/bash
#
# Docker Test Runner - Run Playwright tests in Docker container
#
# Description:
#   Executes E2E tests in a Docker container with configurable parameters
#   and automatic test run recording.
#
# Usage:
#   ./run-docker-tests.sh [OPTIONS]
#
# Examples:
#   ./run-docker-tests.sh -t smoke
#   ./run-docker-tests.sh -e staging -t functional --build
#   ./run-docker-tests.sh -u "https://example.com" -h false

set -euo pipefail

# Default values
ENVIRONMENT="dev"
TEST_SUITE=""
BASE_URL="https://www.nike.com/vn"
HEADLESS="true"
BROWSER="chromium"
WORKERS="4"
BUILD=false

# Helper function to create/update run-info.json
update_run_info() {
    local results_dir="$1"
    local status="$2"
    local exit_code="$3"
    
    cat > "$results_dir/run-info.json" <<EOF
{
  "runTime": "$RUN_TIME",
  "environment": "$ENVIRONMENT",
  "testSuite": "${TEST_SUITE:-all}",
  "baseUrl": "$BASE_URL",
  "headless": "$HEADLESS",
  "browser": "$BROWSER",
  "workers": "$WORKERS",
  "command": "$TEST_COMMAND",
  "timestamp": "$(date -u +"%Y-%m-%d %H:%M:%S")"$([ -n "$status" ] && echo ",
  \"status\": \"$status\",
  \"exitCode\": $exit_code" || echo "")
}
EOF
}

# Display help message
show_help() {
    echo ""
    echo "Docker Test Runner - Run Playwright tests in Docker container"
    echo ""
    echo "Usage: ./run-docker-tests.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment to run tests (dev, staging, prod). Default: dev"
    echo "  -t, --test-suite     Test suite to run (smoke, functional, regression, api, all). Default: all"
    echo "  -u, --base-url       Base URL for testing. Default: https://www.nike.com/vn"
    echo "  -h, --headless       Run in headless mode (true/false). Default: true"
    echo "  -b, --browser        Browser to use (chromium, firefox, webkit). Default: chromium"
    echo "  -w, --workers        Number of parallel workers (1-10). Default: 4"
    echo "  --build              Build Docker image before running tests"
    echo "  --help               Display this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-docker-tests.sh -t smoke"
    echo "  ./run-docker-tests.sh -e staging -t functional --build"
    echo "  ./run-docker-tests.sh -u https://example.com -h false"
    echo ""
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--test-suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        -u|--base-url)
            BASE_URL="$2"
            shift 2
            ;;
        -h|--headless)
            HEADLESS="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        --build)
            BUILD=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate workers range
if [ "$WORKERS" -lt 1 ] || [ "$WORKERS" -gt 10 ]; then
    echo "❌ Error: Workers must be between 1 and 10"
    exit 1
fi

# Verify Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    echo "Please install Docker: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker daemon is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

# Generate timestamp for this test run
RUN_TIME=$(date -u +"%Y-%m-%dT%H-%M-%S")
IMAGE_NAME="e2e-next-gen:latest"
CONTAINER_NAME="e2e-tests-$RUN_TIME"

echo ""
echo "====================================="
echo "Docker Test Execution"
echo "====================================="
echo "Environment: $ENVIRONMENT"
echo "Test Suite: ${TEST_SUITE:-all}"
echo "Base URL: $BASE_URL"
echo "Headless: $HEADLESS"
echo "Browser: $BROWSER"
echo "Workers: $WORKERS"
echo "Run Time: $RUN_TIME"
echo "====================================="
echo ""

# Build Docker image if requested
if [ "$BUILD" = true ]; then
    echo "Building Docker image..."
    docker build -t $IMAGE_NAME .
    if [ $? -ne 0 ]; then
        echo "Docker build failed!"
        exit 1
    fi
    echo "Docker image built successfully!"
    echo ""
fi

# Determine test command based on suite
TEST_COMMAND="npm test"
if [ -n "$TEST_SUITE" ]; then
    case "${TEST_SUITE,,}" in
        smoke)
            TEST_COMMAND="npx playwright test tests/smoke"
            ;;
        functional)
            TEST_COMMAND="npx playwright test tests/functional"
            ;;
        regression)
            TEST_COMMAND="npx playwright test tests/regression"
            ;;
        api)
            TEST_COMMAND="npx playwright test tests/api"
            ;;
        all)
            TEST_COMMAND="npm test"
            ;;
        *)
            TEST_COMMAND="npm test"
            ;;
    esac
fi

# Create test-results directory if it doesn't exist
RESULTS_DIR="test-results/$RUN_TIME"
mkdir -p "$RESULTS_DIR"

# Record test run parameters (initial)
update_run_info "$RESULTS_DIR" "" ""

echo "Running tests in Docker container..."
echo ""

# Run Docker container with environment variables and mount test-results
docker run --rm \
    --name "$CONTAINER_NAME" \
    -e BASE_URL="$BASE_URL" \
    -e HEADLESS="$HEADLESS" \
    -e TIMEOUT=30000 \
    -e CI=true \
    -e RUN_TIME="$RUN_TIME" \
    -e TEST_ENV="$ENVIRONMENT" \
    -v "$(pwd)/test-results:/app/test-results" \
    "$IMAGE_NAME" \
    sh -c "$TEST_COMMAND"

EXIT_CODE=$?

echo ""
echo "====================================="

# Update run-info.json with results
if [ $EXIT_CODE -eq 0 ]; then
    echo "Tests completed successfully!"
    update_run_info "$RESULTS_DIR" "passed" "$EXIT_CODE"
else
    echo "Tests failed with exit code: $EXIT_CODE"
    update_run_info "$RESULTS_DIR" "failed" "$EXIT_CODE"
fi

echo "Test results saved to: $RESULTS_DIR"
echo "====================================="
echo ""

exit $EXIT_CODE
