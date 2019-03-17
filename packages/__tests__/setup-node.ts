import {
  initializeChaiExtensions,
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  BasicConfiguration as BasicJSDOMConfiguration
} from '@aurelia/jit-html-jsdom';
import { JSDOM } from 'jsdom';

function createJSDOMTestContext(): HTMLTestContext {
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);

  return HTMLTestContext.create(
    BasicJSDOMConfiguration,
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
    jsdom.window.DOMParser
  );
}

function initializeJSDOMTestContext(): void {
  TestContext.createHTMLTestContext = createJSDOMTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}

initializeJSDOMTestContext();
initializeChaiExtensions();
