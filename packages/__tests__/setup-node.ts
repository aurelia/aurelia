import {
  assert,
  ensureSchedulerEmpty,
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  RuntimeHtmlJsdomConfiguration
} from '@aurelia/runtime-html-jsdom';
import {
  Reporter,
  LogLevel,
} from '@aurelia/kernel';
import { JSDOM } from 'jsdom';

Reporter.level = LogLevel.error;

function createJSDOMTestContext(): HTMLTestContext {
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, { pretendToBeVisual: true });

  return HTMLTestContext.create(
    RuntimeHtmlJsdomConfiguration,
    jsdom.window as unknown as Window,
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
  const ctx = TestContext.createHTMLTestContext();
  ctx.dom.createElement('div');
  ctx.scheduler.getIdleTaskQueue();

  // eslint-disable-next-line
  beforeEach(function() {
    const title = this.currentTest?.fullTitle();
    if (title.length > 1000) {
      console.log(`Super long title! "${title.slice(0, 1000)}...(+${title.length - 1000})"`);
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
}

initializeJSDOMTestContext();
