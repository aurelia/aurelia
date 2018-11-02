import { PLATFORM } from '@aurelia/kernel';
import { Lifecycle } from '../../lifecycle';
import { IScope, LifecycleFlags } from '../../observation';
import { IView } from '../view';

export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private currentView: IView = null;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  public compose(value: IView, flags: LifecycleFlags): void {
    this.swap(value, flags);
  }

  public binding(flags: LifecycleFlags, scope: IScope): void {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      this.currentView.$bind(flags, scope);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    this.isAttached = true;

    if (this.currentView !== null) {
      this.currentView.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    this.isAttached = false;

    if (this.currentView !== null) {
      this.currentView.$detach(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    this.isBound = false;

    if (this.currentView !== null) {
      this.currentView.$unbind(flags);
    }
  }

  public caching(flags: LifecycleFlags): void {
    this.currentView = null;
  }

  private swap(view: IView, flags: LifecycleFlags): void {
    if (this.currentView === view) {
      return;
    }

    if (this.currentView !== null) {
      if (this.isAttached) {
        Lifecycle.beginDetach();
        this.currentView.$detach(flags);
        Lifecycle.endDetach(flags);
      }
      if (this.isBound) {
        Lifecycle.beginUnbind();
        this.currentView.$unbind(flags);
        Lifecycle.endUnbind(flags);
      }
    }

    this.currentView = view;

    if (this.currentView !== null) {
      if (this.isBound) {
        Lifecycle.beginBind();
        this.currentView.$bind(flags, this.scope);
        Lifecycle.endBind(flags);
      }
      if (this.isAttached) {
        Lifecycle.beginAttach();
        this.currentView.$attach(flags);
        Lifecycle.endAttach(flags);
      }
    }

    this.onSwapComplete();
  }
}
