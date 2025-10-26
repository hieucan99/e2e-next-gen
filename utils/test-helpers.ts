import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';

/**
 * Test fixtures that provide page objects for each test
 */
export const test = base.extend<{
  homePage: HomePage;
  searchPage: SearchPage;
}>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },
});

export { expect };

/**
 * Test helper functions for common assertions and actions
 */
export class TestHelpers {
  /**
   * Assert that a string contains expected text (case-insensitive)
   */
  static assertContainsText(actual: string, expected: string, message?: string): void {
    const actualLower = actual.toLowerCase();
    const expectedLower = expected.toLowerCase();
    
    if (!actualLower.includes(expectedLower)) {
      throw new Error(
        message || `Expected "${actual}" to contain "${expected}"`
      );
    }
  }

  /**
   * Assert that an array contains at least one item matching the condition
   */
  static assertArrayContains<T>(
    array: T[], 
    predicate: (item: T) => boolean, 
    message?: string
  ): void {
    const hasMatch = array.some(predicate);
    
    if (!hasMatch) {
      throw new Error(
        message || `Expected array to contain at least one matching item`
      );
    }
  }

  /**
   * Generate test data for search queries
   */
  static getSearchQueries() {
    return {
      valid: [
        'air force 1',
        'nike shoes',
        'running shoes'
      ],
      invalid: [
        'xyznonexistent123',
        '!!@@##$$'
      ]
    };
  }

  /**
   * Wait for a specified amount of time
   */
  static async wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Retry an action with exponential backoff
   */
  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.wait(delay);
      }
    }
    
    throw lastError!;
  }
}