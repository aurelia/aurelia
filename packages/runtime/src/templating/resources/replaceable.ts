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
    this.$child.$nodes.insertBefore(location);
  }

  public bound(scope: IScope): void {
    this.$child.$bind(BindingFlags.none, scope);
  }

  public unbound(): void {
    this.$child.$unbind(BindingFlags.none);
  }
}
