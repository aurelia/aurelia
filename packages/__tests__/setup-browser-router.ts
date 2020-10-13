import {
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  Aurelia,
  RuntimeHtmlConfiguration,
} from '@aurelia/runtime-html';

function createBrowserTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    RuntimeHtmlConfiguration,
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
    DOMParser,
  );
}

function initializeBrowserTestContext(): void {
  TestContext.createHTMLTestContext = createBrowserTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  new Aurelia().app({ host: document.body, component: class {} });
}

initializeBrowserTestContext();

const testContext = require.context('.', true, /router\/[^_][^_].*?\.spec\.js$/i);
testContext.keys().forEach(testContext);
