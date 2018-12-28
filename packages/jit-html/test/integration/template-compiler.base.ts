import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  IDOM,
  ILifecycle
} from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { TestSuite } from '../../../../scripts/test-suite';
import { HTMLJitConfiguration } from '../../src/index';
import { TestConfiguration } from './resources';

export const baseSuite = new TestSuite(null);

baseSuite.addDataSlot('a').addData(null).setFactory(c => {
  const container = HTMLJitConfiguration.createContainer();
  const dom = new HTMLDOM(document);
  Registration.instance(IDOM, dom).register(container, IDOM);
  container.register(TestConfiguration);
  c.b = new Aurelia(container);
  c.c = container.get(ILifecycle);
  c.d = document.createElement('app');
  return container;
});
