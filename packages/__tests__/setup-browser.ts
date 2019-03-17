import {
  initializeChaiExtensions,
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  BasicConfiguration as BasicBrowserConfiguration
} from '@aurelia/jit-html-browser';

function createBrowserTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    BasicBrowserConfiguration,
    window,
    UIEvent,
    Event,
    CustomEvent,
    Node,
    Element,
    HTMLElement,
    HTMLDivElement,
    Text,
    Comment,
    DOMParser
  );
}

function initializeBrowserTestContext(): void {
  TestContext.createHTMLTestContext = createBrowserTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}


initializeBrowserTestContext();
initializeChaiExtensions();

const testContext = require.context('.', true, /\.spec/);
testContext.keys().forEach(testContext);
