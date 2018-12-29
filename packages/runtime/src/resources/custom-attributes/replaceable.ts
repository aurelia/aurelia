import { inject, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute, ICustomAttributeResource, templateController } from '../custom-attribute';

export interface Replaceable<T extends INode = INode> extends ICustomAttribute<T> {}

@templateController('replaceable')
@inject(IViewFactory, IRenderLocation)
export class Replaceable<T extends INode = INode> implements Replaceable<T> {
  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  private currentView: IView<T>;
  private factory: IViewFactory<T>;

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
