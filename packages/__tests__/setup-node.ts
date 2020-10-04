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
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);

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

// eslint-disable-next-line
beforeEach(function() {
  try {
    assert.isSchedulerEmpty();
  } catch (ex) {
    ensureSchedulerEmpty();
    throw ex;
  }
});

// eslint-disable-next-line
afterEach(function() {
  try {
    assert.isSchedulerEmpty();
  } catch (ex) {
    ensureSchedulerEmpty();
    throw ex;
  }
});

initializeJSDOMTestContext();
