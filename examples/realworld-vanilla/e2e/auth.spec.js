/* eslint-disable no-undef */
import { assert } from '@aurelia/testing';
import * as playwright from 'playwright';

import { UserRegistration } from '../src/api.js';

const reNonNumeric = /[^\d]/g;
function getTimestamp() {
  return new Date().toISOString().replace(reNonNumeric, '').slice(4); // MMDDHHMMSSZZZ
}
function generateUsername() {
  return `au-${getTimestamp()}`;
}
function generateEmail() {
  return `au-${getTimestamp()}@aurelia.io`;
}
const registration = UserRegistration.create({
  username: generateUsername(),
  email: generateEmail(),
  password: getTimestamp(),
});

const path = 'http://localhost:9000';

describe('register', function () {
  let browser;
  let ctx;
  let page;

  before(async function () {
    browser = await playwright.chromium.launch({
      headless: false,
    });
    ctx = await browser.newContext();
  });
  after(async function () {
    await browser.close();
  });

  beforeEach(async function () {
    page = await ctx.newPage();
  });
  afterEach(async function () {
    await page.close();
  });

  async function waitForFramework() {
    await page.evaluate(async function () {
      const p = document.querySelector('app-root').$au['au:resource:custom-element'].platform;
      await p.taskQueue.yield();
      await p.domWriteQueue.yield();
    });
  }

  it('can create a new account', async function () {
    await page.goto(`${path}/register`);

    await page.type(`[name="username"]`, registration.username);
    await page.type(`[name="email"]`, registration.email);
    await page.type(`[name="password"]`, registration.password);

    await waitForFramework();

    await page.click(`[data-e2e="submitBtn"]`);

    await waitForFramework();

    await page.click(`[data-e2e="yourFeedLink"]`);

    await waitForFramework();

    const content = await page.content()
    assert.includes(content, 'No articles are here... yet.');
  });
});
