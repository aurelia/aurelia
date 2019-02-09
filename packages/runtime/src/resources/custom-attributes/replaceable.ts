import { InjectArray, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IView, IViewFactory } from '../../lifecycle';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface Replaceable<T extends INode = INode> extends ICustomAttribute<T> {}
export class Replaceable<T extends INode = INode> implements Replaceable<T> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  private readonly currentView: IView<T>;
  private readonly factory: IViewFactory<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.factory = factory;

    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public binding(flags: LifecycleFlags): void {
    this.currentView.$bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$scope);
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
}
CustomAttributeResource.define({ name: 'replaceable', isTemplateController: true }, Replaceable);
