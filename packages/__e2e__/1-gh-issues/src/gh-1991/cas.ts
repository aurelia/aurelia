import { IHydratedController } from '@aurelia/runtime-html';
import { ICustomAttributeViewModel, INode, bindable, resolve } from 'aurelia';

export class SuperColorCustomAttribute implements ICustomAttributeViewModel {
  protected readonly _el: INode<HTMLElement> = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);

  @bindable public value: string;

  public binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    this._el.style.color = this.value;
  }
}

export class SubColorCustomAttribute extends SuperColorCustomAttribute {
  @bindable public background: string;

  public binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    super.binding(_initiator, _parent);
    this._el.style.backgroundColor = this.background;
  }
}
