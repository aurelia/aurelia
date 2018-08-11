import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { templateController } from '../custom-attribute';
import { IVisual, IVisualFactory } from '../visual';

@templateController('replaceable')
@inject(IVisualFactory, IRenderLocation)
export class Replaceable {
  private $child: IVisual;

  constructor(private factory: IVisualFactory, location: IRenderLocation) {
    this.$child = this.factory.create();
    this.$child.$view.insertBefore(location);
  }

  public bound(scope: IScope): void {
    this.$child.$bind(BindingFlags.none, scope);
  }

  public unbound(): void {
    this.$child.$unbind(BindingFlags.none);
  }
}
