/* eslint-disable no-shadow */
import { IRegistration } from '@aurelia/kernel';
import { Aurelia, FrequentMutations } from '@aurelia/runtime';
import { CallCollection, HTMLTestContext, TestContext } from '@aurelia/testing';
import { App as component } from './app';
import { atoms } from './atoms';
import { callCollection } from './debug';
import { MolecularConfiguration, molecules } from './molecules';

export class TestExecutionContext {
  public constructor(
    public au: Aurelia,
    public host: HTMLElement,
    public ctx: HTMLTestContext,
    public tearDown: () => Promise<void>,
    public callCollection: CallCollection
  ) { }
}

export type StartupConfiguration = Partial<MolecularConfiguration & {}>;

export async function startup(config: StartupConfiguration = {}) {
  const ctx = TestContext.createHTMLTestContext();

  const host = ctx.dom.createElement('div');
  ctx.doc.body.appendChild(host);
  const au = new Aurelia(ctx.container);
  au
    .register(FrequentMutations as unknown as IRegistration)
    .register(atoms)
    .register(
      molecules.customize((molecularConfig: MolecularConfiguration) => {
        molecularConfig.useCSSModule = config.useCSSModule;
      })
    );

  au.app({ host, component });

  await au.start().wait();

  async function tearDown() {
    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    callCollection.calls.splice(0);
  }

  return new TestExecutionContext(au, host, ctx, tearDown, callCollection);
}
