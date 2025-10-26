import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Search Page object representing the search results page
 */
export class SearchPage extends BasePage {
  private readonly productCards: Locator;
  private readonly productTitles: Locator;
  private readonly searchResultsCount: Locator;

  constructor(page: Page) {
    super(page, '/search'); // Assuming search results page
    
    // Locators based on test case requirements
    this.productTitles = page.locator('.product-card__title');
    this.productCards = page.locator('[data-testid="product-card"], .product-card');
    this.searchResultsCount = page.locator('[data-testid="search-results-count"], .search-results-count');
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults(): Promise<void> {
    await this.waitForPageLoad();
    await this.waitForElement(this.productTitles.first(), 10000);
  }

  /**
   * Get all product titles from search results
   */
  async getProductTitles(): Promise<string[]> {
    await this.waitForSearchResults();
    const titles = await this.productTitles.allTextContents();
    return titles.filter(title => title.trim().length > 0);
  }

  /**
   * Verify search results contain expected product names
   * @param expectedText - Text that should appear in product names
   */
  async verifyProductNamesContain(expectedText: string): Promise<boolean> {
    const productTitles = await this.getProductTitles();
    
    if (productTitles.length === 0) {
      return false;
    }

    // Check if at least one product title contains the expected text
    const matchingProducts = productTitles.filter(title => 
      title.toLowerCase().includes(expectedText.toLowerCase())
    );
    
    return matchingProducts.length > 0;
  }

  /**
   * Get search results count text (e.g., "air force 1(142)")
   */
  async getSearchResultsCountText(): Promise<string> {
    try {
      // Try to find a results count element first
      await this.searchResultsCount.waitFor({ state: 'visible', timeout: 5000 });
      return await this.searchResultsCount.textContent() || '';
    } catch {
      // If no dedicated count element, get from page title or meta info
      const pageTitle = await this.getTitle();
      return pageTitle;
    }
  }

  /**
   * Verify search results display with count
   * @param searchQuery - The search query to verify
   */
  async verifySearchResultsDisplayed(searchQuery: string): Promise<boolean> {
    await this.waitForSearchResults();
    
    // Check if we have products displayed
    const productCount = await this.productTitles.count();
    if (productCount === 0) {
      return false;
    }

    // Check if search query appears in URL or page content
    const currentUrl = await this.getCurrentUrl();
    const urlContainsQuery = currentUrl.toLowerCase().includes(searchQuery.toLowerCase().replace(/\s+/g, '+'));
    
    // Check if page shows search results
    const hasProducts = productCount > 0;
    
    return urlContainsQuery && hasProducts;
  }

  /**
   * Get the number of products displayed
   */
  async getProductCount(): Promise<number> {
    await this.waitForSearchResults();
    return await this.productTitles.count();
  }

  /**
   * Get detailed product information
   */
  async getProductDetails(): Promise<Array<{title: string, index: number}>> {
    const titles = await this.getProductTitles();
    return titles.map((title, index) => ({
      title,
      index: index + 1
    }));
  }

  /**
   * Verify page is on search results (URL contains search parameters)
   */
  async isOnSearchPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('search') || url.includes('q=') || url.includes('query=');
  }

  /**
   * Wait for specific number of products to load
   * @param minimumCount - Minimum number of products expected
   * @param timeout - Maximum wait time in milliseconds
   */
  async waitForMinimumProducts(minimumCount: number = 1, timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        ({ selector, count }) => {
          const elements = document.querySelectorAll(selector);
          return elements.length >= count;
        },
        { selector: '.product-card__title', count: minimumCount },
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }
}
