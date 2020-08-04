/* eslint-disable no-shadow */
import { IRegistration } from '@aurelia/kernel';
import { Aurelia, CustomElement, FrequentMutations, CustomElementType } from '@aurelia/runtime';
import { CallCollection, HTMLTestContext, TestContext } from '@aurelia/testing';
import { App } from './app';
import { appTemplate as template } from './app-template';
import { atoms } from './atoms';
import { callCollection } from './debug';
import { MolecularConfiguration, molecules } from './molecules';

export class TestExecutionContext {
  public constructor(
    public au: Aurelia,
    public host: HTMLElement,
    public ctx: HTMLTestContext,
    public tearDown: () => Promise<void>,
    public callCollection: CallCollection,
  ) { }
}

export const enum ComponentMode {
  class = "class",
  instance = "instance",
}
export type StartupConfiguration = Partial<MolecularConfiguration & { method: 'app' | 'enhance'; componentMode: ComponentMode }>;

export async function startup(config: StartupConfiguration = {}) {
  const ctx = TestContext.createHTMLTestContext();

  const host = ctx.dom.createElement('div');
  const au = new Aurelia(ctx.container);
  au
    .register(
      FrequentMutations as unknown as IRegistration,
      atoms,
      molecules.customize((molecularConfig: MolecularConfiguration) => {
        molecularConfig.useCSSModule = config.useCSSModule;
      }),
    );

  let componentClass: CustomElementType;
  const method = config.method;
  if (method === 'app') {
    componentClass = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
  } else if (method === 'enhance') {
    componentClass = CustomElement.define('app', App);
    host.innerHTML = template;
  }
  let component: unknown;
  switch (config.componentMode) {
    case ComponentMode.class:
      component = componentClass;
      break;
    case ComponentMode.instance:
      component = new componentClass();
      break;
  }

  ctx.doc.body.appendChild(host);
  au[method]({ host, component });
  await au.start().wait();

  async function tearDown() {
    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    callCollection.calls.splice(0);
  }

  return new TestExecutionContext(au, host, ctx, tearDown, callCollection);
}
