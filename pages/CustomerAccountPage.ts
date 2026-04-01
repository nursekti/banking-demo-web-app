import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CustomerAccountPage extends BasePage {
  private readonly transactionsTab: Locator;
  private readonly depositTab: Locator;
  private readonly withdrawalTab: Locator;
  private readonly amountInput: Locator;
  private readonly depositButton: Locator;
  private readonly withdrawButton: Locator;
  private readonly transactionsTable: Locator;
  private readonly balanceDisplay: Locator;
  private readonly logoutButton: Locator;
  private readonly welcomeMessage: Locator;
  private readonly depositSuccessMessage: Locator;
  private readonly transactionRows: Locator;
  private readonly withdrawalFailedMessage: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.transactionsTab = page.getByRole('button', { name: 'Transactions' });
    this.depositTab = page.getByRole('button', { name: 'Deposit' }).nth(0);
    this.withdrawalTab = page.getByRole('button', { name: 'Withdrawl' });
    this.amountInput = page.locator('input[placeholder="amount"]');
    this.depositButton = page.locator('button[type="submit"]').filter({ hasText: 'Deposit' });
    this.withdrawButton = page.locator('button[type="submit"]').filter({ hasText: 'Withdraw' });
    this.transactionsTable = page.locator('table.table');
    this.balanceDisplay = page.locator('.center strong').nth(1);
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.welcomeMessage = page.locator('.fontBig');
    this.depositSuccessMessage = page.getByText('Deposit Successful');
    this.transactionRows = page.locator('table tbody tr');
    this.withdrawalFailedMessage = page.getByText('Transaction Failed. You can not withdraw amount more than the balance.');
    this.backButton = page.getByRole('button', { name: 'Back' });
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  async getCurrentBalance(): Promise<number> {
    const balanceText = await this.balanceDisplay.textContent();
    return parseInt(balanceText?.trim() || '0');
  }

  async clickDepositTab(): Promise<void> {
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      await this.depositTab.click();
      
      try {
        // Wait for the deposit form to be visible
        await expect(this.depositButton).toBeVisible({ timeout: 10000 });
        return; // Success, exit method
      } catch (error) {
        if (retries < maxRetries) {
          // Retry: click withdrawalTab then re-click depositTab
          await this.withdrawalTab.click();
          await this.page.waitForTimeout(500);
          retries++;
        } else {
          throw error; // Max retries reached, throw the error
        }
      }
    }
  }

  async clickWithdrawalTab(): Promise<void> {
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      await this.withdrawalTab.click();
      
      try {
        // Wait for the withdrawal form to be visible
        await expect(this.withdrawButton).toBeVisible({ timeout: 10000 });
        return; // Success, exit method
      } catch (error) {
        if (retries < maxRetries) {
          // Retry: click depositTab then re-click withdrawalTab
          await this.depositTab.click();
          await this.page.waitForTimeout(500);
          retries++;
        } else {
          throw error; // Max retries reached, throw the error
        }
      }
    }
  }

  async clickTransactionsTab(): Promise<void> {
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      await this.transactionsTab.click();
      
      try {
        // Wait for the transactions table to be visible
        await expect(this.transactionsTable).toBeVisible({ timeout: 10000 });
        
        // Check if table has rows (only tbody rows, not header)
        const rowCount = await this.transactionRows.count();
        if (rowCount === 0) {
          throw new Error('Transaction table is empty - no data rows in tbody');
        }
        
        return; // Success, exit method
      } catch (error) {
        if (retries < maxRetries) {
          // Retry: click back button, then re-click transactionsTab
          await this.backButton.click();
          retries++;
        } else {
          throw error; // Max retries reached, throw the error
        }
      }
    }
  }

  async makeDeposit(amount: number): Promise<void> {
    await this.clickDepositTab();
    
    await this.amountInput.clear();
    await this.amountInput.fill(amount.toString());
    await this.takeScreenshot('03-deposit-amount-entered');
    
    await this.depositButton.click();
    
    // Wait for the deposit to be processed - form should clear
    await expect(this.amountInput).toHaveValue('', { timeout: 5000 });
    
    // Verify deposit successful message appears
    await expect(this.depositSuccessMessage).toBeVisible();    
    await this.takeScreenshot('04-deposit-successful');
  }

  async makeDepositWithInvalidAmount(amount: string): Promise<void> {
    await this.clickDepositTab();
    
    try {
      await this.amountInput.evaluate((el, val) => {
        (el as HTMLInputElement).value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, amount);
    } catch {
      // Silently handle - some inputs prevent invalid values
    }
    
    await this.depositButton.click();
    // For invalid amounts, the form stays visible (doesn't clear)
    await this.depositButton.waitFor({ state: 'visible' });
  }

  async makeWithdrawal(amount: number): Promise<void> {
    await this.clickWithdrawalTab();
    await this.takeScreenshot('06-withdrawal-tab');
    
    // Fill the amount input
    await this.amountInput.fill(amount.toString());
    
    // Click withdraw button and wait for response
    await this.withdrawButton.click();
    
    // Wait for withdrawal to be processed - form should clear or stay (if rejected)
    await this.withdrawButton.waitFor({ state: 'visible' });
    
    await this.takeScreenshot('07-withdrawal-submitted');
  }

  async verifyTransactionExists(amount: number, type: 'Credit' | 'Debit'): Promise<void> {
    await this.clickTransactionsTab();
    await this.takeScreenshot('05-transactions-tab');
    
    // Wait for transactions table to have data
    const rows = this.transactionRows;
    
    // Poll until we find the transaction (transactions may take time to appear)
    await expect(async () => {
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      let found = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const cells = row.locator('td');
        const cellCount = await cells.count();
        
        if (cellCount >= 3) {
          const dateCell = cells.nth(0);
          const amountCell = cells.nth(1);
          const typeCell = cells.nth(2);
          
          const dateText = await dateCell.textContent();
          const amountText = await amountCell.textContent();
          const typeText = await typeCell.textContent();
          
          // Get today's date in the expected format (e.g., "Apr 1, 2026")
          const today = new Date();
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const expectedDateStr = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
          
          // Extract date portion from the transaction (format: "MMM DD, YYYY" with possible time after)
          const transactionDate = dateText?.trim() || '';
          const dateMatch = transactionDate.match(/^([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/);
          const transactionDateStr = dateMatch ? dateMatch[1] : '';
          
          if (amountText?.trim() === amount.toString() && 
              typeText?.trim() === type &&
              transactionDateStr === expectedDateStr) {
            found = true;
            break;
          }
        }
      }
      
      expect(found, `Transaction with amount ${amount} and type ${type} should exist in transaction history`).toBeTruthy();
    }).toPass({ timeout: 10000 });
  }

  async getTransactionCount(): Promise<number> {
    return await this.transactionRows.count();
  }

  async fillDepositAmount(amount: string): Promise<void> {
    await this.amountInput.fill(amount);
  }

  async clickAmountInput(): Promise<void> {
    await this.amountInput.click();
  }

  async clickDepositButton(): Promise<void> {
    await this.depositButton.click();
  }

  async verifyAmountInputValidationMessage(expectedMessage: string): Promise<void> {
    const validationMessage = await this.amountInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBe(expectedMessage);
  }

  async verifyAmountInputIsVisible(): Promise<void> {
    await expect(this.amountInput).toBeVisible();
  }

  async verifyAmountInputIsEmpty(): Promise<void> {
    await expect(this.amountInput).toHaveValue('');
  }

  async verifyAmountInputType(expectedType: string): Promise<void> {
    const inputType = await this.amountInput.getAttribute('type');
    expect(inputType).toBe(expectedType);
  }

  async verifyWithdrawalFailedMessage(): Promise<void> {
    await expect(this.withdrawalFailedMessage).toBeVisible();
    await this.takeScreenshot('08-withdrawal-failed');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.waitForAngular();
  }
}
