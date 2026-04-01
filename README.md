# Banking Application Automated Tests

Automated end-to-end browser tests for the GlobalsQA Banking Application using Playwright and TypeScript.

## Overview

This project contains comprehensive end-to-end tests for a demo AngularJS banking application. The tests automate user flows including customer login, deposits, withdrawals, and transaction verification with proper assertions and validation.

**Application URL:** https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run all tests
npm test

# Run tests with visible browser
npm run test:headed

# View test report (after running tests)
npm run test:report
```

## Requirements Checklist

### Core Requirements ✅
- ✅ Uses Playwright with TypeScript
- ✅ Navigates to banking app login page
- ✅ Clicks "Customer Login"
- ✅ Selects "Harry Potter" from dropdown
- ✅ Clicks Login
- ✅ Clicks "Deposit" tab
- ✅ Enters 100 in amount field
- ✅ Clicks Deposit button
- ✅ Verifies "Deposit Successful" message
- ✅ Clicks "Transactions" tab
- ✅ Asserts transaction exists with correct amount, type, and date (using Playwright's built-in assertions)
- ✅ Tests run and pass from command line
- ✅ Includes README with approach explanation
- ✅ Inline comments explaining key decisions

### Bonus Features ✅
- ✅ **Screenshots**: Automatic screenshots at key steps saved to `screenshots/` folder
- ✅ **Page Object Model**: Clean architecture with BasePage, LoginPage, and CustomerAccountPage
- ✅ **Withdrawal Tests**: Successful withdrawal and insufficient balance scenarios
- ✅ **Negative Tests**: Empty values, zero amounts, and non-numeric input validation
- ✅ **Comprehensive Assertions**: Messages, balance changes, and transaction history verification

## Project Structure

```
.
├── pages/                      # Page Object Model
│   ├── BasePage.ts            # Base page with common functionality
│   ├── LoginPage.ts           # Login page interactions
│   └── CustomerAccountPage.ts # Account operations (deposit/withdrawal/transactions)
├── tests/                      # Test specifications
│   ├── banking.spec.ts        # Main deposit flow test
│   ├── withdrawal.spec.ts     # Withdrawal flow tests
│   └── negative-scenarios.spec.ts # Negative test cases
├── screenshots/                # Auto-generated screenshots (created on first run)
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd globalsqa
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

### Run all tests (headless mode):
```bash
npm test
```

### Run tests with browser visible:
```bash
npm run test:headed
```

### Run tests in UI mode (interactive):
```bash
npm run test:ui
```

### Run tests in debug mode:
```bash
npm run test:debug
```

### Run specific test file:
```bash
npx playwright test tests/banking.spec.ts
```

### View test report:
```bash
npm run test:report
```

## Test Approach

### Page Object Model (POM)

The project uses the Page Object Model design pattern for better maintainability and reusability:

1. **BasePage**: Contains common functionality like screenshot capture and Angular wait utilities
2. **LoginPage**: Handles all login-related interactions
3. **CustomerAccountPage**: Manages account operations (deposits, withdrawals, transactions)

### Key Design Decisions

1. **AngularJS Handling**: The application uses AngularJS, which can have timing issues. The `waitForAngular()` method waits for network idle + buffer time to ensure the app is ready before interactions.

2. **Retry Logic for Resilience**: 
   - **Navigation retries**: Up to 3 retries if initial page load fails or is blank
   - **Tab click retries**: Deposit, Withdrawal, and Transactions tabs retry up to 2 times if content doesn't load
   - **Transaction table validation**: Verifies table has actual data rows, not just visible but empty
   - Automatic page reload on navigation failures to handle AngularJS bootstrap issues

3. **Page Object Model Architecture**:
   - **BasePage**: Common functionality (screenshots, Angular waits)
   - **LoginPage**: Encapsulates login flow with automatic retry on failure
   - **CustomerAccountPage**: All locators defined at class level for consistency
   - All page interactions go through POM methods (no direct `page.locator()` in tests)
   - Back button properly utilized for transaction tab navigation

3. **Comprehensive Assertions**:
   - Success/error messages verified (e.g., "Deposit Successful", "Transaction Failed")
   - Balance changes validated mathematically
   - Transaction history verified with amount, type (Credit/Debit), and date
   - HTML5 validation messages checked for empty inputs

4. **Transaction Date Verification**: Transactions are verified to match today's date in format "MMM DD, YYYY" (e.g., "Apr 1, 2026"), ignoring time to avoid flakiness.

5. **Screenshots**: Automatic screenshots captured at key steps:
   - Login page
   - After customer selection
   - Deposit/withdrawal tabs
   - Amount entered
   - After submission
   - Transaction history view
   - Error states

