import { InjectArray } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { IBinding, IController, IViewFactory } from '../../lifecycle';
import { IBindingContext } from '../../observation';
import { Scope } from '../../observation/binding-context';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource } from '../custom-attribute';
import { Controller } from '../../templating/controller';

export class With<T extends INode = INode> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  // TODO: this type is incorrect (it can be any user-provided object), need to fix and double check Scope.
  @bindable public value: IBinding | IBindingContext;

  private readonly viewController: IController<T>;
  private readonly ownController: IController<T>; // TODO: make this not hacky
  private readonly factory: IViewFactory<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.value = null!;

    this.factory = factory;
    this.viewController = this.factory.create();
    this.viewController.hold(location);
    this.ownController = Controller.forCustomAttribute(this, void 0 as any);
  }

  public valueChanged(this: With): void {
    if ((this.ownController.state & (State.isBound | State.isBinding)) > 0) {
      this.bindChild(LifecycleFlags.fromBind);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.bindChild(flags);
  }

  public attaching(flags: LifecycleFlags): void {
    this.viewController.attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.viewController.detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.viewController.unbind(flags);
  }

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(flags, this.ownController.scope!, this.value);
    this.viewController.bind(flags, scope);
  }
}
CustomAttributeResource.define({ name: 'with', isTemplateController: true }, With);
