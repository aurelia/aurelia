import { test, expect } from '@playwright/test';

test('Loads basic home route', async ({ page }) => {
  await page.goto('http://127.0.0.1:9000/');
  const name = await page.innerText('au-viewport', { timeout: 1000 });
  expect(name).toBe('Home page');
});

test('Navigates to auth when clicks on auth anchor', async ({ page }) => {
  await page.goto('http://127.0.0.1:9000/');
  const anchor = await page.$('a[href=auth]');
  expect(anchor).not.toBeNull();
  // await page.pause();
  await anchor.click();
  // await page.pause();
  const name = await page.innerText('au-viewport', { timeout: 200 });
  expect(name).toContain('Auth page');
});
