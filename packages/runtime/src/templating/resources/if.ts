import { inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding';
import { INode, IRenderLocation, DOM } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean;
  public elseFactory: IViewFactory;

  private ifView: IView;
  private elseView: IView;

  private $child: IView;
  private encapsulationSource: INode;

  constructor(public ifFactory: IViewFactory, private location: IRenderLocation) {}

  public bound(): void {
    this.update(this.value, BindingFlags.fromBind);
  }

  public attaching(encapsulationSource: INode): void {
    this.encapsulationSource = encapsulationSource;
  }

  public unbound(): void {
    if (this.$child) {
      this.$child.$unbind(BindingFlags.fromUnbind);
      this.$child = null;
    }
  }

  public valueChanged(newValue: any): void {
    this.update(newValue, BindingFlags.fromBindableHandler);
  }

  private update(renderTrueBranch: boolean, flags: BindingFlags): void {
    if (renderTrueBranch) {
      if (this.$child) {
        if (this.$child === this.ifView) {
          return;
        }

        this.deactivateCurrentBranch(flags);
      }

      this.activateNewBranch(
        this.ifView || (this.ifView = this.ifFactory.create()),
        flags
      );
    } else if (this.elseFactory) {
      if (this.$child) {
        if (this.$child === this.elseView) {
          return;
        }

        this.deactivateCurrentBranch(flags);
      }

      this.activateNewBranch(
        this.elseView || (this.elseView = this.elseFactory.create()),
        flags
      );
    } else if (this.$child) {
      this.deactivateCurrentBranch(flags);
    }
  }

  private activateNewBranch(branch: IView, flags: BindingFlags): void {
    this.$child = branch;
    branch.$bind(flags, this.$scope);
    branch.onRender = view => view.$nodes.insertBefore(this.location);

    if (this.$isAttached) {
      branch.$attach(this.encapsulationSource);
    }
  }

  private deactivateCurrentBranch(flags: BindingFlags): void {
    this.$child.$detach();
    this.$child.$unbind(flags);
    this.$child = null;
  }
}

@templateController('else')
@inject(IViewFactory, IRenderLocation)
export class Else {
  constructor(private factory: IViewFactory, location: IRenderLocation) {
    DOM.remove(location); // Only the location of the "if" is relevant.
  }

  public link(ifBehavior: If): void {
    ifBehavior.elseFactory = this.factory;
  }
}
