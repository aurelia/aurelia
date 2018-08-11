import { IVisualFactory, IVisual } from "@aurelia/runtime";
import { VisualFake } from './visual-fake';

export class VisualFactoryFake implements IVisualFactory {
  name: string;
  isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {}
  create(): IVisual {
    return new VisualFake();
  }
}
