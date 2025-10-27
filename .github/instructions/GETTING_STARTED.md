# Getting Started with Docker Test Execution

This guide will help you get started with running tests using Docker in under 5 minutes.

## 🚀 Quick Start (5 minutes)

### Step 1: Verify Prerequisites (1 minute)

Check that you have the required tools installed:

```bash
# Check Node.js (should be v16+)
node --version

# Check npm
npm --version

# Check Docker
docker --version

# Check Docker is running
docker ps
```

If any are missing:
- **Node.js**: Download from [nodejs.org](https://nodejs.org/)
- **Docker**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)

---

### Step 2: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd e2e-next-gen

# Install npm packages
npm install
```

This installs all required dependencies including Playwright and TypeScript.

---

### Step 3: Build Docker Image (2 minutes)

```bash
# Build the Docker image
npm run docker:build
```

This creates a Docker image with:
- ✅ Node.js environment
- ✅ All project dependencies
- ✅ Playwright browsers (Chromium, Firefox, WebKit)
- ✅ Test configuration

---

### Step 4: Run Your First Test (1 minute)

```bash
# Run smoke tests
npm run docker:test:smoke
```

You should see:
1. Docker container starting
2. Tests executing
3. Results summary
4. Test report generated

---

### Step 5: View Results (1 minute)

Open the HTML report:

**Windows:**
```powershell
# Find the latest timestamp folder in test-results/
# Open: test-results/[timestamp]/report.html/index.html
start test-results\2024-01-15T10-30-00\report.html\index.html
```

**Mac/Linux:**
```bash
open test-results/[timestamp]/report.html/index.html
```

---

## 🎓 Next Steps

### Run Different Test Suites

```bash
# Run functional tests
npm run docker:test:functional

# Run regression tests
npm run docker:test:regression

# Run all tests
npm run docker:test
```

### Use Custom Parameters

**PowerShell (Windows):**
```powershell
# Test a different environment
.\scripts\run-docker-tests.ps1 -Environment staging -TestSuite smoke

# Test a different URL
.\scripts\run-docker-tests.ps1 -BaseUrl "https://staging.example.com"

# Run in headed mode (with browser UI)
.\scripts\run-docker-tests.ps1 -Headless false
```

**Bash (Mac/Linux):**
```bash
# Test a different environment
./scripts/run-docker-tests.sh -e staging -t smoke

# Test a different URL
./scripts/run-docker-tests.sh -u "https://staging.example.com"

# Run in headed mode
./scripts/run-docker-tests.sh -h false
```

### View Test History

```bash
# See all test runs
npm run test:summary
```

This shows:
- Total test runs
- Pass/fail statistics
- Recent test history

---

## 🐳 Docker Compose Alternative

If you prefer Docker Compose:

```bash
# Build
docker-compose build

# Run smoke tests
docker-compose run --rm smoke-tests

# Run functional tests
docker-compose run --rm functional-tests

# Run all tests
docker-compose run --rm e2e-tests
```

With custom environment:
```bash
BASE_URL=https://staging.example.com docker-compose run --rm smoke-tests
```

---

## 🔄 CI/CD Integration

### Setup GitHub Actions

The workflow is already configured! Just:

1. Commit and push your code:
   ```bash
   git add .
   git commit -m "Add Docker test execution"
   git push
   ```

2. GitHub Actions will automatically:
   - Build Docker image
   - Run tests
   - Generate reports
   - Upload artifacts

### Manual Trigger

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **E2E Test Suite** workflow
4. Click **Run workflow**
5. Choose parameters:
   - Environment (dev/staging/prod)
   - Test suite (smoke/functional/regression/all)
   - Custom URL (optional)

---

## 💡 Common Use Cases

### Daily Development
```bash
# Quick smoke test before committing
npm run docker:test:smoke

# View results
npm run test:summary
```

### Before Deployment
```bash
# Full regression suite against staging
.\scripts\run-docker-tests.ps1 `
  -Environment staging `
  -TestSuite regression `
  -BaseUrl "https://staging.example.com"
```

### Testing New Features
```bash
# Run specific test suite with custom URL
npm run docker:test:functional

# Check the results
# Open: test-results/[timestamp]/report.html/index.html
```

### Maintenance
```bash
# Cleanup old test results (30+ days)
npm run test:cleanup

# Rebuild Docker image (after updates)
npm run docker:build
```

---

## 🛠️ Troubleshooting

### Docker Not Running
```bash
# Windows: Open Docker Desktop
# Mac: Open Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker
```

### Permission Denied (Linux/Mac)
```bash
# Make scripts executable
chmod +x scripts/run-docker-tests.sh

# Or run with bash
bash scripts/run-docker-tests.sh
```

### PowerShell Execution Policy (Windows)
```powershell
# If script won't run, set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Build Fails
```bash
# Clear Docker cache and rebuild
docker system prune -a
npm run docker:build
```

### Tests Fail
```bash
# Run in headed mode to see what's happening
.\scripts\run-docker-tests.ps1 -Headless false

# Check the artifacts
ls test-results\[timestamp]\artifacts\
```

---

## 📚 Learn More

| Resource | Description |
|----------|-------------|
| [README.md](README.md) | Complete project documentation |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick command reference |
| [DOCKER.md](DOCKER.md) | Docker Compose details |
| [Playwright Docs](https://playwright.dev/) | Official Playwright documentation |

---

## ✅ Verification Checklist

Before you start, ensure:
- [ ] Node.js v16+ installed
- [ ] Docker installed and running
- [ ] Project dependencies installed (`npm install`)
- [ ] Docker image built (`npm run docker:build`)

After first run, verify:
- [ ] Tests executed successfully
- [ ] Test results folder created: `test-results/[timestamp]/`
- [ ] HTML report generated
- [ ] `run-info.json` contains test metadata
- [ ] `test-run-history.json` updated

---

## 🎯 Success!

You're now ready to:
- ✅ Run tests in Docker
- ✅ Configure environments via command line
- ✅ Track test run history
- ✅ Use CI/CD automation
- ✅ Generate comprehensive reports

**Need help?** Check the [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands!

---

## 🔗 Quick Links

```bash
# Build Docker image
npm run docker:build

# Run tests
npm run docker:test:smoke        # Smoke tests
npm run docker:test:functional   # Functional tests
npm run docker:test:regression   # Regression tests

# View history
npm run test:summary             # Test history

# Cleanup
npm run test:cleanup             # Remove old results
```

Happy Testing! 🎉
