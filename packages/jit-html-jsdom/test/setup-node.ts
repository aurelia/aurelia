import * as chai from 'chai';
import { JSDOM } from 'jsdom';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../../jit-html/test/util';
import { BasicConfiguration } from '../src/index';

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

chai.should();
chai.use(sinonChai);
