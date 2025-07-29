import { expect, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';
import * as fs from 'fs';
import * as path from 'path';

test.describe('router.hmr', () => {

  addCoverage();

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  const contentMap = new Map<string, string>();

  let homeMarkupPath: string;

  [
    homeMarkupPath = path.resolve(__dirname, './pages/home.html'),
  ].forEach(file => {
    const originalContent = fs.readFileSync(file, { encoding: 'utf-8' });

    contentMap.set(file, originalContent);
  });

  test.afterEach(() => {
    for (const [filePath, originalContent] of contentMap) {
      fs.writeFileSync(filePath, originalContent, { encoding: 'utf-8' });
    }
  });

  test('changes are reflected in the UI', async ({ page }) => {
    await expect(page.locator('au-viewport')).toHaveText('Home page');

    const newContent = `Startseite`;
    fs.writeFileSync(homeMarkupPath, newContent, { encoding: 'utf-8' });

    await assertNewContent();

    // navigate to another route
    await page.click('a:has-text("Go to one")');
    await expect(page.locator('au-viewport')).toHaveText('One page');

    // navigate back to home
    await page.click('a:has-text("Home")');
    await assertNewContent();

    async function assertNewContent() {
      await expect(page.locator('au-viewport')).toHaveText(newContent);
      await expect(page.locator('au-viewport')).not.toHaveText('Home page');
    }
  });
});
