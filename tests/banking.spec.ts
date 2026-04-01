import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerAccountPage } from '../pages/CustomerAccountPage';

/**
 * Main test suite for banking application
 * 
 * This test automates the following user flow:
 * 1. Navigate to the login page
 * 2. Click "Customer Login"
 * 3. Select "Harry Potter" from the dropdown
 * 4. Click Login
 * 5. Click "Deposit" tab
 * 6. Enter 100 in the amount field
 * 7. Click Deposit button
 * 8. Click "Transactions" tab
 * 9. Assert that a transaction row exists showing a deposit of $100
 */
test.describe('Banking Application - Deposit Flow', () => {
  test('User should successfully deposit $100 and record the transaction', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    
    const welcomeMessage = await accountPage.getWelcomeMessage();
    expect(welcomeMessage).toContain('Harry Potter');
    
    await accountPage.makeDeposit(100);
    
    await accountPage.verifyTransactionExists(100, 'Credit');
  });
});
