import { TestSuite } from "../../../../scripts/test-suite";
import { IObserverLocator, DOM, Aurelia, ILifecycle, IDOM } from '../../../runtime/src/index';
import { DI, Registration } from "../../../kernel/src/index";
import { BasicConfiguration } from "../../src";
import { TestConfiguration } from "./prepare";

const app = document.createElement('app') as Node;
const createApp = app.cloneNode.bind(app, false);

const dom = <any>new DOM(<any>document);
const domRegistration = Registration.instance(IDOM, dom);

export const baseSuite = new TestSuite(null);

baseSuite.addDataSlot('a').addData(null).setFactory(c => {
  const container = DI.createContainer();
  container.register(domRegistration);
  container.get(IObserverLocator);
  container.register(BasicConfiguration);
  container.register(TestConfiguration);
  c.b = new Aurelia(container);
  c.c = container.get(ILifecycle);
  c.d = createApp();
  return container;
});
