import { IRegistration } from '@aurelia/kernel';
import { Aurelia, FrequentMutations } from '@aurelia/runtime';
import { HTMLTestContext, TestContext } from '@aurelia/testing';
import { App as component } from './app';
import { atoms } from './atoms';
import { molecules } from './molecules';

export class TestExecutionContext {
  constructor(
    public au: Aurelia,
    public host: HTMLElement,
    public ctx: HTMLTestContext,
    public tearDown: () => Promise<void>
  ) { }
}

export async function startup() {
  const ctx = TestContext.createHTMLTestContext();
  ctx.lifecycle.enableTimeslicing();

  const host = ctx.dom.createElement('div');
  ctx.doc.body.appendChild(host);
  const au = new Aurelia(ctx.container);
  au
    .register(FrequentMutations as unknown as IRegistration)
    .register(atoms)
    .register(molecules)
    ;
  au.app({ host, component });

  await au.start().wait();

  async function tearDown() {
    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }

  return new TestExecutionContext(au, host, ctx, tearDown);
}
