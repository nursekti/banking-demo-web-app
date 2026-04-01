import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async takeScreenshot(name: string): Promise<void> {
    const screenshotDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
  }

  async waitForAngular(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
