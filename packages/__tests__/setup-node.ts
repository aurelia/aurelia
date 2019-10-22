import {
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  JitHtmlJsdomConfiguration
} from '@aurelia/jit-html-jsdom';
import {
  JSDOMScheduler
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
    JitHtmlJsdomConfiguration,
    jsdom.window,
    JSDOMScheduler,
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
