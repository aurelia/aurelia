import { IDialogService } from '@aurelia/dialog';
import { MyDialog } from './my-dialog';
import depValue from 'conditional-browser-package';

export class App {
  static inject = [IDialogService];

  message = 'Hello World!';
  depValue = depValue;
  dialogService: IDialogService;

  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  async click() {
    await this.dialogService.open({
      component: () => MyDialog,
      options: {
        lock: false
      }
    });
  }
}
