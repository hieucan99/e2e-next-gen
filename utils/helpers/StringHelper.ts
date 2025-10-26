/**
 * String utility functions for test automation
 */
export class StringHelper {
  /**
   * Generate a random string of specified length
   */
  static generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate a random email address
   */
  static generateRandomEmail(domain: string = 'test.com'): string {
    const username = this.generateRandomString(8).toLowerCase();
    return `${username}@${domain}`;
  }

  /**
   * Generate a random phone number
   */
  static generateRandomPhoneNumber(countryCode: string = '+1'): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const firstPart = Math.floor(Math.random() * 900) + 100;
    const secondPart = Math.floor(Math.random() * 9000) + 1000;
    return `${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }

  /**
   * Format string to title case
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Remove all whitespace from string
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, '');
  }

  /**
   * Normalize string for comparison (lowercase, trim, remove extra spaces)
   */
  static normalizeForComparison(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Escape special regex characters in string
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Truncate string to specified length with ellipsis
   */
  static truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }
}