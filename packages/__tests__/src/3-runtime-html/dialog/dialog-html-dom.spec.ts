import { delegateSyntax } from '@aurelia/compat-v1';
import { Registration, noop, resolve } from '@aurelia/kernel';
import {
  INode,
  customElement,
  CustomElement,
} from '@aurelia/runtime-html';
import {
  IDialogService,
  IDialogSettings,
  IDialogGlobalSettings,
  DialogConfiguration,
  DialogDefaultConfiguration,
  DefaultDialogGlobalSettings,
  DialogCancelError,
  IDialogDom,
  IDialogController,
  DialogController,
  DefaultDialogDom,
  DialogService,
  IDialogDomAnimator,
  HtmlDialogDomRenderer,
  DefaultDialogEventManager,
} from '@aurelia/dialog';
import {
  createFixture,
  assert,
  createSpy,
} from '@aurelia/testing';
import { isNode } from '../../util.js';

describe('3-runtime-html/dialog/dialog-html-dom.spec.ts', function () {
  it('throws on empty configuration', async function () {
    const { component, assertHtml, printHtml } = createFixture(
      '',
      class {
        host = resolve(INode) as HTMLElement;
        dialogService = resolve(IDialogService);
      },
      [
        DialogConfiguration.customize(_ => { }, [
          DialogService,
          DefaultDialogGlobalSettings,
          HtmlDialogDomRenderer,
          DefaultDialogEventManager,
        ]),
      ]);

    await component.dialogService.open({
      host: component.host,
      template: 'hey',
    });

    printHtml();
    assertHtml('<dialog data-dialog-id="d-1"><div>hey</div></dialog>');
  });
});
