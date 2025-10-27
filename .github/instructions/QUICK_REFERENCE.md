# Docker & CI/CD Quick Reference Guide

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Build Docker image
npm run docker:build

# 3. Run smoke tests
npm run docker:test:smoke
```

## 🐳 Docker Commands

### Build & Run
```bash
# Build Docker image
npm run docker:build
docker build -t e2e-next-gen:latest .

# Run all tests
npm run docker:test
.\scripts\run-docker-tests.ps1

# Run with build
npm run docker:test:build
.\scripts\run-docker-tests.ps1 -Build
```

### Test Suites
```bash
# Smoke tests
npm run docker:test:smoke
.\scripts\run-docker-tests.ps1 -TestSuite smoke

# Functional tests
npm run docker:test:functional
.\scripts\run-docker-tests.ps1 -TestSuite functional

# Regression tests
npm run docker:test:regression
.\scripts\run-docker-tests.ps1 -TestSuite regression
```

### Custom Parameters
```powershell
# PowerShell examples
.\scripts\run-docker-tests.ps1 -Environment staging -TestSuite smoke
.\scripts\run-docker-tests.ps1 -BaseUrl "https://example.com"
.\scripts\run-docker-tests.ps1 -Headless false -Browser firefox
```

```bash
# Bash examples
./scripts/run-docker-tests.sh -e staging -t smoke
./scripts/run-docker-tests.sh -u "https://example.com"
./scripts/run-docker-tests.sh -h false -b firefox
```

## 🔄 Docker Compose

### Basic Usage
```bash
# Build
docker-compose build

# Run all tests
docker-compose run --rm e2e-tests

# Run specific suite
docker-compose run --rm smoke-tests
docker-compose run --rm functional-tests
docker-compose run --rm regression-tests
```

### With Environment Variables
```bash
# Single variable
BASE_URL=https://staging.example.com docker-compose run --rm smoke-tests

# Using .env file
docker-compose --env-file .env.staging run --rm e2e-tests

# With timestamp
RUN_TIME=$(date -u +%Y-%m-%dT%H-%M-%S) docker-compose run --rm smoke-tests
```

## 📊 Test Results & Reports

### View Results
```bash
# HTML report (latest run)
start test-results\[timestamp]\report.html\index.html

# Test run history
npm run test:summary

# Cleanup old results (30+ days)
npm run test:cleanup
```

### Result Structure
```
test-results/
├── [timestamp]/
│   ├── report.html/          # HTML test report
│   ├── results.json          # JSON results
│   ├── junit.xml            # JUnit report
│   ├── run-info.json        # Test run metadata
│   └── artifacts/           # Screenshots, videos
└── test-run-history.json    # Historical records
```

## 🔄 CI/CD (GitHub Actions)

### Automatic Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Manual Trigger
1. Go to **Actions** → **E2E Test Suite**
2. Click **Run workflow**
3. Select:
   - Environment: `dev`, `staging`, or `prod`
   - Test Suite: `smoke`, `functional`, `regression`, `api`, or `all`
   - Base URL: (optional)

### View Results
1. Navigate to **Actions** tab
2. Click workflow run
3. Check summary
4. Download artifacts:
   - `test-results-[suite]-[timestamp]`
   - `html-report-[suite]-[timestamp]`

## 🛠️ Environment Variables

### Required
- `BASE_URL` - Application URL to test

### Optional
- `HEADLESS` - Headless mode (default: `true`)
- `TIMEOUT` - Test timeout (default: `30000`)
- `TEST_ENV` - Environment name (default: `dev`)
- `RUN_TIME` - Test run timestamp (auto-generated)

### Set Variables
```bash
# In .env file
BASE_URL=https://www.nike.com/vn
HEADLESS=true
TIMEOUT=30000

# Command line (PowerShell)
.\scripts\run-docker-tests.ps1 -BaseUrl "https://example.com"

# Command line (Bash)
./scripts/run-docker-tests.sh -u "https://example.com"

# Docker Compose
BASE_URL=https://example.com docker-compose run --rm smoke-tests
```

## 📝 Script Parameters

### PowerShell Script Parameters
| Parameter | Short | Description | Default |
|-----------|-------|-------------|---------|
| `-Environment` | | Environment name | `dev` |
| `-TestSuite` | | Test suite | `all` |
| `-BaseUrl` | | Base URL | `https://www.nike.com/vn` |
| `-Headless` | | Headless mode | `true` |
| `-Browser` | | Browser | `chromium` |
| `-Workers` | | Parallel workers | `4` |
| `-Build` | | Build before run | `false` |
| `-Help` | | Show help | |

### Bash Script Parameters
| Parameter | Short | Description | Default |
|-----------|-------|-------------|---------|
| `--environment` | `-e` | Environment name | `dev` |
| `--test-suite` | `-t` | Test suite | `all` |
| `--base-url` | `-u` | Base URL | `https://www.nike.com/vn` |
| `--headless` | `-h` | Headless mode | `true` |
| `--browser` | `-b` | Browser | `chromium` |
| `--workers` | `-w` | Parallel workers | `4` |
| `--build` | | Build before run | `false` |
| `--help` | | Show help | |

## 🔍 Troubleshooting

### Docker Issues
```bash
# Check Docker is running
docker --version
docker ps

# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t e2e-next-gen:latest .
```

### Test Failures
```bash
# Run in headed mode
.\scripts\run-docker-tests.ps1 -Headless false

# Check test logs
cat test-results/[timestamp]/run-info.json

# View artifacts
ls test-results/[timestamp]/artifacts/
```

### Permission Issues
```bash
# Windows: Run PowerShell as Administrator
# Linux/Mac: Use sudo or fix permissions
chmod +x scripts/run-docker-tests.sh
```

## 📚 Additional Resources

- [DOCKER.md](DOCKER.md) - Detailed Docker documentation
- [README.md](README.md) - Full project documentation
- [Playwright Docs](https://playwright.dev/) - Playwright documentation
- [GitHub Actions Docs](https://docs.github.com/actions) - CI/CD documentation

## 🎯 Common Workflows

### Local Development
```bash
# 1. Build image
npm run docker:build

# 2. Run smoke tests
npm run docker:test:smoke

# 3. Check results
npm run test:summary
```

### Pre-deployment Testing
```bash
# Test against staging
.\scripts\run-docker-tests.ps1 -Environment staging -BaseUrl "https://staging.example.com" -TestSuite functional
```

### CI/CD Pipeline
```bash
# Triggered automatically on push/PR
# Or manually trigger with custom parameters via GitHub Actions UI
```

### Cleanup
```bash
# Remove old test results (30+ days)
npm run test:cleanup

# Clean Docker resources
docker system prune -a
```
