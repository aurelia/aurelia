import {
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  JitHtmlBrowserConfiguration
} from '@aurelia/jit-html-browser';
import {
  BrowserScheduler
} from '@aurelia/runtime-html-browser';
import {
  Reporter,
  LogLevel,
} from '@aurelia/kernel';

Reporter.level = LogLevel.error;

function createBrowserTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    JitHtmlBrowserConfiguration,
    window,
    BrowserScheduler,
    UIEvent,
    Event,
    CustomEvent,
    Node,
    Element,
    HTMLElement,
    HTMLDivElement,
    Text,
    Comment,
    DOMParser,
    CSSStyleSheet,
    ShadowRoot
  );
}

function initializeBrowserTestContext(): void {
  TestContext.createHTMLTestContext = createBrowserTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}

initializeBrowserTestContext();

function importAll (r) {
  r.keys().forEach(r);
}

// Explicitly add to browser test
importAll(require.context('./1-kernel/', true, /\.spec\.js$/));
importAll(require.context('./2-runtime/', true, /\.spec\.js$/));
importAll(require.context('./3-runtime-html/', true, /\.spec\.js$/));
importAll(require.context('./4-jit/', true, /\.spec\.js$/));
importAll(require.context('./5-jit-html/', true, /\.spec\.js$/));

importAll(require.context('./fetch-client/', true, /\.spec\.js$/));
importAll(require.context('./i18n/', true, /\.spec\.js$/));
importAll(require.context('./integration/', true, /\.spec\.js$/));
importAll(require.context('./router/', true, /\.spec\.js$/));
