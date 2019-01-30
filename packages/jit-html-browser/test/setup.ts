import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../../jit-html/test/util';
import { BasicConfiguration } from '../src/index';

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

// const testContext = require.context('../../jit-html/test', true, /\.spec\.ts$/);
// testContext.keys().forEach(testContext);
const testContext = require.context('../../jit-html/test/built-in-resources', true, /\.spec\.ts$/);
testContext.keys().forEach(testContext);
