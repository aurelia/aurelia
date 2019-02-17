import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { addChaiAsserts_$state, HTMLTestContext, TestContext } from '../../runtime-html/test/util';

let count = 0;
afterEach(function () {
  if (++count % 1000 ===  0) {
    console.log(`runtime-html-browser - done #${count}`);
  }
  if (this.currentTest.isFailed) {
    console.log(`runtime-html-browser - failed: ${this.currentTest.title}`);
  }
});

export function createHTMLTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    window,
    UIEvent,
    Event,
    CustomEvent,
    Node,
    Element,
    HTMLElement,
    HTMLDivElement,
    Text,
    Comment
  );
}

TestContext.createHTMLTestContext = createHTMLTestContext;
TestContext.Node = Node;
TestContext.Element = Element;
TestContext.HTMLElement = HTMLElement;
TestContext.HTMLDivElement = HTMLDivElement;

chai.use(sinonChai);
chai.use(addChaiAsserts_$state);

const testContext = require.context('../../runtime-html/test', true, /spec\.ts$/);
testContext.keys().forEach(testContext);
