import { test as base, expect } from '@playwright/test';
import type { Server } from 'http';

const express = require('express');
const PORT = 9001;

interface IRouterTest {
  prepareServer: Server;
}

const test = base.extend<{}, IRouterTest>({
  // "express" fixture starts automatically for every worker - we pass "auto" for that.
  prepareServer: [ async ({  }, use) => {
    // Setup express app.
    const app = express();
    app.use(express.static('dist'));

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

test('Loads basic home route', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const name = await page.innerText('au-viewport', { timeout: 50 });
  expect(name).toBe('Home page');
});

test('Navigates to auth when clicks on auth anchor', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const anchor = await page.$('a[href=auth]');
  expect(anchor).not.toBeNull();
  await anchor.click();
  const name = await page.innerText('au-viewport', { timeout: 50 });
  expect(name).toContain('Auth page');
});
