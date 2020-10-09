import {
  HTMLTestContext,
  TestContext,
  assert,
  ensureSchedulerEmpty,
} from '@aurelia/testing';
import {
  RuntimeHtmlBrowserConfiguration
} from '@aurelia/runtime-html-browser';

function createBrowserTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    RuntimeHtmlBrowserConfiguration,
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
    CSSStyleSheet,
    ShadowRoot
  );
}

function initializeBrowserTestContext(): void {
  TestContext.createHTMLTestContext = createBrowserTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  const ctx = TestContext.createHTMLTestContext();
  ctx.dom.createElement('div');
  ctx.scheduler.getIdleTaskQueue();

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

initializeBrowserTestContext();

function importAll(r) {
  r.keys().forEach(r);
}

// Explicitly add to browser test
// importAll(require.context('./1-kernel/', true, /\.spec\.js$/));
// importAll(require.context('./2-runtime/', true, /\.spec\.js$/));
// importAll(require.context('./3-runtime-html/', true, /\.spec\.js$/));

// importAll(require.context('./web-components/', true, /\.spec\.js$/));
// importAll(require.context('./fetch-client/', true, /\.spec\.js$/));
importAll(require.context('./i18n/', true, /\.spec\.js$/));
// importAll(require.context('./integration/', true, /\.spec\.js$/));
// importAll(require.context('./router/', true, /\.spec\.js$/));
// importAll(require.context('./validation/', true, /\.spec\.js$/));
// importAll(require.context('./validation-html/', true, /\.spec\.js$/));
// importAll(require.context('./validation-i18n/', true, /\.spec\.js$/));
