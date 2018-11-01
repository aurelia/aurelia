import { PLATFORM } from '@aurelia/kernel';
import { INode } from '../../dom';
import { Lifecycle, ILifecycle } from '../../lifecycle';
import { BindingFlags, IChangeSet, IScope } from '../../observation';
import { IView } from '../view';

export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private currentView: IView = null;
  private encapsulationSource: INode;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  constructor(public readonly changeSet: IChangeSet) {}

  public compose(value: IView): void {
    this.swap(value);
  }

  public binding(flags: BindingFlags, scope: IScope): void {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      this.currentView.$bind(flags, scope);
    }
  }

  public attaching(encapsulationSource: INode, lifecycle: ILifecycle): void {
    this.encapsulationSource = encapsulationSource;
    this.isAttached = true;

    if (this.currentView !== null) {
      this.currentView.$attach(encapsulationSource, lifecycle);
    }
  }

  public detaching(lifecycle: ILifecycle): void {
    this.isAttached = false;

    if (this.currentView !== null) {
      this.currentView.$detach(lifecycle);
    }
  }

  public unbinding(flags: BindingFlags): void {
    this.isBound = false;

    if (this.currentView !== null) {
      this.currentView.$unbind(flags);
    }
  }

  public caching(): void {
    this.currentView = null;
  }


  private swap(view: IView): void {
    if (this.currentView === view) {
      return;
    }

    if (this.currentView !== null) {
      Lifecycle.beginDetach(this.changeSet)
        .detach(this.currentView)
        .endDetach();

      this.currentView.$unbind(BindingFlags.fromUnbind);
    }

    this.currentView = view;

    if (this.currentView !== null) {
      if (this.isBound) {
        this.currentView.$bind(BindingFlags.fromBindableHandler, this.scope);
      }

      if (this.isAttached) {
        Lifecycle.beginAttach(this.changeSet, this.encapsulationSource)
          .attach(this.currentView)
          .endAttach();
      }
    }

    this.onSwapComplete();
  }
}
