import { test as base, expect } from '@playwright/test';
import type { Server } from 'http';

import express from 'express';
import path from 'path';

const PORT = 9001;
const appUrl = `http://127.0.0.1:${PORT}`;

interface IRouterTest {
  prepareServer: Server;
}

const test = base.extend<{}, IRouterTest>({
  // "express" fixture starts automatically for every worker - we pass "auto" for that.
  prepareServer: [ async (_, use) => {
    // Setup express app.
    const app = express();
    app.use(express.static('dist'));
    // TODO
    app.use('/api/*', (req, res, next) => {
      next();
    });
    app.use('*', (req, res) => {
      const fileDirectory = path.resolve(__dirname, '.', '../dist/');

      res.sendFile('index.html', {root: fileDirectory}, (err) => {
        res.end();
        if (err != null) throw(err);
      });
    });

    // Start the server.
    let server: Server;
    console.log('Starting server...');
    await new Promise(r => {
      server = app.listen(PORT, r as any);
    });
    console.log('Server ready');

    // Use the server in the tests.
    await use(server);

    // Cleanup.
    console.log('Stopping server...');
    await new Promise(r => server.close(r));
    console.log('Server stopped');
  }, { scope: 'worker', auto: true } ],
});

test.beforeEach(async ({ page }) => {
  // await page.goto(appUrl);
  console.log('Page ready', page.url());
});

test('Loads basic home route', async ({ page }) => {
  await page.goto(appUrl);
  const name = await page.innerText('au-viewport', { timeout: 50 });
  await page.pause();
  expect(name).toBe('Home page');
});

test('Navigates to auth when clicks on auth anchor', async ({ page }) => {
  await page.goto(appUrl);
  // timeout 50/100 is not enough on Binh's machine
  // todo(jurgen): why does it take so long?
  await page.click('a:text("Register")', { timeout: 150 });
  const name = await page.innerText('au-viewport', { timeout: 50 });
  expect(name).toContain('Auth page');
});

test('loads the right component when navigating from inside an iframe', async ({ page }) => {
  await page.goto(appUrl);
  await page.click(':text("Show iframe")');
  const frame = await (await page.$('iframe')).contentFrame();
  await Promise.all([
    page.waitForNavigation(),
    frame.click(':text("Goto auth")'),
  ]);
  const viewportText = await page.textContent('au-viewport', { timeout: 50 });
  expect(viewportText).toContain('Auth page');
  expect(page.url()).toBe(`${appUrl}/#/auth`);
});
