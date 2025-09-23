import { expect, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

test.describe('router.basic', () => {

  addCoverage();

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  for (const useUrlFragmentHash of [true, false]) {
    test(`loads home route (useUrlFragmentHash: ${useUrlFragmentHash})`, async ({ page }) => {
      const assertContent = () => expect(page.locator('au-viewport')).toHaveText('Home page');

      if (useUrlFragmentHash) {
        await page.goto('?useUrlFragmentHash=true');
      }
      await assertContent();

      const url = new URL(page.url());
      if (useUrlFragmentHash) {
        url.searchParams.set('useUrlFragmentHash', 'true');
      }

      await assertContent();
    });
  }

  test('handles clicks on auth anchor', async ({ page }) => {
    await page.click('text=Register');
    await expect(page.locator('au-viewport')).toContainText('Auth page');
  });

  test('loads shallow linking', async ({ page, baseURL }) => {
    await page.click(':text("Show iframe")');
    const frame = await (await page.$('iframe')).contentFrame();
    await Promise.all([
      page.waitForNavigation(),
      frame.click(':text("Goto auth")'),
    ]);
    expect(page.url()).toBe(`${baseURL}/auth`);
    await expect(page.locator('au-viewport')).toContainText('Auth page');
  });

  // the location change event is tested here as that is bit difficult to test in the unit test setup with the mocked history and location, emitting events etc.
  test('history forward and backward works correctly', async function ({ page }) {
    await expect(page.locator('au-viewport')).toHaveText('Home page');

    await page.click('text=Register');
    await expect(page.locator('au-viewport')).toContainText('Auth page');

    // clear log and go back
    await page.click('text=Clear log');
    await page.goBack();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'\'',
      'au:router:navigation-start - 3 - \'\'',
      'au:router:navigation-end - 3 - \'\'',
    ]);

    // clear log and go forward
    await page.click('text=Clear log');
    await page.goForward();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'auth\'',
      'au:router:navigation-start - 4 - \'auth\'',
      'au:router:navigation-end - 4 - \'auth\'',
    ]);

    // clear log and go back - round#2
    await page.click('text=Clear log');
    await page.goBack();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'\'',
      'au:router:navigation-start - 5 - \'\'',
      'au:router:navigation-end - 5 - \'\'',
    ]);

    // clear log and go forward - round#2
    await page.click('text=Clear log');
    await page.goForward();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'auth\'',
      'au:router:navigation-start - 6 - \'auth\'',
      'au:router:navigation-end - 6 - \'auth\'',
    ]);
  });

  // the loop helps make the issue with duplication more visible in the router e2e
  // so putting it here to make it easier to reproduce the issue
  for (let i = 0; i < 5; i++) {
    test(`ensures no duplication with load "${i}"`, async ({ page, baseURL }) => {
      // Home
      const proms: Promise<void>[] = [];
      await expect(page.locator('#root-vp')).toHaveText('Home page');
      // Flood navigation
      for (let i = 0; i < 50; i++) {
        switch (i % 3) {
          case 0:
            proms.push(page.click('#page-one-link'));
            break;
          case 1:
            proms.push(page.click('#page-two-link'));
            break;
          case 2:
            proms.push(page.click('#auth-link'));
            break;
        }
      }

      await Promise.all(proms);

      // Go to "two"
      await Promise.all([
        page.waitForURL(`${baseURL}/two`),
        page.click('#page-two-link'),
      ]);
      expect(page.url()).toBe(`${baseURL}/two`);
      expect(await page.locator('#root-vp').textContent()).toBe('Two page');
    });
  }

  test('ensures no duplication with back/forward', async ({ page, baseURL }) => {
    // Home
    await expect(page.locator('#root-vp')).toHaveText('Home page');

    // Go to "one"
    await Promise.all([
      page.waitForURL(`${baseURL}/one`),
      page.click('#page-one-link'),
    ]);
    expect(page.url()).toBe(`${baseURL}/one`);
    await expect(page.locator('#root-vp')).toContainText('One page');

    // Go to "two"
    await Promise.all([
      page.waitForURL(`${baseURL}/two`),
      page.click('#page-two-link'),
    ]);

    // Flood back/forward
    const proms: Promise<unknown>[] = [];
    for (let i = 0; i < 98; i++) {
      if (i % 2 === 0) {
        proms.push(page.goBack(), page.goBack());
      } else {
        proms.push(page.goForward(), page.goForward());
      }
    }
    await Promise.all(proms);

    // await _waitProcessingNav(page);

    // Go to "two"
    await Promise.all([
      page.waitForURL(`${baseURL}/two`),
      page.click('#page-two-link'),
    ]);

    expect(page.url()).toBe(`${baseURL}/two`);
    expect(await page.locator('#root-vp').textContent()).toBe('Two page');
  });

  for (const useUrlFragmentHash of [true, false]) {
    test(`href generation works correctly (useUrlFragmentHash: ${useUrlFragmentHash})`, async ({ page, baseURL }) => {

      if (useUrlFragmentHash) {
        await page.goto(`${baseURL}/?useUrlFragmentHash=true`);
      }

      const href1 = `${useUrlFragmentHash ? '/#/' : ''}sub/1`;
      const href2 = `${useUrlFragmentHash ? '/#' : baseURL}/sub/2`;
      const href3 = `${useUrlFragmentHash ? '/#' : baseURL}/sub/3`;

      await test.step('navigates to sub route', async () => {
        await page.click('a:has-text("Sub")');
        await expect(page.locator('p#sub-message')).toHaveText('This is sub!');
      });

      await test.step('verifies href links', async () => {
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/1")')).toHaveAttribute('href', href1);
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/2")')).toHaveAttribute('href', href2);
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/3")')).toHaveAttribute('href', href3);
      });

      await test.step('navigates using href links', async () => {
        // Sub/1
        await Promise.all([
          page.waitForURL(`${baseURL}${useUrlFragmentHash ? '/#/' : '/'}sub/1`),
          page.click(`ul#sub-links >> a[href="${href1}"]`),
        ]);
        await expect(page.locator('au-viewport#sub-vp')).toHaveText('1');

        // Sub/2
        await Promise.all([
          page.waitForURL(`${baseURL}${useUrlFragmentHash ? '/#/' : '/'}sub/2`),
          page.click(`ul#sub-links >> a[href="${href2}"]`),
        ]);
        await expect(page.locator('au-viewport#sub-vp')).toHaveText('2');

        // Sub/3
        await Promise.all([
          page.waitForURL(`${baseURL}${useUrlFragmentHash ? '/#/' : '/'}sub/3`),
          page.click(`ul#sub-links >> a[href="${href3}"]`),
        ]);
        await expect(page.locator('au-viewport#sub-vp')).toHaveText('3');
      });

      await test.step('reloads and verifies the hrefs again', async () => {
        const url = new URL(page.url());
        if (useUrlFragmentHash) {
          url.searchParams.set('useUrlFragmentHash', 'true');
        }
        await page.goto(url.toString()); // reloads the page
        await expect(page.locator('p#sub-message')).toHaveText('This is sub!');
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/1")')).toHaveAttribute('href', href1);
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/2")')).toHaveAttribute('href', href2);
        await expect(page.locator('ul#sub-links >> a:has-text("Sub/3")')).toHaveAttribute('href', href3);
      });
    });
  }
});
