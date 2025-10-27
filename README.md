# E2E Next-Gen Testing Framework

A modern end-to-end testing framework built with Playwright and TypeScript, featuring Docker-based test execution, CI/CD integration, and comprehensive test run tracking.

## 🚀 Features

- **Page Object Model (POM)**: Organized and reusable page objects
- **TypeScript**: Strong typing for better IDE support and fewer runtime errors
- **Playwright**: Fast and reliable cross-browser automation
- **Docker Support**: Containerized test execution for consistency
- **CI/CD Integration**: GitHub Actions workflow for automated testing
- **Test Run Tracking**: Automatic logging and historical tracking of test runs
- **Multiple Reporters**: HTML, JSON, and JUnit XML reports
- **Configurable**: Environment-based configuration for different test environments

## 📁 Project Structure

```
e2e-next-gen/
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions CI/CD workflow
├── config/
│   ├── env.config.ts             # Environment configuration
│   └── playwright.config.ts      # Playwright configuration
├── pages/                        # Page Object Models
│   ├── BasePage.ts               # Base page with common methods
│   ├── HomePage.ts               # Home page object
│   └── SearchPage.ts             # Search page object
├── tests/                        # Test files
│   ├── smoke/                    # Smoke tests
│   ├── functional/               # Functional tests
│   ├── regression/               # Regression tests
│   └── api/                      # API tests
├── utils/
│   ├── test-helpers.ts           # Test fixtures and helpers
│   ├── TestRunLogger.ts          # Test run logging utility
│   └── helpers/                  # Additional utilities
├── data/
│   ├── fixtures/                 # Test data fixtures
│   └── schemas/                  # JSON schemas
├── scripts/
│   ├── run-docker-tests.ps1      # PowerShell Docker test runner
│   └── run-docker-tests.sh       # Bash Docker test runner
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Docker Compose configuration
└── .env.example                  # Environment variables template
```

## 🛠️ Setup

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Docker** (for Docker-based execution)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hieucan99/e2e-next-gen.git
   cd e2e-next-gen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` file with your configuration:
   ```env
   BASE_URL=https://www.nike.com/vn
   HEADLESS=true
   TIMEOUT=30000
   ```

## 🧪 Running Tests

### Local Execution

#### Run all tests
```bash
npm test
```

#### Run specific test suites
```bash
npm run test:smoke         # Smoke tests
npm run test:functional    # Functional tests
npm run test:regression    # Regression tests
npm run test:api           # API tests
```

#### Other test modes
```bash
npm run test:headed        # Run with browser UI
npm run test:debug         # Debug mode
npm run test:ui            # Interactive UI mode
```

### Docker Execution

#### Build Docker image
```bash
npm run docker:build
# or
docker build -t e2e-next-gen:latest .
```

#### Run tests in Docker

**Using npm scripts:**
```bash
npm run docker:test                # All tests
npm run docker:test:smoke          # Smoke tests
npm run docker:test:functional     # Functional tests
npm run docker:test:regression     # Regression tests
```

**Using PowerShell script (Windows):**
```powershell
# Basic usage
.\scripts\run-docker-tests.ps1

# Run specific suite
.\scripts\run-docker-tests.ps1 -TestSuite smoke

# With custom parameters
.\scripts\run-docker-tests.ps1 -Environment staging -TestSuite functional -Build

# Custom URL and browser
.\scripts\run-docker-tests.ps1 -BaseUrl "https://example.com" -Browser firefox

# Run in headed mode
.\scripts\run-docker-tests.ps1 -Headless false
```

**Using Bash script (Linux/Mac):**
```bash
# Basic usage
./scripts/run-docker-tests.sh

# Run specific suite
./scripts/run-docker-tests.sh -t smoke

# With custom parameters
./scripts/run-docker-tests.sh -e staging -t functional --build

# Custom URL and browser
./scripts/run-docker-tests.sh -u "https://example.com" -b firefox

# Run in headed mode
./scripts/run-docker-tests.sh -h false
```

#### Script Parameters

| Parameter | PowerShell | Bash | Default | Description |
|-----------|------------|------|---------|-------------|
| Environment | `-Environment` | `-e`, `--environment` | `dev` | Test environment (dev/staging/prod) |
| Test Suite | `-TestSuite` | `-t`, `--test-suite` | `all` | Suite to run (smoke/functional/regression/api/all) |
| Base URL | `-BaseUrl` | `-u`, `--base-url` | From env | Application URL |
| Headless | `-Headless` | `-h`, `--headless` | `true` | Headless mode (true/false) |
| Browser | `-Browser` | `-b`, `--browser` | `chromium` | Browser (chromium/firefox/webkit) |
| Workers | `-Workers` | `-w`, `--workers` | `4` | Parallel workers (1-10) |
| Build | `-Build` | `--build` | `false` | Build image before run |
| Help | `-Help` | `--help` | - | Show help message |

### Docker Compose

```bash
# Build
docker-compose build

