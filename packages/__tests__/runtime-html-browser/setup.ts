import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { addChaiAsserts_$state, HTMLTestContext, TestContext } from '../runtime-html/util';

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

const testContext = require.context('../runtime-html', true, /spec\.ts$/);
testContext.keys().forEach(testContext);
