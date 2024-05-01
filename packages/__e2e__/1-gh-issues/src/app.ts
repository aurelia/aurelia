import { IDialogService } from '@aurelia/dialog';
import { MyDialog } from './my-dialog';

export class App {
  static inject = [IDialogService];

  message = 'Hello World!';
  dialogService: IDialogService;

  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  async click() {
    await this.dialogService.open({
      component: () => MyDialog,
      lock: false
    });
  }
}
