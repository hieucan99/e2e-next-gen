import { test, expect } from '../../utils/test-helpers';
import EnvConfig from '../../config/env.config';
import { BasePage, HomePage } from '@pages/index';

test.describe('F_01: Verify user could access the Home page', () => {
  test('F_01: Demo Fail case', async ({
    page
  }) => {
    expect(false).toBe(true);
  });

  test('F_02: Demo Pass case', async ({
    page
  }) => {
    expect(true).toBe(true);
  });
});