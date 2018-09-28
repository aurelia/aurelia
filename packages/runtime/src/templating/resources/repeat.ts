import { inject } from '@aurelia/kernel';
import { Binding, BindingContext, BindingFlags, CollectionObserver, ForOfStatement, getCollectionObserver, IBatchedCollectionSubscriber, IChangeSet, IScope, ObservedCollection, SetterObserver } from '../../binding';
import { INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { Lifecycle, LifecycleFlags } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IView, IViewFactory } from '../view';

// tslint:disable-next-line:interface-name
export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {}

@inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory)
@templateController('repeat')
export class Repeat<T extends ObservedCollection> {
  @bindable public items: T;

  public $isAttached: boolean;
  public $isBound: boolean;
  public $scope: IScope;

  public local: string;
  public encapsulationSource: INode = null;
  public views: IView[] = [];
  public observer: CollectionObserver = null;
  public hasPendingInstanceMutation: boolean = false;
  public hasPendingMutation: boolean = false;
  public sourceExpression: ForOfStatement;
  public $observers: { items: SetterObserver }

  constructor(
    public changeSet: IChangeSet,
    public location: IRenderLocation,
    public renderable: IRenderable,
    public factory: IViewFactory) { }

  public bound(flags: BindingFlags): void {
    this.sourceExpression = (<Binding[]>this.renderable.$bindables)
      .find(b => b.target === this).sourceExpression as ForOfStatement;

    this.local = this.sourceExpression.declaration.evaluate(flags, this.$scope, null);
    if (this.hasPendingMutation) {
      if (flags & BindingFlags.fromFlushChanges) {
        this.flushChanges();
      } else {
        this.changeSet.add(this);
      }
    }
  }

  public unbound(flags: BindingFlags): void {
    // if this is a re-bind triggered by some ancestor repeater, then keep the views so we can reuse them
    // (this flag is passed down from handleInstanceMutation/handleItemsMutation down below at view.$bind)
    if (!(flags & BindingFlags.fromBind)) {
      this.removeAllViews();
    }
  }

  public flushChanges(): void {
    this.hasPendingMutation = false;
    if (this.observer) {
      this.observer.unsubscribeBatched(this);
    }
    this.observer = getCollectionObserver(this.changeSet, this.items);
    if (this.observer) {
      this.observer.subscribeBatched(this);
    }
    this.handleBatchedItemsOrInstanceMutation(null);
  }

  public itemsChanged(newValue: T, oldValue: T, flags: BindingFlags): void {
    if (this.$isBound) {
      if (flags & BindingFlags.fromFlushChanges) {
        this.flushChanges();
      } else {
        this.changeSet.add(this);
      }
    } else {
      this.hasPendingMutation = this.hasPendingInstanceMutation = true;
    }
  }

  public handleBatchedChange(indexMap: number[] | null): void {
    if (this.$isBound) {
      if (this.hasPendingInstanceMutation) {
        this.hasPendingInstanceMutation = false;
        this.flushChanges();
      } else {
        this.handleBatchedItemsOrInstanceMutation(indexMap);
      }
    } else {
      this.hasPendingMutation = true;
    }
  }

  // if the indexMap === undefined, it is an instance mutation, otherwise it's an items mutation
  private handleBatchedItemsOrInstanceMutation(indexMap: number[] | null): void { // TODO: use indexMap for more efficient items mutation processing
    // determine if there is anything to process and whether or not we can return early
    const views = this.views;
    const items = this.items;
    const oldLength = views.length;
    const sourceExpression = this.sourceExpression;
    const newLength = sourceExpression.count(items);
    if (newLength === 0) {
      if (oldLength === 0) {
        // if we had 0 items and still have 0 items, we don't need to do anything
        return;
      } else {
        // if we had >0 items and now have 0 items, just remove all and return
        this.removeAllViews();
        return;
      }
    }

    if (oldLength < newLength) {
      // expand the array (we add the views later)
      views.length = newLength;
    } else if (newLength < oldLength) {
      // remove any surplus views
      let i = newLength;
      const lifecycle = Lifecycle.beginDetach(LifecycleFlags.none);

      while (i < oldLength) {
        const view = views[i++];
        view.release();
        lifecycle.detach(view);
      }

      lifecycle.end();
      views.length = newLength;
    }

    const location = this.location;
    const isAttached = this.$isAttached;
    const scope = this.$scope;
    const local = this.local;
    const factory = this.factory;
    const encapsulationSource = this.encapsulationSource;
    const lifecycle = Lifecycle.beginAttach(encapsulationSource, LifecycleFlags.none);
    sourceExpression.iterate(items, (arr, i, item) => {
      let view = views[i];
      if (view === undefined) {
        // add view if it doesn't exist yet
        view = views[i] = factory.create();
        view.$bind(BindingFlags.fromFlushChanges, BindingContext.createScopeFromParent(scope, { [local]: item }));
        view.mount(location);

        if (isAttached) {
          lifecycle.attach(view);
        }
      } else {
        // TODO: optimize this again (but in a more efficient way and one that works in multiple scenarios)
        view.$bind(BindingFlags.fromFlushChanges | BindingFlags.fromBind, BindingContext.createScopeFromParent(scope, { [local]: item }));
      }
    });

    lifecycle.end();
  }

  private removeAllViews(): void {
    this.views = [];
    const lifecycle = Lifecycle.beginDetach(LifecycleFlags.none);

    const views = this.views;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.release();
      lifecycle.detach(view);
    }

    lifecycle.end();
  }
}
