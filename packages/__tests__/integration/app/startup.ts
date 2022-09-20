import { LifecycleFlags, Aurelia, CustomElement, CustomElementType } from '@aurelia/runtime-html';
import { CallCollection, TestContext } from '@aurelia/testing';
import { App } from './app.js';
import { appTemplate as template } from './app-template.js';
import { atoms } from './atoms/index.js';
import { callCollection } from './debug.js';
import { MolecularConfiguration, molecules } from './molecules/index.js';

export class TestExecutionContext {
  public constructor(
    public au: Aurelia,
    public host: HTMLElement,
    public ctx: TestContext,
    public tearDown: () => Promise<void>,
    public callCollection: CallCollection,
  ) { }
}

export const enum ComponentMode {
  class = "class",
  instance = "instance",
}
export type StartupConfiguration = Partial<MolecularConfiguration & { method: 'app' | 'enhance'; componentMode: ComponentMode }>;

export async function startup(config: StartupConfiguration = {}): Promise<TestExecutionContext> {
  const ctx = TestContext.create();

  const host = ctx.doc.createElement('div');
  const au = new Aurelia(ctx.container);
  au
    .register(
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

  let $deactivate: () => any;
  ctx.doc.body.appendChild(host);
  if (method === 'app') {
    au.app({ host, component });
    await au.start();
  } else {
    const controller = (await au.enhance({ host, component }));
    $deactivate = () => controller.deactivate(controller, null, LifecycleFlags.none);
  }

  async function tearDown() {
    await au.stop();
    await $deactivate?.();
    ctx.doc.body.removeChild(host);
    callCollection.calls.splice(0);
  }

  return new TestExecutionContext(au, host, ctx, tearDown, callCollection);
}
