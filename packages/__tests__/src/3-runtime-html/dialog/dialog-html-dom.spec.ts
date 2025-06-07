import {
  DialogController,
  DialogConfigurationStandard,
  DialogDomStandard,
  IDialogService,
  DialogRenderOptionsStandard,
} from '@aurelia/dialog';
import { IDisposable, resolve } from '@aurelia/kernel';
import {
  INode
} from '@aurelia/runtime-html';
import {
  createFixture,
  assert,
  onFixtureCreated,
  IFixture,
} from '@aurelia/testing';
import { isNode } from '../../util.js';

describe('3-runtime-html/dialog/dialog-html-dom.spec.ts', function () {
  // only deal with <dialog> in the browser
  if (isNode()) return;

  let sub: IDisposable;
  let fixtures: IFixture<object>[];

  this.beforeEach(function () {
    fixtures = [];
    sub = onFixtureCreated((fixture) => {
      fixtures.push(fixture);
    });
  });

  this.afterEach(async function () {
    sub.dispose();
    await Promise
      .all(fixtures.map(async f => {
        const unclosedControllers = await ((f.component as any).dialogService as IDialogService).closeAll();
        assert.strictEqual(unclosedControllers.length, 0, 'There should be no unclosed dialog controllers');
      }));
  });

  it('renders <dialog> element', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open({
      host: component.host,
      template: 'hey',
    });

    assertHtml('<dialog open=""><div>hey</div></dialog>');
  });

  it('renders <dialog> element with overlay', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        modal: true,
      }
    });

    assertHtml('<dialog open=""><div>hey</div></dialog>');
  });

  it('sets overlay style', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    const result = await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        modal: true,
      }
    });

    assertHtml('<dialog open=""><div>hey</div></dialog>');

    ((result.dialog as DialogController)['dom'] as DialogDomStandard).setOverlayStyle('background: red;');
    assertHtml('<dialog open=""><style>:modal::backdrop{background: red;}</style><div>hey</div></dialog>');

    ((result.dialog as DialogController)['dom'] as DialogDomStandard).setOverlayStyle({ backgroundColor: 'blue' });
    assertHtml('<dialog open=""><style>:modal::backdrop{background-color: blue;}</style><div>hey</div></dialog>');
  });

  it('renders <dialog> element with closedby option', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open<DialogRenderOptionsStandard>({
      host: component.host,
      template: 'hey',
      options: {
        closedby: 'none',
      }
    });

    assertHtml('<dialog closedby="none" open=""><div>hey</div></dialog>');
  });

  it('calls show/hide hooks on global options', async function () {
    let i = 0;
    const { component } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard.customize((_, options) => {
        options.show = () => { i = 1; };
        options.hide = () => { i = 2; };
      })]
    );
    const result = await component.dialogService.open({
      host: component.host,
      template: 'hey',
    });

    assert.strictEqual(i, 1);
    await result.dialog.cancel();
    assert.strictEqual(i, 2);
  });

  it('calls show/hide hooks on open call', async function () {
    const { component } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      }
      , [DialogConfigurationStandard]
    );
    let i = 0;
    const result = await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        show: () => i = 1,
        hide: () => i = 2,
      }
    });

    assert.strictEqual(i, 1);
    await result.dialog.cancel();
    assert.strictEqual(i, 2);
  });

  it('overrides global options with options on open call', async function () {
    const { component } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard.customize((_, options) => {
        options.show = () => { throw new Error('should not be called'); };
        options.hide = () => { throw new Error('should not be called'); };
      })]
    );
    let i = 0;
    const result = await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        show: () => i = 1,
        hide: () => i = 2,
      }
    });

    assert.strictEqual(i, 1);
    await result.dialog.cancel();
    assert.strictEqual(i, 2);
  });

  it('calls hide on modal dialog cancel event', async function () {
    const { component, trigger } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard.customize((_, options) => {
        options.show = () => { throw new Error('should not be called'); };
        options.hide = () => { throw new Error('should not be called'); };
      })]
    );
    let i = 0;
    const result = await component.dialogService.open<DialogRenderOptionsStandard>({
      host: component.host,
      template: '<button>cancel dialog</button>',
      options: {
        modal: true,
        show: () => { i = 1; },
        hide: () => { i = 2; },
      }
    });

    assert.strictEqual(i, 1);
    trigger('button', 'cancel', { bubbles: true });
    await result.dialog.closed;
    assert.strictEqual(i, 2);
  });

  it('calls hide only once on modal dialog close event', async function () {
    let i = 0;
    const { component, trigger } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );
    const result = await component.dialogService.open<DialogRenderOptionsStandard>({
      host: component.host,
      template: '<button>cancel dialog</button>',
      options: {
        modal: true,
        hide: () => { i++; },
      }
    });

    trigger('button', 'cancel', { bubbles: true });
    // await new Promise(resolve => setTimeout(resolve, 100));
    await result.dialog.closed;
    assert.strictEqual(i, 1);
  });

  it('does not call hide when component deactivation fails', async function () {
    const { component, trigger } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    let i = 0;
    await component.dialogService.open<DialogRenderOptionsStandard>({
      host: component.host,
      template: '<button>cancel dialog</button>',
      component: () => ({
        deactivate: () => {
          return i++ === 0 ? Promise.reject(new Error('deactivation failed')) : Promise.resolve();
        }
      }),
      options: {
        modal: true,
        hide: () => { i++; },
      }
    });

    let error: Error | undefined;
    await new Promise<void>((resolve) => {
      globalThis.addEventListener('unhandledrejection', function handleUncaught(ev) {
        ev.preventDefault();
        error = ev.reason as Error;
        globalThis.removeEventListener('unhandledrejection', handleUncaught);
        return component.dialogService.closeAll().then(() => resolve());
      });

      trigger('button', 'cancel', { bubbles: true });
    });

    assert.includes(error.message, 'deactivation failed');
  });

  it('closes template when calling ok()', async function () {
    const { component, assertHtml, trigger, flush } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open({
      host: component.host,
      template: '<template><button click.trigger="$dialog.ok()">ok</button></template>',
    });

    assertHtml('dialog', '<div><button>ok</button></div>');

    trigger('button', 'click', { bubbles: true });
    flush();

    assertHtml('');
  });

  it('closes template when calling cancel()', async function () {
    const { component, assertHtml, trigger, flush } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open({
      host: component.host,
      template: '<template><button click.trigger="$dialog.cancel()">cancel</button></template>',
    });

    assertHtml('dialog', '<div><button>cancel</button></div>');

    trigger('button', 'click', { bubbles: true });
    flush();

    assertHtml('');
  });

  it('closes template when calling error()', async function () {
    const { component, assertHtml, trigger, flush } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    await component.dialogService.open({
      host: component.host,
      template: '<template><button click.trigger="$dialog.error()">error</button></template>',
    });

    assertHtml('dialog', '<div><button>error</button></div>');

    trigger('button', 'click', { bubbles: true });
    flush();

    assertHtml('');
  });

  it('does not close and remove the dialog when canDeactivate returns false', async function () {
    const { component, assertHtml, trigger, flush } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogConfigurationStandard]
    );

    let i = 0;
    await component.dialogService.open({
      host: component.host,
      component: () => ({
        // only stop the first call
        canDeactivate: () => i++ > 0,
      }),
      template: '<template><button click.trigger="$dialog.ok()">error</button></template>',
    });

    trigger('button', 'click');
    flush();
    assertHtml('dialog', '<div><button>error</button></div>');

    trigger('button', 'click');
    flush();
    assertHtml('');
  });
});
