# Docker Workflow Execution Guide

## Overview

This document explains how the E2E test execution workflow operates when running tests in Docker containers, both locally and in GitHub Actions CI/CD pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Test Execution Flow                      │
└─────────────────────────────────────────────────────────────┘

1. Initialize Run
   ├── Generate timestamp (RUN_TIME)
   ├── Set environment variables
   └── Create test-results directory

2. Build/Use Docker Image
   ├── Pull base: mcr.microsoft.com/playwright:v1.56.1-jammy
   ├── Install dependencies (npm ci)
   └── Copy project files

3. Execute Tests in Container
   ├── Mount volume: ./test-results -> /app/test-results
   ├── Pass environment variables
   ├── Run Playwright tests
   └── Generate artifacts

4. Collect Results
   ├── HTML report: test-results/{RUN_TIME}/report.html/
   ├── JSON results: test-results/{RUN_TIME}/results.json
   ├── JUnit XML: test-results/{RUN_TIME}/junit.xml
   ├── Videos: test-results/{RUN_TIME}/artifacts/*.webm
   ├── Screenshots: test-results/{RUN_TIME}/artifacts/*.png
   └── Run metadata: test-results/{RUN_TIME}/run-info.json
```

## Local Execution

### Using PowerShell Script (Windows)

```powershell
# Run smoke tests
.\scripts\run-docker-tests.ps1 -TestSuite smoke

# Run with custom parameters
.\scripts\run-docker-tests.ps1 `
    -Environment staging `
    -TestSuite functional `
    -BaseUrl "https://example.com" `
    -Headless $false `
    -Build
```

**Workflow Steps:**

1. **Parameter Validation**
   - Validates test suite name
   - Checks worker count (1-10)
   - Verifies Docker availability

2. **Environment Setup**
   ```powershell
   $RUN_TIME = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
   $RESULTS_DIR = "test-results/$RUN_TIME"
   New-Item -Path $RESULTS_DIR -ItemType Directory -Force
   ```

3. **Docker Image Build** (if `-Build` specified)
   ```powershell
   docker build -t e2e-next-gen:latest .
   ```

4. **Test Execution**
   ```powershell
   docker run --rm `
       -e BASE_URL="$BASE_URL" `
       -e HEADLESS="$HEADLESS" `
       -e TIMEOUT=30000 `
       -e CI=true `
       -e RUN_TIME="$RUN_TIME" `
       -e TEST_ENV="$ENVIRONMENT" `
       -v "${PWD}/test-results:/app/test-results" `
       e2e-next-gen:latest `
       sh -c "npx playwright test tests/smoke"
   ```

5. **Result Recording**
   - Creates `run-info.json` with test metadata
   - Updates with test status (passed/failed)
   - Captures exit code

### Using Bash Script (Linux/Mac)

```bash
# Run smoke tests
./scripts/run-docker-tests.sh -t smoke

# Run with custom parameters
./scripts/run-docker-tests.sh \
    -e staging \
    -t functional \
    -u "https://example.com" \
    -h false \
    --build
```

The Bash script follows the same workflow steps as PowerShell but uses Linux conventions.

## GitHub Actions Execution

### Trigger Events

The workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual dispatch with custom parameters

### Workflow Jobs

```yaml
jobs:
  test:
    strategy:
      matrix:
        test-suite: [smoke, functional]
```

### Execution Steps

#### 1. Checkout and Setup
```yaml
- name: Checkout code
  uses: actions/checkout@v4

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

#### 2. Build Docker Image
```yaml
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: false
    load: true
    tags: e2e-next-gen:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Cache Strategy:**
- Uses GitHub Actions cache for Docker layers
- Significantly speeds up builds on subsequent runs
- Shares cache across workflow runs

#### 3. Generate Metadata
```yaml
- name: Generate run timestamp
  id: timestamp
  run: echo "RUN_TIME=$(date -u +%Y-%m-%dT%H-%M-%S)" >> $GITHUB_OUTPUT

- name: Determine base URL
  id: base-url
  run: |
    if [ -n "${{ github.event.inputs.base_url }}" ]; then
      echo "BASE_URL=${{ github.event.inputs.base_url }}" >> $GITHUB_OUTPUT
    else
      echo "BASE_URL=https://www.nike.com/vn" >> $GITHUB_OUTPUT
    fi
```

#### 4. Create Initial Run Info
```yaml
- name: Record test run parameters
  run: |
    cat > test-results/${{ steps.timestamp.outputs.RUN_TIME }}/run-info.json <<EOF
    {
      "runTime": "${{ steps.timestamp.outputs.RUN_TIME }}",
      "environment": "${{ github.event.inputs.environment || 'dev' }}",
      "testSuite": "${{ matrix.test-suite }}",
      "baseUrl": "${{ steps.base-url.outputs.BASE_URL }}",
      "gitRef": "${{ github.ref }}",
      "gitSha": "${{ github.sha }}",
      "actor": "${{ github.actor }}",
      "workflow": "${{ github.workflow }}",
      "runNumber": "${{ github.run_number }}"
    }
    EOF
```

#### 5. Run Tests in Docker
```yaml
- name: Run tests in Docker
  run: |
    docker run --rm \
      --name e2e-tests-${{ steps.timestamp.outputs.RUN_TIME }} \
      -e BASE_URL="${{ steps.base-url.outputs.BASE_URL }}" \
      -e HEADLESS=true \
      -e TIMEOUT=30000 \
      -e CI=true \
      -e RUN_TIME="${{ steps.timestamp.outputs.RUN_TIME }}" \
      -e TEST_ENV="${{ github.event.inputs.environment || 'dev' }}" \
      -v "$(pwd)/test-results:/app/test-results" \
      e2e-next-gen:${{ github.sha }} \
      sh -c "${{ steps.test-command.outputs.COMMAND }}"
```

#### 6. Update Results (Always Runs)
```yaml
- name: Update run info with results
  if: always()
  run: |
    STATUS="${{ job.status == 'success' && 'passed' || 'failed' }}"
    EXIT_CODE="${{ job.status == 'success' && '0' || '1' }}"
    RUN_INFO_FILE="test-results/${{ steps.timestamp.outputs.RUN_TIME }}/run-info.json"
    
    # Check if run-info.json exists
    if [ -f "$RUN_INFO_FILE" ]; then
      # Update existing file
      jq --arg status "$STATUS" --arg exitCode "$EXIT_CODE" \
        '. + {status: $status, exitCode: ($exitCode | tonumber)}' \
        "$RUN_INFO_FILE" > temp.json && mv temp.json "$RUN_INFO_FILE"
    else
      # Create new file if missing
      echo "Warning: run-info.json not found"
      # ... creates complete run-info.json
    fi
```

#### 7. Upload Artifacts
```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.test-suite }}-${{ steps.timestamp.outputs.RUN_TIME }}
    path: test-results/${{ steps.timestamp.outputs.RUN_TIME }}/

- name: Upload HTML report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: html-report-${{ matrix.test-suite }}-${{ steps.timestamp.outputs.RUN_TIME }}
    path: test-results/${{ steps.timestamp.outputs.RUN_TIME }}/report.html/
```

## Volume Mounting

### Purpose
Volume mounting allows test results generated inside the Docker container to persist on the host filesystem.

### Configuration
```bash
-v "$(pwd)/test-results:/app/test-results"
```

- **Host Path:** `$(pwd)/test-results` - Current directory's test-results folder
- **Container Path:** `/app/test-results` - Container's test-results folder
- **Effect:** Files written to `/app/test-results` in container appear in host's `./test-results`

### Directory Structure
```
test-results/
└── {RUN_TIME}/                    # e.g., 2025-10-27T23-49-50
    ├── run-info.json             # Test run metadata
    ├── results.json              # Playwright JSON results
    ├── junit.xml                 # JUnit XML results
    ├── report.html/              # HTML report directory
    │   ├── index.html           # Report entry point
    │   └── data/                # Report data files
    └── artifacts/               # Test artifacts
        ├── *.webm               # Video recordings
        ├── *.png                # Screenshots
        └── .last-run.json       # Playwright metadata
```

## Environment Variables

### Core Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `RUN_TIME` | Unique test run identifier | `2025-10-27T23-49-50` |
| `BASE_URL` | Application base URL | `https://www.nike.com/vn` |
| `HEADLESS` | Headless browser mode | `true` |
| `CI` | CI/CD mode indicator | `true` |
| `TEST_ENV` | Target environment | `dev`, `staging`, `prod` |
| `TIMEOUT` | Test timeout (ms) | `30000` |

### Playwright Configuration Usage
```typescript
// playwright.config.ts
const runTime = process.env.RUN_TIME || new Date().toISOString()...
const outputDir = `test-results/${runTime}`;

export default defineConfig({
  outputDir: `${outputDir}/artifacts`,
  reporter: [
    ['html', { outputFolder: `${outputDir}/report.html` }],
    ['json', { outputFile: `${outputDir}/results.json` }],
    ['junit', { outputFile: `${outputDir}/junit.xml` }]
  ],
  use: {
    baseURL: EnvConfig.BASE_URL,
    headless: EnvConfig.HEADLESS,
    video: 'on',
    screenshot: 'on'
  }
});
```

## Run Info Metadata

### Schema
```json
{
  "runTime": "2025-10-27T23-49-50",
  "environment": "dev",
  "testSuite": "smoke",
  "baseUrl": "https://www.nike.com/vn",
  "headless": "true",
  "browser": "chromium",
  "workers": "4",
  "command": "npx playwright test tests/smoke",
  "timestamp": "2025-10-27 23:49:50",
  "status": "passed",
  "exitCode": 0,
  
  // GitHub Actions only
  "gitRef": "refs/heads/main",
  "gitSha": "abc123def456",
  "actor": "username",
  "workflow": "E2E Test Suite",
  "runNumber": "42"
}
```

### Status Values
- `passed` - All tests passed (exit code 0)
- `failed` - One or more tests failed (exit code > 0)

## Playwright Configuration

### Key Settings

**Test Directory Structure:**
```typescript
testDir: './tests'
```
- Tests organized by suite: `tests/smoke/`, `tests/functional/`, etc.

**Parallel Execution:**
```typescript
fullyParallel: true
```
- All tests run in parallel for faster execution

**Retry Strategy:**
```typescript
retries: process.env.CI ? 2 : 0
```
- CI: 2 retries for flaky test resilience
- Local: No retries for faster feedback

**Artifact Recording:**
```typescript
use: {
  video: 'on',           // Record video for all tests
  screenshot: 'on'       // Take screenshots on all actions
}
```

## Error Handling

### Local Execution
1. **Docker Not Available**
   ```
   ❌ Error: Docker is not installed or not in PATH
   Please install Docker: https://www.docker.com/products/docker-desktop/
   ```

2. **Docker Daemon Not Running**
   ```
   ❌ Error: Docker daemon is not running
   Please start Docker Desktop
   ```

3. **Invalid Parameters**
   ```
   ❌ Error: Workers must be between 1 and 10
   ```

### GitHub Actions
1. **Missing run-info.json**
   - Workflow creates fallback file with available metadata
   - Prevents artifact upload failure

2. **Test Failure**
   - Artifacts still uploaded with `if: always()`
   - Status marked as `failed` in run-info.json
   - Workflow continues to upload results

## Troubleshooting

### Tests Not Running
**Symptom:** Container starts but no tests execute

**Solution:** Check Playwright config location
- Must be at workspace root: `playwright.config.ts`
- Not in subdirectory: `config/playwright.config.ts`

### Reports Not Generated
**Symptom:** Only `run-info.json` created, no HTML/JSON/XML reports

**Solution:** Verify volume mount and config paths
```bash
# Check volume mount
docker run ... -v "$(pwd)/test-results:/app/test-results"

# Verify config paths in playwright.config.ts
outputDir: `test-results/${runTime}/artifacts`
reporter: [
  ['html', { outputFolder: `test-results/${runTime}/report.html` }]
]
```

### Permission Issues (Linux)
**Symptom:** Cannot write to test-results directory

**Solution:** Set proper permissions
```bash
chmod -R 755 test-results/
```

## Best Practices

### 1. Use Consistent Timestamps
- Always use `RUN_TIME` environment variable
- Format: `YYYY-MM-DDTHH-mm-ss` (safe for filesystems)

### 2. Volume Mounting
- Always mount `test-results` directory
- Use absolute paths in Docker Compose
- Use relative paths in scripts

### 3. Clean Up Old Results
```bash
# Keep only last 7 days of results
find test-results/ -type d -mtime +7 -exec rm -rf {} +
```

### 4. Artifact Retention
- GitHub Actions: 30 days (configurable)
- Local: Manual cleanup or automated script

### 5. CI/CD Optimization
- Use Docker layer caching
- Cache npm dependencies
- Run critical tests (smoke) first
- Use matrix strategy for parallel suite execution

## Additional Resources

- [Docker Documentation](../DOCKER.md)
- [GitHub Actions Workflow](.github/workflows/test.yml)
- [PowerShell Script](../scripts/run-docker-tests.ps1)
- [Bash Script](../scripts/run-docker-tests.sh)
- [Playwright Configuration](../playwright.config.ts)
