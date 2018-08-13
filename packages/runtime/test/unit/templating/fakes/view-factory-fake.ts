import { IViewFactory, IView } from "@aurelia/runtime";
import { ViewFake } from './view-fake';

export class ViewFactoryFake implements IViewFactory {
  name: string;
  isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {}
  create(): IView {
    return new ViewFake();
  }
}
