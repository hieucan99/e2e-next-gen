#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Docker Test Runner - Run Playwright tests in Docker container
.DESCRIPTION
    Executes E2E tests in a Docker container with configurable parameters and automatic test run recording.
.PARAMETER Environment
    Test environment (dev, staging, prod). Default: dev
.PARAMETER TestSuite
    Test suite to run (smoke, functional, regression, api, all). Default: all
.PARAMETER BaseUrl
    Base URL for testing. Default: https://www.nike.com/vn
.PARAMETER Headless
    Run in headless mode (true/false). Default: true
.PARAMETER Browser
    Browser to use (chromium, firefox, webkit). Default: chromium
.PARAMETER Workers
    Number of parallel workers. Default: 4
.PARAMETER Build
    Build Docker image before running tests
.PARAMETER Help
    Display help message
.EXAMPLE
    .\run-docker-tests.ps1 -TestSuite smoke
    .\run-docker-tests.ps1 -Environment staging -TestSuite functional -Build
    .\run-docker-tests.ps1 -BaseUrl "https://example.com" -Headless false
#>

param(
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    
    [ValidateSet("smoke", "functional", "regression", "api", "all", "")]
    [string]$TestSuite = "",
    
    [string]$BaseUrl = "https://www.nike.com/vn",
    
    [ValidateSet("true", "false")]
    [string]$Headless = "true",
    
    [ValidateSet("chromium", "firefox", "webkit")]
    [string]$Browser = "chromium",
    
    [ValidateRange(1, 10)]
    [int]$Workers = 4,
    
    [switch]$Build,
    
    [switch]$Help
)

# Helper function to create/update run-info.json
function Update-RunInfo {
    param(
        [string]$Path,
        [hashtable]$Data,
        [string]$Status = "",
        [int]$ExitCode = -1
    )
    
    $jsonData = $Data.Clone()
    if ($Status) {
        $jsonData["status"] = $Status
        $jsonData["exitCode"] = $ExitCode
    }
    
    $jsonData | ConvertTo-Json | Out-File -FilePath "$Path\run-info.json" -Encoding UTF8
}

# Display help message
if ($Help) {
    Write-Host ""
    Write-Host "Docker Test Runner - Run Playwright tests in Docker container" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run-docker-tests.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Environment    Environment to run tests (dev, staging, prod). Default: dev"
    Write-Host "  -TestSuite      Test suite to run (smoke, functional, regression, api, all). Default: all"
    Write-Host "  -BaseUrl        Base URL for testing. Default: https://www.nike.com/vn"
    Write-Host "  -Headless       Run in headless mode (true/false). Default: true"
    Write-Host "  -Browser        Browser to use (chromium, firefox, webkit). Default: chromium"
    Write-Host "  -Workers        Number of parallel workers (1-10). Default: 4"
    Write-Host "  -Build          Build Docker image before running tests"
    Write-Host "  -Help           Display this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\run-docker-tests.ps1 -TestSuite smoke"
    Write-Host "  .\run-docker-tests.ps1 -Environment staging -TestSuite functional -Build"
    Write-Host "  .\run-docker-tests.ps1 -BaseUrl https://example.com -Headless false"
    Write-Host ""
    exit 0
}

# Verify Docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker daemon is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker daemon is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Generate timestamp for this test run
$RunTime = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$ImageName = "e2e-next-gen:latest"
$ContainerName = "e2e-tests-$RunTime"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Docker Test Execution" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "Test Suite: $(if ($TestSuite) { $TestSuite } else { 'all' })" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Green
Write-Host "Headless: $Headless" -ForegroundColor Green
Write-Host "Browser: $Browser" -ForegroundColor Green
Write-Host "Workers: $Workers" -ForegroundColor Green
Write-Host "Run Time: $RunTime" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Build Docker image if requested
if ($Build) {
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker build -t $ImageName .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker image built successfully!" -ForegroundColor Green
    Write-Host ""
}

# Determine test command based on suite
$TestCommand = "npm test"
$TestDir = "tests"

if ($TestSuite) {
    $TestCommand = switch ($TestSuite.ToLower()) {
        "smoke"      { 
            $TestDir = "tests/smoke"
            "npx playwright test tests/smoke" 
        }
        "functional" { 
            $TestDir = "tests/functional"
            "npx playwright test tests/functional" 
        }
        "regression" { 
            $TestDir = "tests/regression"
            "npx playwright test tests/regression" 
        }
        "api"        { 
            $TestDir = "tests/api"
            "npx playwright test tests/api" 
        }
        "all"        { 
            $TestDir = "tests"
            "npm test" 
        }
        default      { 
            $TestDir = "tests"
            "npm test" 
        }
    }
}

# Check if test directory exists and has test files
$HasTests = $false
if (Test-Path $TestDir) {
    $TestFiles = Get-ChildItem -Path $TestDir -Recurse -Include "*.spec.ts","*.test.ts" -File
    if ($TestFiles.Count -gt 0) {
        $HasTests = $true
        Write-Host "✅ Found $($TestFiles.Count) test file(s) in $TestDir" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No test files found in $TestDir" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Test directory not found: $TestDir" -ForegroundColor Red
}
Write-Host ""

# Create test-results directory if it doesn't exist
$ResultsDir = "test-results\$RunTime"
New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

# Record test run parameters
$RunRecord = @{
    runTime     = $RunTime
    environment = $Environment
    testSuite   = if ($TestSuite) { $TestSuite } else { "all" }
    baseUrl     = $BaseUrl
    headless    = $Headless
    browser     = $Browser
    workers     = $Workers
    command     = $TestCommand
    hasTests    = $HasTests
    timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

Update-RunInfo -Path $ResultsDir -Data $RunRecord

# Skip test execution if no tests found
if (-not $HasTests) {
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "⚠️  Test suite skipped: No test files found" -ForegroundColor Yellow
    Update-RunInfo -Path $ResultsDir -Data $RunRecord -Status "skipped" -ExitCode 0
    Write-Host "Test results saved to: $ResultsDir" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host "Running tests in Docker container..." -ForegroundColor Yellow
Write-Host ""

# Run Docker container with environment variables and mount test-results
docker run --rm `
    --name $ContainerName `
    -e BASE_URL=$BaseUrl `
    -e HEADLESS=$Headless `
    -e TIMEOUT=30000 `
    -e CI=true `
    -e RUN_TIME=$RunTime `
    -e TEST_ENV=$Environment `
    -v "${PWD}/test-results:/app/test-results" `
    $ImageName `
    sh -c "$TestCommand"

$ExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan

# Ensure directory exists before writing (Docker may not have created it on host)
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null
}

# Update run-info.json with results
if ($ExitCode -eq 0) {
    Write-Host "Tests completed successfully!" -ForegroundColor Green
    Update-RunInfo -Path $ResultsDir -Data $RunRecord -Status "passed" -ExitCode $ExitCode
} else {
    Write-Host "Tests failed with exit code: $ExitCode" -ForegroundColor Red
    Update-RunInfo -Path $ResultsDir -Data $RunRecord -Status "failed" -ExitCode $ExitCode
}

Write-Host "Test results saved to: $ResultsDir" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

exit $ExitCode