# Run all tests
docker-compose run --rm e2e-tests

# Run specific suites
docker-compose run --rm smoke-tests
docker-compose run --rm functional-tests
docker-compose run --rm regression-tests

# With custom environment
BASE_URL=https://staging.example.com docker-compose run --rm smoke-tests
```

## 📊 Test Results & Reports

### Result Structure

All test results are saved with timestamps in `test-results/[runTime]/`:

```
test-results/
├── 2024-10-27T10-30-00/
│   ├── report.html/          # HTML test report
│   │   └── index.html
│   ├── results.json          # JSON test results
│   ├── junit.xml             # JUnit XML report
│   ├── run-info.json         # Test run metadata
│   └── artifacts/            # Screenshots, videos, traces
└── test-run-history.json     # Historical records
```

### View Reports

```bash
# Show HTML report
npm run test:report

# View test run history
npm run test:summary

# Clean old results (30+ days)
npm run test:cleanup
```

### Test Run Recording

Each test run is automatically recorded with:
- Unique timestamp identifier
- Environment and suite information
- Test parameters (URL, browser, workers)
- Test results (status, exit code, duration)
- Git information (in CI/CD)

## 🔄 CI/CD Integration

### GitHub Actions

The project includes automated CI/CD via GitHub Actions (`.github/workflows/test.yml`).

#### Automatic Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

#### Manual Trigger
1. Go to **Actions** → **E2E Test Suite**
2. Click **Run workflow**
3. Configure parameters:
   - **Environment**: dev, staging, or prod
   - **Test Suite**: smoke, functional, regression, api, or all
   - **Base URL**: Optional custom URL

#### Workflow Features
- ✅ Docker-based test execution
- ✅ Matrix strategy for parallel execution
- ✅ Automatic artifact upload (30-day retention)
- ✅ Test summary in GitHub UI
- ✅ Test run recording with Git metadata

#### View CI/CD Results
1. Navigate to **Actions** tab
2. Click on workflow run
3. View test summary
4. Download artifacts:
   - `test-results-[suite]-[timestamp]`
   - `html-report-[suite]-[timestamp]`

## 🔧 Configuration

### Environment Variables

Configure in `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application URL to test | Required |
| `HEADLESS` | Run in headless mode | `true` |
| `BROWSER_TIMEOUT` | Browser timeout (ms) | `30000` |
| `CI` | CI mode flag | `false` |
| `TEST_ENV` | Environment name | `dev` |

### Playwright Configuration

Modify `config/playwright.config.ts` to adjust:
- Test directory and timeout settings
- Number of retries
- Browser configurations
- Reporter settings
- Dynamic report paths

## 📝 Writing Tests

### Test Structure

Tests follow the Page Object Model pattern:

```typescript
import { test, expect } from '../../utils/test-helpers';

test.describe('Feature Name', () => {
  
  test('Test case description @smoke', async ({ page, homePage }) => {
    
    await test.step('Step 1: Navigate to home page', async () => {
      await homePage.navigate();
      expect(await homePage.verifyOnHomePage()).toBe(true);
    });
    
    await test.step('Step 2: Perform action', async () => {
      // Test actions and assertions
    });
  });
});
```

### Using Page Objects

Page objects are automatically injected via fixtures:

```typescript
test('Example test', async ({ homePage, searchPage }) => {
  await homePage.navigate();
  await homePage.clickSearchButton();
  // Page object methods handle all locators and actions
});
```

## 🧩 Best Practices

### Local Development
1. Build Docker image: `npm run docker:build`
2. Run smoke tests frequently: `npm run docker:test:smoke`
3. Review results in `test-results/[timestamp]/report.html`

### Pre-deployment Testing
1. Run full regression against staging
2. Review test run history for trends
3. Ensure acceptable pass rate

### CI/CD
1. Let automated tests run on every push
2. Use manual trigger for ad-hoc testing
3. Review artifacts for failures
4. Monitor test history for flakiness

### Maintenance
1. Cleanup old results regularly: `npm run test:cleanup`
2. Update Docker image when Playwright updates
3. Review and archive important test runs
4. Monitor disk space usage

## 📚 Additional Documentation

- [DOCKER.md](DOCKER.md) - Detailed Docker Compose guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference
- [GETTING_STARTED.md](GETTING_STARTED.md) - Step-by-step setup guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Feature implementation details

## 🆘 Troubleshooting

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
# Run in headed mode to see browser
.\scripts\run-docker-tests.ps1 -Headless false

# Check test logs
cat test-results/[timestamp]/run-info.json

# View artifacts (screenshots, videos)
ls test-results/[timestamp]/artifacts/
```

### Permission Issues

**Windows:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Linux/Mac:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

## 🤝 Contributing

1. Follow existing code structure
2. Use Page Object Model pattern
3. Write clear test descriptions
4. Include proper test tags
5. Follow TypeScript best practices
6. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
