import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

/**
 * Environment configuration for the e2e testing framework
 * Loads and validates environment variables with fallback defaults
 */
export class EnvConfig {
  // Application Configuration
  static readonly BASE_URL = process.env.BASE_URL || '';

  // API Configuration
  static readonly API_BASE_URL = process.env.API_BASE_URL || '';

  // CI/CD Configuration
  static readonly CI = process.env.CI === 'true' || false;

  // Browser Configuration
  static readonly HEADLESS = process.env.HEADLESS !== 'false';
  static readonly BROWSER_TIMEOUT = parseInt(process.env.BROWSER_TIMEOUT || '30000');

  /**
   * Validate that required environment variables are set
   */
  static validate(): void {
    if (process.env.NODE_ENV !== 'test') {
      console.log('🔧 Environment Configuration:');
      console.log(`  BASE_URL: ${this.BASE_URL}`);
      console.log(`  API_BASE_URL: ${this.API_BASE_URL || 'Not set'}`);
      console.log(`  CI Mode: ${this.CI ? 'Yes' : 'No'}`);
      console.log(`  Headless: ${this.HEADLESS ? 'Yes' : 'No'}`);
      console.log(`  Timeout: ${this.BROWSER_TIMEOUT}ms`);
    }
    
    if (!this.BASE_URL) {
      console.warn('⚠️  Warning: BASE_URL not set. Set BASE_URL env variable for actual e-commerce testing.');
      return;
    }
  }
}

// Validate environment on import
EnvConfig.validate();

export default EnvConfig;