import EnvConfig from '@config/env.config';
import { Page, Locator } from '@playwright/test';

/**
 * Base Page class that provides common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = EnvConfig.BASE_URL;
  }

  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    if (!this.url) {
      throw new Error('URL is not defined for this page');
    }
    await this.page.goto(this.url);
  }

  /**
   * Wait for the page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToHide(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
  }
}