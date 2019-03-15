import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../jit-html/util';
import { BasicConfiguration } from '@aurelia/jit-html-browser';

export function createHTMLTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    BasicConfiguration,
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

TestContext.createHTMLTestContext = createHTMLTestContext;

chai.use(sinonChai);

const testContext = require.context('../jit-html', true, /\.spec\.tsx?$/);
testContext.keys().forEach(testContext);
