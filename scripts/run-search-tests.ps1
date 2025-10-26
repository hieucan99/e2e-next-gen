# Test Execution Script for Home Page Search Functionality (PowerShell)
# Usage: .\run-search-tests.ps1 [test-type]

param(
    [string]$TestType = "all"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportDir = "reports/search-tests-$timestamp"

Write-Host "🚀 Starting Home Page Search Tests - Type: $TestType" -ForegroundColor Green
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "📁 Report Directory: $reportDir" -ForegroundColor Cyan

# Create report directory
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

switch ($TestType) {
    "smoke" {
        Write-Host "🔥 Running Smoke Tests..." -ForegroundColor Yellow
        npx playwright test tests/smoke/home-page-search-smoke.spec.ts --reporter=html,junit
    }
    "functional" {
        Write-Host "⚙️ Running Functional Tests..." -ForegroundColor Yellow
        npx playwright test tests/functional/home-page-search.spec.ts --reporter=html,junit
    }
    "regression" {
        Write-Host "🔄 Running Regression Tests..." -ForegroundColor Yellow
        npx playwright test tests/regression/home-page-search-regression.spec.ts --reporter=html,junit
    }
    "all" {
        Write-Host "🎯 Running All Search Tests..." -ForegroundColor Yellow
        npx playwright test tests/**/home-page-search*.spec.ts --reporter=html,junit
    }
    default {
        Write-Host "❌ Invalid test type. Available options: smoke, functional, regression, all" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Test execution completed!" -ForegroundColor Green
Write-Host "📊 Check reports in: playwright-report/" -ForegroundColor Cyan

# Optional: Open report automatically
if (Test-Path "playwright-report/index.html") {
    Write-Host "🌐 Opening test report..." -ForegroundColor Cyan
    Start-Process "playwright-report/index.html"
}