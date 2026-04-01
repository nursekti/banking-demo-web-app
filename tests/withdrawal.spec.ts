import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerAccountPage } from '../pages/CustomerAccountPage';

/**
 * Bonus Test: Withdrawal Flow
 * 
 * This test verifies that:
 * 1. A user can successfully withdraw money
 * 2. The balance is updated correctly
 * 3. The transaction appears in the transaction history
 */
test.describe('Banking Application - Withdrawal Flow', () => {
  test('should successfully withdraw money and update balance', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    
    // Precondition: Deposit money to ensure sufficient balance for withdrawal
    const depositAmount = 100;
    await accountPage.makeDeposit(depositAmount);
    
    const balanceAfterDeposit = await accountPage.getCurrentBalance();
    const withdrawalAmount = 50;
    
    await accountPage.makeWithdrawal(withdrawalAmount);
    
    // Verify balance is decreased by withdrawal amount
    const newBalance = await accountPage.getCurrentBalance();
    expect(newBalance).toBe(balanceAfterDeposit - withdrawalAmount);
    
    // Verify withdrawal appears in transaction history as Debit
    await accountPage.verifyTransactionExists(withdrawalAmount, 'Debit');
  });

  test('should not allow withdrawal exceeding balance', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const accountPage = new CustomerAccountPage(page);

    await loginPage.loginAsCustomer('Harry Potter');
    
    const currentBalance = await accountPage.getCurrentBalance();
    const excessiveAmount = currentBalance + 1000;
    
    await accountPage.clickWithdrawalTab();
    await accountPage.makeWithdrawal(excessiveAmount);
    
    // Verify error message appears
    await accountPage.verifyWithdrawalFailedMessage();
    
    // Verify balance remains unchanged
    const balanceAfter = await accountPage.getCurrentBalance();
    expect(balanceAfter).toBe(currentBalance);
  });
});
