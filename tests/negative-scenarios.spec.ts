import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerAccountPage } from '../pages/CustomerAccountPage';

/**
 * Bonus Test: Negative Scenarios
 * 
 * This test suite verifies that the application handles invalid inputs correctly:
 * 1. Empty deposit amount
 * 2. Zero deposit amount
 * 3. Non-numeric values
 */
test.describe('Banking Application - Negative Scenarios', () => {
  test('should handle empty deposit amount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    
    const initialBalance = await accountPage.getCurrentBalance();
    
    await accountPage.clickDepositTab();
    
    // Try to click deposit with empty field - HTML5 validation should prevent submission
    await accountPage.clickDepositButton();
    
    // Verify the HTML5 validation error message appears
    await accountPage.verifyAmountInputValidationMessage('Please fill out this field.');
    
    // Verify the input field is still visible (form didn't submit)
    await accountPage.verifyAmountInputIsVisible();
    
    // Verify balance remains unchanged
    const balanceAfter = await accountPage.getCurrentBalance();
    expect(balanceAfter).toBe(initialBalance);
  });

  test('should handle zero deposit amount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    
    const initialBalance = await accountPage.getCurrentBalance();
    
    await accountPage.clickDepositTab();
    
    // Enter zero amount
    await accountPage.fillDepositAmount('0');
    await accountPage.clickDepositButton();
    
    // Verify balance remains unchanged (zero deposit should not affect balance)
    const balanceAfter = await accountPage.getCurrentBalance();
    expect(balanceAfter).toBe(initialBalance);
  });

  test('should verify input field prevents non-numeric entry', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    await accountPage.clickDepositTab();
    
    // Verify the input field is type="number" which prevents non-numeric entry
    await accountPage.verifyAmountInputType('number');
    
    // Try to type non-numeric characters - they should be filtered out by the browser
    await accountPage.clickAmountInput();
    await page.keyboard.type('xyz');
    
    // Verify input remains empty (browser filters non-numeric characters)
    await accountPage.verifyAmountInputIsEmpty();
    
    // Try to submit with empty field - should show validation message
    await accountPage.clickDepositButton();
    await accountPage.verifyAmountInputValidationMessage('Please fill out this field.');
  });
});
