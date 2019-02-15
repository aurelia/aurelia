import { InjectArray, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { IBinding, IView, IViewFactory } from '../../lifecycle';
import { IBindingContext } from '../../observation';
import { Scope } from '../../observation/binding-context';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface With<T extends INode = INode> extends ICustomAttribute<T> {}
export class With<T extends INode = INode> implements With<T>  {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  // TODO: this type is incorrect (it can be any user-provided object), need to fix and double check Scope.
  @bindable public value: IBinding | IBindingContext;

  private readonly currentView: IView<T>;
  private readonly factory: IViewFactory<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.value = null;

    this.factory = factory;
    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public valueChanged(this: With): void {
    if (this.$state & (State.isBound | State.isBinding)) {
      this.bindChild(LifecycleFlags.fromBind);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.bindChild(flags);
  }

  public attaching(flags: LifecycleFlags): void {
    this.currentView.$attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.currentView.$detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.currentView.$unbind(flags);
  }

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(flags, this.$scope, this.value);
    this.currentView.$bind(flags, scope);
  }
}
CustomAttributeResource.define({ name: 'with', isTemplateController: true }, With);
