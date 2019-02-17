import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../../jit-html/test/util';
import { BasicConfiguration } from '../src/index';

let count = 0;
afterEach(function () {
  if (++count % 1000 ===  0) {
    console.log(`jit-html-browser - done #${count}`);
  }
  if (this.currentTest.isFailed) {
    console.log(`jit-html-browser - failed: ${this.currentTest.title}`);
  }
});

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

const testContext = require.context('../../jit-html/test', true, /\.spec\.tsx?$/);
testContext.keys().forEach(testContext);
