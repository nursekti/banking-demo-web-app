import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly customerLoginButton: Locator;
  private readonly customerDropdown: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.customerLoginButton = page.getByRole('button', { name: 'Customer Login' });
    this.customerDropdown = page.locator('#userSelect');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async navigate(): Promise<void> {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        await this.page.goto('https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login', {
          waitUntil: 'networkidle',
          timeout: 60000
        });
        
        // Wait for the customer login button to be visible
        await this.customerLoginButton.waitFor({ state: 'visible', timeout: 30000 });
        return; // Success, exit method
      } catch (error) {
        if (retries < maxRetries) {
          // Retry: reload the page
          await this.page.reload({ waitUntil: 'networkidle', timeout: 60000 });
          await this.page.waitForTimeout(1000);
          retries++;
        } else {
          throw error; // Max retries reached, throw the error
        }
      }
    }
  }

  async clickCustomerLogin(): Promise<void> {
    await this.customerLoginButton.click();
    await this.waitForAngular();
  }

  async selectCustomer(customerName: string): Promise<void> {
    await this.customerDropdown.selectOption({ label: customerName });
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    await this.waitForAngular();
  }

  async loginAsCustomer(customerName: string): Promise<void> {
    await this.navigate();
    await this.takeScreenshot('01-login-page-after-navigation');
    
    await this.clickCustomerLogin();
    
    await this.selectCustomer(customerName);
    
    await this.clickLogin();    
    await this.takeScreenshot('02-successfully-logged-in');
  }
}