6. **Robust Test Design**: 
   - Tests don't rely on exact transaction count (app accumulates transactions)
   - Withdrawal tests use small amounts to work with existing balance
   - Negative tests verify both UI validation and unchanged state
   - Retry mechanisms handle AngularJS timing and initialization issues
   - Balance selector correctly targets balance value (not account number)

### Test Coverage

#### 1. Main Deposit Flow (`banking.spec.ts`) ✅
- Navigates to banking application
- Logs in as "Harry Potter" customer
- Makes a $100 deposit
- Verifies "Deposit Successful" message
- Verifies balance update
- Confirms transaction appears in history with correct amount, type (Credit), and date

#### 2. Withdrawal Flow (`withdrawal.spec.ts`) ✅
- **Successful withdrawal**: 
  - Deposits money as precondition
  - Withdraws $50
  - Verifies balance is correctly decreased
  - Confirms withdrawal appears in transaction history as "Debit"
  - Validates transaction date matches today
- **Insufficient balance scenario**:
  - Attempts withdrawal exceeding current balance
  - Verifies "Transaction Failed" error message
  - Confirms balance remains unchanged

#### 3. Negative Scenarios (`negative-scenarios.spec.ts`) ✅
- **Empty deposit amount**: Verifies HTML5 validation message "Please fill out this field."
- **Zero deposit amount**: Ensures zero deposits don't affect balance
- **Non-numeric values**: Verifies input field type="number" prevents non-numeric entry

## Test Results

All tests pass successfully:

```
✓ Banking Application - Deposit Flow
  ✓ should successfully deposit $100 and verify transaction

✓ Banking Application - Negative Scenarios  
  ✓ should handle empty deposit amount
  ✓ should handle zero deposit amount
  ✓ should verify input field prevents non-numeric entry

✓ Banking Application - Withdrawal Flow
  ✓ should successfully withdraw money and update balance
  ✓ should not allow withdrawal exceeding balance

5 passed
```

All tests are designed to:
- Run independently without dependencies
- Handle the app's accumulated state gracefully
- Provide clear console output
- Capture screenshots at key steps for debugging
- Use Playwright's built-in assertions (`expect`, `toBeVisible`, `toHaveValue`, etc.)
- Verify both UI messages and data changes (balance, transactions)

## Troubleshooting

### Tests are slow
The AngularJS application can be slow to load. The tests include appropriate waits (`waitForAngular()` and `networkidle`) to handle this.

### Selectors not working
The app uses AngularJS directives (e.g., `ng-click`). The tests use role-based selectors (`getByRole`) where possible for better resilience.

### Screenshots not saving
Ensure the `screenshots/` directory has write permissions. The tests will create it automatically if it doesn't exist.

### TypeScript errors
If you see errors like "Cannot find name 'HTMLInputElement'", ensure your `tsconfig.json` includes `"DOM"` in the `lib` array.

## CI/CD Considerations

The `playwright.config.ts` includes robust settings for both local and CI environments:
- Retries enabled (2 retries) for flaky test resilience
- 90-second test timeout to handle slow AngularJS initialization
- 60-second action timeout for individual operations
- Single worker in CI for stability
- Trace and video on first retry for debugging

## Notable Implementation Details

1. **Reliable Selectors**: Uses role-based selectors (`getByRole`) where possible for resilience
2. **Retry Mechanisms**: 
   - Navigation retries (up to 3) for initial page load failures
   - Tab interaction retries (up to 2) with automatic tab switching on failure
   - Transaction table validation ensures data is loaded, not just empty table structure
3. **Explicit Waits**: Strategic timeouts ensure AngularJS digest cycles complete
4. **All Locators at Class Level**: All page element locators declared at the top of each Page Object class including Back button
5. **Type Safety**: Full TypeScript implementation with strict mode and DOM types enabled
6. **Date Format Handling**: Transaction dates verified in "MMM DD, YYYY" format
7. **HTML5 Validation**: Leverages and verifies browser's native input validation for type="number" fields
8. **Correct Balance Selector**: Balance display selector properly targets balance value (not account number)
9. **Test Independence**: Each test can run independently without external preconditions

## Technologies Used

- **Playwright**: v1.58.2 - Modern browser automation framework
- **TypeScript**: v6.0.2 - Type-safe JavaScript superset
- **Node.js**: v16+ - Runtime environment

## Environment Tested

- **Node.js**: v16 or higher
- **npm**: v7 or higher  
- **Playwright**: v1.58.2
- **TypeScript**: v6.0.2
- **OS**: Cross-platform (macOS, Linux, Windows)

## Next Steps for Production Use

If this were a production test suite, consider:
1. Add data cleanup/reset between test runs
2. Implement retry logic for flaky network conditions
3. Configure parallel test execution for faster runs
4. Integrate with CI/CD pipeline (GitHub Actions, Jenkins, etc.)
5. Add performance monitoring
6. Implement test data management strategy
7. Add accessibility testing (WCAG compliance)
8. Add visual regression testing
