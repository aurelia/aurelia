import { expect, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

/**
 * These tests asserts the fix for the issue 2025: https://github.com/aurelia/aurelia/issues/2025
 */

test.describe('validation GH issue 2025', () => {

  addCoverage();

  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test('validation works after reattaching components', async ({ page }) => {
    const radios = await page.locator('input').all();
    expect(radios).toHaveLength(2);

    const [yes, no] = radios;
    expect(await yes.isChecked()).toBe(false);
    expect(await no.isChecked()).toBe(true);

    // switch to edit mode
    await yes.click();
    const container = page.locator('validation-container');
    await expect(container).toHaveText('');

    const submitBtn = page.locator('button');
    await expect(submitBtn).toHaveText('Submit');

    // submit to trigger validation
    await submitBtn.click();
    await expect(container).toHaveText('Some Property must be between or equal to 3 and 20.');

    // switch back to view mode
    await no.click();
    await expect(container).toBeHidden();

    // switch back to edit mode
    await yes.click();
    await expect(container).toHaveText('');

    // submit to trigger validation
    await submitBtn.click();
    await expect(container).toHaveText('Some Property must be between or equal to 3 and 20.');
  });
});
