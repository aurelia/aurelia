import { expect, test } from '@playwright/test';

test('production output retains standard decorator semantics', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#message')).toHaveText('Vite 8 decorators work');
  await expect(page.locator('#decorator-revision')).toHaveText('decorator-v1:1');
  await expect(page.locator('#decorated-value')).toHaveText('Vite 8 decorators work');
  await expect(page.locator('#worker-result')).toHaveText('initializer:true;own:false;value:2');
  await expect(page.locator('#jsx-result')).toHaveText('TSX factory import retained');

  await page.locator('#message-input').fill('Updated production bindable');

  await expect(page.locator('#decorated-value')).toHaveText('Updated production bindable');
});
