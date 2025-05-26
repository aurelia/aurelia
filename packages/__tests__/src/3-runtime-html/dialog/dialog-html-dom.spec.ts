import {
  DialogController,
  DialogStandardConfiguration,
  DialogDomStandard,
  IDialogService
} from '@aurelia/dialog';
import { resolve } from '@aurelia/kernel';
import {
  INode
} from '@aurelia/runtime-html';
import {
  createFixture
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
});
