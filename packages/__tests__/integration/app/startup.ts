/* eslint-disable no-shadow */
import { IRegistration } from '@aurelia/kernel';
import { Aurelia, FrequentMutations } from '@aurelia/runtime';
import { HTMLTestContext, TestContext, CallCollection } from '@aurelia/testing';
import { App as component } from './app';
import { atoms } from './atoms';
import { molecules } from './molecules';
import { callCollection } from './debug';

export class TestExecutionContext {
  public constructor(
    public au: Aurelia,
    public host: HTMLElement,
    public ctx: HTMLTestContext,
    public tearDown: () => Promise<void>,
    public callCollection: CallCollection
  ) { }
}

export async function startup() {
  const ctx = TestContext.createHTMLTestContext();

  const host = ctx.dom.createElement('div');
  ctx.doc.body.appendChild(host);
  const au = new Aurelia(ctx.container);
  au
    .register(FrequentMutations as unknown as IRegistration)
    .register(atoms)
    .register(molecules);
  au.app({ host, component });

  await au.start().wait();

  async function tearDown() {
    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    callCollection.calls.splice(0);
  }

  return new TestExecutionContext(au, host, ctx, tearDown, callCollection);
}
