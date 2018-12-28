import { Aurelia, ILifecycle } from '@aurelia/runtime';
import { TestSuite } from '../../../../scripts/test-suite';
import { HTMLJitConfiguration } from '../../src/index';
import { TestConfiguration } from './prepare';

const app = document.createElement('app') as Node;
const createApp = app.cloneNode.bind(app, false);

export const baseSuite = new TestSuite(null);

baseSuite.addDataSlot('a').addData(null).setFactory(c => {
  const container = HTMLJitConfiguration.createContainer();
  container.register(TestConfiguration);
  c.b = new Aurelia(container);
  c.c = container.get(ILifecycle);
  c.d = createApp();
  return container;
});
