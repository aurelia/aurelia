import { Aurelia, ILifecycle } from '@aurelia/runtime';
import { TestSuite } from '../../../../scripts/test-suite';
import { TestContext } from '../util';
import { TestConfiguration } from './resources';

export const baseSuite = new TestSuite(null);

baseSuite.addDataSlot('a').addData(null).setFactory(c => {
  const ctx = TestContext.createHTMLTestContext();
  const container = ctx.container;
  container.register(TestConfiguration);
  c.b = new Aurelia(container);
  c.c = container.get(ILifecycle);
  c.d = ctx.createElement('app');
  return container;
});
