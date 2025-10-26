import { test, expect } from '../../utils/test-helpers';
import EnvConfig from '../../config/env.config';
import { BasePage, HomePage } from '@pages/index';

test.describe('S_001: Verify user could access the Home page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // HomePage instance will be created in the test fixture
    homePage = new HomePage(page);
    // Navigate using complete URL since BASE_URL is not configured
    await homePage.navigate();
  });

  test('S_001: Verify user could access the Home page @S_001 @smoke @home-page', async ({
    page
  }) => {

    // Step 1: Navigate to Home page
    await test.step('Navigate to Home page', async () => {
      // Expected Result: Home page is displayed
      expect(await homePage.verifyOnHomePage()).toBe(true);
    });

    // Step 2: Verify home page loads successfully  
    await test.step('Verify home page loads successfully', async () => {
      // Expected Result: Home page loads successfully
      expect(await homePage.isHomePageLoaded()).toBe(true);
    });

    // Step 3: Verify menu bar is displayed with required options
    await test.step('Verify menu bar is displayed with required options', async () => {
      // Expected Result: Menu bar is displayed include options: `New & Featured`, `Men`, `Women`, `Kids`, `Sale`
      expect(await homePage.isMenuBarDisplayed()).toBe(true);
      expect(await homePage.areAllMenuItemsDisplayed()).toBe(true);

      // Verify all required menu items are present
      const menuItems = await homePage.getMenuItemsText();
      expect(menuItems).toContain('New & Featured');
      expect(menuItems).toContain('Men');
      expect(menuItems).toContain('Women');
      expect(menuItems).toContain('Kids');
      expect(menuItems).toContain('Sale');
    });
  });
});