# E2E Next-Gen Testing Framework

A modern end-to-end testing framework built with Playwright and TypeScript, following industry best practices for maintainable and scalable test automation.

## 🚀 Features

- **Page Object Model (POM)**: Organized and reusable page objects
- **TypeScript**: Strong typing for better IDE support and fewer runtime errors
- **Playwright**: Fast and reliable browser automation
- **Test Fixtures**: Custom fixtures for easy test setup
- **Multiple Test Types**: Support for smoke, functional, and regression tests
- **Configurable**: Environment-based configuration for different test environments
- **Reporting**: HTML reports with screenshots and videos on failure

## 📁 Project Structure

```
e2e-next-gen/
├── config/                  # Configuration files
│   ├── env.config.ts       # Environment configuration
│   ├── global.setup.ts     # Global test setup
│   └── playwright.config.ts # Playwright configuration
├── pages/                   # Page Object Models
│   ├── BasePage.ts         # Base page with common methods
│   ├── HomePage.ts         # Home page object
│   └── SearchPage.ts       # Search page object
├── tests/                   # Test files
│   ├── smoke/              # Smoke tests
│   │   └── home-page-access.spec.ts
│   ├── functional/         # Functional tests
│   ├── regression/         # Regression tests
│   └── api/                # API tests
├── utils/                   # Utility files
│   ├── test-helpers.ts     # Test fixtures and helper functions
│   └── helpers/            # Additional helper utilities
├── data/                    # Test data
│   ├── fixtures/           # Test fixtures data
│   └── schemas/            # JSON schemas
├── docs/                    # Documentation
│   ├── smoke-test-cases/   # Smoke test case definitions
│   └── functional-test-case/ # Functional test case definitions
└── reports/                 # Test reports
    ├── html/               # HTML reports
    ├── screenshots/        # Screenshots on failure
    └── junit/              # JUnit reports
```

## 🛠️ Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Smoke tests
npx playwright test tests/smoke/

# Functional tests
npx playwright test tests/functional/

# Regression tests
npx playwright test tests/regression/
```

### Run Specific Test File
```bash
npx playwright test tests/smoke/home-page-access.spec.ts
```

### Run Tests with UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Run Tests with Specific Tag
```bash
npx playwright test --grep @smoke
npx playwright test --grep @home-page
```

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## 🔧 Configuration

### Environment Variables

Configure the following in your `.env` file:

- `BASE_URL`: Base URL for the application under test
- `API_BASE_URL`: Base URL for API tests
- `HEADLESS`: Run tests in headless mode (true/false)
- `TIMEOUT`: Default timeout for tests (milliseconds)
- `BROWSER_TIMEOUT`: Browser timeout (milliseconds)

### Playwright Configuration

Modify `config/playwright.config.ts` to adjust:
- Test directory
- Timeout settings
- Number of retries
- Browser configurations
- Reporter settings

## 📝 Writing Tests

### Test Structure

Tests follow the Page Object Model pattern:

```typescript
import { test, expect } from '../../utils/test-helpers';

test.describe('Test Suite Name', () => {
  
  test('Test Case Name @tag1 @tag2', async ({ page, homePage }) => {
    
    await test.step('Step 1: Description', async () => {
      // Test actions
      await homePage.navigate();
      // Assertions
      expect(await homePage.verifyOnHomePage()).toBe(true);
    });
    
    await test.step('Step 2: Description', async () => {
      // More test actions and assertions
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

## 🧩 Test Case Mapping

Each test case in `docs/smoke-test-cases/testcase.json` maps to one test script:

- **Test Case ID**: Used in test name and tags
- **Steps**: Mapped to `test.step()` blocks
- **Expected Results**: Converted to assertions
- **Tags**: Applied as test annotations

## 📋 Current Test Cases

### Smoke Tests
- **S_001**: Verify user could access the Home page
  - Navigate to home page
  - Verify page loads successfully
  - Verify menu bar with required options

## 🤝 Contributing

1. Follow the existing code structure
2. Use Page Object Model pattern
3. Write one test script per test case
4. Include proper test tags
5. Add meaningful test descriptions
6. Follow TypeScript best practices

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 📄 License

This project is licensed under the MIT License.
