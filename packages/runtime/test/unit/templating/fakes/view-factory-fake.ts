import { IViewFactory, IView } from "../../../../src/index";
import { ViewFake } from './view-fake';

export class ViewFactoryFake implements IViewFactory {
  canReturnToCache(view: IView): boolean {
    return false;
  }
  tryReturnToCache(view: IView): boolean {
    return false;
  }
  name: string;
  isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {}
  create(): IView {
    return new ViewFake();
  }
}
