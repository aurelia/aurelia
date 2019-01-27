import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { HTMLTestContext, TestContext } from '../../runtime-html/test/util';

chai.use(sinonChai);

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

Error.stackTraceLimit = Infinity;

const testContext = require.context('.', true, /\.spec/);
testContext.keys().forEach(testContext);
