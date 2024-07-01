import { test, expect } from '@playwright/test';

test.describe.serial('examples/html-only/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  test('dup resource registration https://github.com/aurelia/aurelia/issues/1951', async ({ page }) => {
    await page.click(':text("click me")');

    await expect(page.locator('ul')).toContainText(`I'm a two!`);
  });

  test.describe.serial('subclass resource - https://github.com/aurelia/aurelia/issues/1991', function () {
    test('custom element', async ({ page }) => {
      await expect(page.locator('#gh1991 ce-super')).toHaveText('sup-p1 sup-p2 sup-p3');
      await expect(page.locator('#gh1991 ce-sub')).toHaveText('sub-p4 sub-p1 sub-p2 sub-p3');
    });
    test('custom attribute', async ({ page }) => {
      await expect(page.locator('#gh1991 ce-super')).toHaveCSS('color', 'rgb(255, 0, 0)');
      const ceSubEl = page.locator('#gh1991 ce-sub');
      await expect(ceSubEl).toHaveCSS('color', 'rgb(0, 0, 255)');
      await expect(ceSubEl).toHaveCSS('background-color', 'rgb(153, 153, 153)');
    });
  });
});

