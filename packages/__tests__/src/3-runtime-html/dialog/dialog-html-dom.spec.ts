import {
  DialogController,
  DialogStandardConfiguration,
  DialogDomStandard,
  IDialogService,
  DialogRenderOptionsStandard
} from '@aurelia/dialog';
import { resolve } from '@aurelia/kernel';
import {
  INode
} from '@aurelia/runtime-html';
import {
  createFixture,
  assert,
} from '@aurelia/testing';
import { isNode } from '../../util.js';

describe('3-runtime-html/dialog/dialog-html-dom.spec.ts', function () {
  // only deal with <dialog> in the browser
  if (isNode()) return;

  it('renders <dialog> element', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogStandardConfiguration]
    );

    await component.dialogService.open({
      host: component.host,
      template: 'hey',
    });

    assertHtml('<dialog data-dialog-id="d-1" open=""><div>hey</div></dialog>');
  });

  it('renders <dialog> element with overlay', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogStandardConfiguration]
    );

    await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        modal: true,
      }
    });

    assertHtml('<dialog data-dialog-id="d-2" open=""><div>hey</div></dialog>');
  });

  it('sets overlay style', async function () {
    const { component, assertHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogStandardConfiguration]
    );

    const result = await component.dialogService.open({
      host: component.host,
      template: 'hey',
      options: {
        modal: true,
      }
    });

    assertHtml('<dialog data-dialog-id="d-3" open=""><div>hey</div></dialog>');

    ((result.dialog as DialogController)['dom'] as DialogDomStandard).setOverlayStyle('background: red;');
    assertHtml('<dialog data-dialog-id="d-3" open=""><style>[data-dialog-id="d-3"]::backdrop{background: red;}</style><div>hey</div></dialog>');

    ((result.dialog as DialogController)['dom'] as DialogDomStandard).setOverlayStyle({ backgroundColor: 'blue' });
    assertHtml('<dialog data-dialog-id="d-3" open=""><style>[data-dialog-id="d-3"]::backdrop{background-color: blue;}</style><div>hey</div></dialog>');
  });

  it('calls show/hide hooks on global options', async function () {
    let i = 0;
    const { component } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogStandardConfiguration.customize(options => {
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
      , [DialogStandardConfiguration]
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
      [DialogStandardConfiguration.customize(options => {
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

  it('calls hide on escape key for modal dialog', async function () {
    const { component, trigger } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [DialogStandardConfiguration.customize(options => {
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
    trigger('button', 'keydown', { key: 'Escape', keyCode: 27, bubbles: true });
    // await new Promise(resolve => setTimeout(resolve, 100));
    await result.dialog.closed;
    assert.strictEqual(i, 2);
  });
});
