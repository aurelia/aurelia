import { IAttachLifecycle, IDetachLifecycle, IDetachLifecycleController, IAttachLifecycleController } from './../lifecycle';
import { inject } from '@aurelia/kernel';
import { Binding, BindingContext, BindingFlags, CollectionObserver, ForOfStatement, getCollectionObserver, IBatchedCollectionSubscriber, IChangeSet, IScope, ObservedCollection, SetterObserver, IObservedArray } from '../../binding';
import { INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { Lifecycle, LifecycleFlags } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IView, IViewFactory } from '../view';

// tslint:disable-next-line:interface-name
export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {}

const batchedChangesFlags = BindingFlags.fromFlushChanges | BindingFlags.fromBind;

@inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory)
@templateController('repeat')
export class Repeat<T extends ObservedCollection = IObservedArray> {
  @bindable public items: T;

  public $isAttached: boolean;
  public $isBound: boolean;
  public $scope: IScope;
  public $observers: { items: SetterObserver }

  public encapsulationSource: INode = null;
  public views: IView[] = [];
  public observer: CollectionObserver = null;
  public hasPendingInstanceMutation: boolean = false;

  public forOf: ForOfStatement;
  public local: string;

  constructor(
    public changeSet: IChangeSet,
    public location: IRenderLocation,
    public renderable: IRenderable,
    public factory: IViewFactory) { }

  public bound(flags: BindingFlags): void {
    const forOf = this.forOf = (<Binding[]>this.renderable.$bindables)
      .find(b => b.target === this).sourceExpression as ForOfStatement;
    const local = this.local = forOf.declaration.evaluate(flags, this.$scope, null);
    const { views, factory, $scope } = this;
    forOf.iterate(this.items, (arr, i, item) => {
      let view = views[i];
      if (view === undefined) {
        // add view if it doesn't exist yet
        view = views[i] = this.factory.create();
        view.$bind(batchedChangesFlags, BindingContext.createScopeFromParent(this.$scope, { [this.local]: item }));
      } else {

        view.$bind(batchedChangesFlags, BindingContext.createScopeFromParent(this.$scope, { [this.local]: item }));
      }
    });
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycleController): void {
    const views = this.views;
    const location = this.location;
    for (let i = 0, ii = views.length, view = views[i]; i < ii; view = views[++i]) {
      view.mount(location);
      lifecycle.attach(view);
    }
  }

  public detaching(lifecycle: IDetachLifecycleController): void {
    const views = this.views;
    for (let i = 0, ii = views.length, view = views[i]; i < ii; view = views[++i]) {
      view.release();
      lifecycle.detach(view);
    }
  }

  public unbound(flags: BindingFlags): void {
    const views = this.views;
    for (let i = 0, ii = views.length, view = views[i]; i < ii; view = views[++i]) {
      view.$unbind(flags);
    }
  }

  public flushChanges(): void {
    this.handleBatchedItemsOrInstanceMutation(null);
  }

  // called by SetterObserver (sync)
  public itemsChanged(newValue: T, oldValue: T, flags: BindingFlags): void {
    this.refreshCollectionObserver();
    if (this.$isBound) {
      if (flags & BindingFlags.fromFlushChanges) {
        this.handleBatchedItemsOrInstanceMutation(null);
      } else {
        this.changeSet.add(this);
      }
    } else {
      this.hasPendingInstanceMutation = true;
    }
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null): void {
    if (this.$isBound) {
      if (this.hasPendingInstanceMutation) {
        this.hasPendingInstanceMutation = false;
        this.handleBatchedItemsOrInstanceMutation(null);
      } else {
        this.handleBatchedItemsOrInstanceMutation(indexMap);
      }
    }
  }

  // if the indexMap === undefined, it is an instance mutation, otherwise it's an items mutation
  private handleBatchedItemsOrInstanceMutation(indexMap: number[] | null): void { // TODO: use indexMap for more efficient items mutation processing
    // determine if there is anything to process and whether or not we can return early
    const views = this.views;
    const items = this.items;
    const oldLength = views.length;
    const forOf = this.forOf;
    const newLength = forOf.count(items);
    if (oldLength < newLength) {
      // expand the array (we add the views later)
      views.length = newLength;
    } else if (newLength < oldLength) {
      // remove any surplus views
      const lifecycle = Lifecycle.beginDetach(LifecycleFlags.unbindAfterDetached);
      for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
        view.release();
        lifecycle.detach(view);
      }
      lifecycle.end();
      views.length = newLength;
    }
    if (newLength === 0) {
      return;
    }

    const lifecycle = Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none);
    forOf.iterate(items, (arr, i, item) => {
      let view = views[i];
      if (view === undefined) {
        // add view if it doesn't exist yet
        view = views[i] = this.factory.create();
        view.$bind(batchedChangesFlags, BindingContext.createScopeFromParent(this.$scope, { [this.local]: item }));

        if (this.$isAttached) {
          view.mount(this.location);
          lifecycle.attach(view);
        }
      } else {
        // TODO: optimize this again (but in a more efficient way and one that works in multiple scenarios)
        view.$bind(batchedChangesFlags, BindingContext.createScopeFromParent(this.$scope, { [this.local]: item }));
      }
    });

    lifecycle.end();
  }

  private refreshCollectionObserver(): void {
    const oldObserver = this.observer;
    const newObserver = this.observer = getCollectionObserver(this.changeSet, this.items);
    if (oldObserver !== newObserver) {
      if (oldObserver) {
        oldObserver.unsubscribeBatched(this);
      }
      if (newObserver) {
        newObserver.subscribeBatched(this);
      }
    }
  }
}
