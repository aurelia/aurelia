import { IDialogDom, IDialogController, DialogDomClassic } from '@aurelia/dialog';

export class MyDialog {
  static inject = [Element, IDialogController, IDialogDom];

  list = ['item1', 'item2', 'item3'];

  host: HTMLElement;
  dialog: IDialogController;
  dialogDom: IDialogDom;

  constructor(host: HTMLElement, dialog: IDialogController, dialogDom: DialogDomClassic) {
    this.host = host;
    this.dialog = dialog;
    this.dialogDom = dialogDom;

    // Wrapper
    dialogDom.root.style.zIndex = '990';
    dialogDom.root.style.position = 'fixed';
    dialogDom.root.style.top = '0';
    dialogDom.root.style.bottom = '0';
    dialogDom.root.style.left = '0';
    dialogDom.root.style.right = '0';
    // dialogDom.wrapper.style.overflow = 'auto'

    // // Overlay
    dialogDom.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // // Content Host
    // dialogDom.contentHost.style.height = 'unset'
  }
}
