import { IView, IViewFactory } from '@aurelia/runtime';
import { HTMLTestContext } from '../util';
import { FakeView } from './fake-view';

export class FakeViewFactory implements IViewFactory {
  public static inject = [HTMLTestContext];
  public name: string;
  public isCaching: boolean;
  constructor(public ctx: HTMLTestContext) {}
  public canReturnToCache(view: IView): boolean {
    return false;
  }
  public tryReturnToCache(view: IView): boolean {
    return false;
  }
  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void { return; }
  public create(): IView {
    return new FakeView(this.ctx);
  }
}
