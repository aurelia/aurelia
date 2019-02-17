import * as chai from 'chai';
import { JSDOM } from 'jsdom';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../../jit-html/test/util';
import { BasicConfiguration } from '../src/index';

let count = 0;
afterEach(function () {
  if (++count % 1000 ===  0) {
    console.log(`jit-html-jsdom - done #${count}`);
  }
  if (this.currentTest.isFailed) {
    console.log(`jit-html-jsdom - failed: ${this.currentTest.title}`);
  }
});

const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);

export function createHTMLTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    BasicConfiguration,
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

TestContext.createHTMLTestContext = createHTMLTestContext;

chai.use(sinonChai);
