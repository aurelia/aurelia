import {
  HTMLTestContext,
  TestContext,
  assert,
  ensureSchedulerEmpty,
} from '@aurelia/testing';
import {
  JitHtmlJsdomConfiguration,
} from '@aurelia/jit-html-jsdom';
import {
  Reporter,
  LogLevel,
} from '@aurelia/kernel';
import { JSDOM } from 'jsdom';

Reporter.level = LogLevel.error;

function createJSDOMTestContext(): HTMLTestContext {
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, { pretendToBeVisual: true });

  return HTMLTestContext.create(
    JitHtmlJsdomConfiguration,
    jsdom.window,
    jsdom.window.UIEvent,
    jsdom.window.Event,
    jsdom.window.CustomEvent,
    jsdom.window.Node,
    jsdom.window.Element,
    jsdom.window.HTMLElement,
    jsdom.window.HTMLDivElement,
    jsdom.window.Text,
    jsdom.window.Comment,
    jsdom.window.DOMParser,
    jsdom.window.CSSStyleSheet,
    (jsdom.window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot
  );
}

function initializeJSDOMTestContext(): void {
  TestContext.createHTMLTestContext = createJSDOMTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}

initializeJSDOMTestContext();

let testCount = 0;
let longestTests = [];
let longestTestTime = 0;
let testStartTime = 0;
// eslint-disable-next-line
beforeEach(function () {
  testStartTime = Date.now();
  testCount++;
  if (testCount > 2000 && testCount % 100 === 99) {
    console.log(`>>> Running test number ${testCount}, be patient with mocha + node + esm...`);
  }
});

// eslint-disable-next-line
afterEach(function () {
  if (this.test != null) {
    const timeTakenForTest = Date.now() - testStartTime;
    if (timeTakenForTest === longestTestTime || longestTestTime === 0) {
      if (longestTests.length > 40000) {
        longestTests.shift();
      }
      longestTests.push([this.test.fullTitle(), timeTakenForTest]);
    } else if (timeTakenForTest > longestTestTime && !is10PctDiff(longestTests, timeTakenForTest)) {
      longestTestTime = timeTakenForTest;
      longestTests = [[this.test.fullTitle(), timeTakenForTest]];
    }
  }
  try {
    assert.isSchedulerEmpty();
  } catch (ex) {
    ensureSchedulerEmpty();
    throw ex;
  }
});

// eslint-disable-next-line
after(function () {
  if (longestTests.length > 40000) {
    console.log(`A lot of similarly long running tests: ${longestTests[0][1]}ms`);
  } else {
    console.log(`Longest tests are: ${JSON.stringify(longestTests, void 0, 2)}`);
  }
});

/**
 * @param {number} base
 * @param {number} num
 */
function is10PctDiff(base, num) {
  return base * 0.9 < num && base * 1.1 > num;
}
