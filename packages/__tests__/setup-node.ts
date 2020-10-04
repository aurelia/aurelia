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
import { after } from 'mocha';

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

let testCount = 0;
/**@type {[string, number][]} */
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
  const timeTakenForTest = Date.now() - testStartTime;
  if (timeTakenForTest > longestTestTime) {
    if (this.test != null) {
      longestTestTime = timeTakenForTest;
      longestTests = [[this.test.fullTitle(), timeTakenForTest]];
    }
  } else if (timeTakenForTest === longestTestTime) {
    if (this.test != null) {
      longestTests.push([this.test.fullTitle(), timeTakenForTest]);
    }
  }
  try {
    assert.isSchedulerEmpty();
  } catch (ex) {
    ensureSchedulerEmpty();
    throw ex;
  }
});

after(function() {
  console.log(`Longest tests are: ${JSON.stringify(longestTests)}`);
});

initializeJSDOMTestContext();
