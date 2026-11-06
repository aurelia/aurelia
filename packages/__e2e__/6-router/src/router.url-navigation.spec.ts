import { expect, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

test.describe('router.application-url', () => {
  addCoverage();

  for (const hash of [false, true]) {
    const prefix = hash ? '/url-navigation/shell.html?document=1#/' : '/url-navigation/';

    test.describe(hash ? 'hash document' : 'history deployment', () => {
      test('publishes the same destination for clicks, new tabs and reloads', async ({ page, context, baseURL }) => {
        await page.goto(`${prefix}items/a?filter=first`);
        await expect(page.locator('#item')).toHaveText('a');

        const destination = `${baseURL}${prefix}items/b?filter=two%26three#details%25`;
        await expect(page.locator('#sibling')).toHaveAttribute('href', destination);

        // A modified click makes the browser issue a fresh document request.
        // Merely checking the SPA's in-memory destination would miss a broken href.
        const [newTab] = await Promise.all([
          context.waitForEvent('page'),
          page.locator('#sibling').click({ modifiers: ['ControlOrMeta'] }),
        ]);
        await expect(newTab.locator('#item')).toHaveText('b');
        await expect(newTab.locator('#filter')).toHaveText('two&three');
        await expect(newTab.locator('#fragment')).toHaveText('details%');
        await expect(newTab).toHaveURL(destination);
        await newTab.close();

        await page.locator('#sibling').click();
        await expect(page.locator('#item')).toHaveText('b');
        await expect(page).toHaveURL(destination);
        await page.reload();
        await expect(page.locator('#item')).toHaveText('b');
        await expect(page.locator('#filter')).toHaveText('two&three');
        await expect(page.locator('#fragment')).toHaveText('details%');
        await expect(page).toHaveURL(destination);
      });

      test('restores query-only history entries in both directions', async ({ page, baseURL }) => {
        await page.goto(`${prefix}items/a?filter=first`);
        await expect(page.locator('#filter')).toHaveText('first');

        await page.locator('#next-query').click();
        await expect(page.locator('#filter')).toHaveText('next');
        await expect(page).toHaveURL(`${baseURL}${prefix}items/a?filter=next`);

        await page.goBack();
        await expect(page.locator('#filter')).toHaveText('first');
        await expect(page).toHaveURL(`${baseURL}${prefix}items/a?filter=first`);

        await page.goForward();
        await expect(page.locator('#filter')).toHaveText('next');
        await expect(page).toHaveURL(`${baseURL}${prefix}items/a?filter=next`);
      });

      test('keeps structured parameter values through clicks, new tabs and reloads', async ({ page, context, baseURL }) => {
        await page.goto(`${prefix}items/a`);
        const destination = `${baseURL}${prefix}items/draft%28100%25%29`;
        const link = page.locator('#structured-item');
        await expect(link).toHaveAttribute('href', destination);

        const [newTab] = await Promise.all([
          context.waitForEvent('page'),
          link.click({ modifiers: ['ControlOrMeta'] }),
        ]);
        await expect(newTab.locator('#item')).toHaveText('draft(100%)');
        await expect(newTab).toHaveURL(destination);
        await newTab.close();

        await link.click();
        await expect(page.locator('#item')).toHaveText('draft(100%)');
        await expect(page).toHaveURL(destination);
        await page.reload();
        await expect(page.locator('#item')).toHaveText('draft(100%)');
        await expect(page).toHaveURL(destination);
      });

      test('uses createHref for a native browser link', async ({ page, baseURL }) => {
        await page.goto(`${prefix}items/a`);
        await expect(page.locator('#item')).toHaveText('a');
        await page.locator('#native').click();
        await expect(page.locator('#item')).toHaveText('native');
        await expect(page.locator('#filter')).toHaveText('link');
        await expect(page.locator('#fragment')).toHaveText('section');
        await expect(page).toHaveURL(`${baseURL}${prefix}items/native?filter=link#section`);
      });

      test('navigates to the application root and parent directory', async ({ page, baseURL }) => {
        for (const link of ['#root', '#parent']) {
          await page.goto(`${prefix}items/a`);
          await expect(page.locator('#item')).toHaveText('a');
          await page.locator(link).click();
          await expect(page.locator('#home')).toHaveText('Home');
          await expect(page).toHaveURL(`${baseURL}${prefix}`);
        }
      });
    });
  }

  test('removes a deployment prefix once on startup, Back and reload', async ({ page, baseURL }) => {
    const initial = `${baseURL}/url-navigation/url-navigation/items/a`;
    await page.goto(initial);
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(initial);

    await page.locator('#root').click();
    await expect(page.locator('#home')).toHaveText('Home');
    await page.goBack();
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(initial);
    await page.reload();
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(initial);
  });

  test('routes a native hash assignment without losing the document query', async ({ page, baseURL }) => {
    await page.goto('/url-navigation/shell.html?document=1#/items/a');
    await expect(page.locator('#item')).toHaveText('a');
    await page.evaluate(() => { location.hash = '#/items/b?filter=assigned#details'; });
    await expect(page.locator('#item')).toHaveText('b');
    await expect(page.locator('#filter')).toHaveText('assigned');
    await expect(page.locator('#fragment')).toHaveText('details');
    await expect(page).toHaveURL(`${baseURL}/url-navigation/shell.html?document=1#/items/b?filter=assigned#details`);
  });

  test('starts at home in a preserved hash document without an initial hash', async ({ page, baseURL }) => {
    const documentUrl = `${baseURL}/url-navigation/shell.html?document=1`;
    await page.goto(documentUrl);
    await expect(page.locator('#home')).toHaveText('Home');
    await expect(page).toHaveURL(`${documentUrl}#/`);

    await page.locator('#item-link').click();
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(`${documentUrl}#/items/a`);
    await page.reload();
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(`${documentUrl}#/items/a`);
  });

  test('retains base relocation when hash document preservation is not enabled', async ({ page, baseURL }) => {
    await page.goto('/url-navigation/legacy-shell.html?document=1#/items/a');
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(`${baseURL}/url-navigation/#/items/a`);
    await page.reload();
    await expect(page.locator('#item')).toHaveText('a');
    await expect(page).toHaveURL(`${baseURL}/url-navigation/#/items/a`);
  });
});
