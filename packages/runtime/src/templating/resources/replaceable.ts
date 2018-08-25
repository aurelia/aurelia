import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface Replaceable extends ICustomAttribute {}
@templateController('replaceable')
@inject(IViewFactory, IRenderLocation)
export class Replaceable {
  private $child: IView;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.$child = this.factory.create();
    this.$child.onRender = view => view.$nodes.insertBefore(location);
  }

  public bound(flags: BindingFlags, scope: IScope): void {
    this.$child.$bind(flags, scope);
  }

  public unbound(flags: BindingFlags,): void {
    this.$child.$unbind(flags);
  }
}
