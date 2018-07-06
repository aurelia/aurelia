import { IContainer } from './../../kernel/di';
import { ArrayObserver, IObservedArray } from '../binding/array-observer';
import { ITaskQueue } from '../task-queue';
import { IRenderSlot } from '../templating/render-slot';
import { IViewOwner } from '../templating/view';
import { IVisualFactory, IVisual } from '../templating/visual';
import { IScope, IOverrideContext } from '../binding/binding-context';
import { ForOfStatement } from '../binding/ast';
import { Binding } from '../binding/binding';

export class ArrayRepeater {
  private _items: IObservedArray;
  public set items(newValue: IObservedArray) {
    if (this._items === newValue) {
      // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
      return;
    }
    this._items = newValue;
    if (this.isBound) {
      // if already bound before, but currently unbound, then unbound will have taken care of unsubscribing
      this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
      // if not bound, then bound will take care of creating the observer and subscribing
      this.observer = newValue.$observer || new ArrayObserver(newValue);
      this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.subscribeBatched(this.handleBatchedItemsMutation);
      this.tq.queueMicroTask(this);
    }
    this.hasPendingInstanceMutation = true;
  }
  public get items(): IObservedArray {
    return this._items;
  }

  public get local(): string {
    return this.sourceExpression.declaration.name;
  }

  public scope: IScope;
  public observer: ArrayObserver;
  public isQueued: boolean;
  public isBound: boolean;
  public hasPendingInstanceMutation: boolean;
  public sourceExpression: ForOfStatement;

  constructor(public tq: ITaskQueue, public slot: IRenderSlot, public owner: IViewOwner, public factory: IVisualFactory, public container: IContainer) {
    this.scope = null;
    this.observer = null;
    this.isQueued = false;
    this.isBound = false;
    this.hasPendingInstanceMutation = false;
  }

  call(): void {
    this.isQueued = false;
    if (this.hasPendingInstanceMutation) {
      // if a new array instance is assigned, disregard the observer state and start from scratch
      if (this.observer.hasChanges) {
        this.observer.resetIndexMap();
        this.observer.hasChanges = false;
      }
      this.handleInstanceMutation(this.items);
    } else {
      this.observer.flushChanges();
    }
  }

  bound(scope: IScope): void {
    this.sourceExpression = <any>(<Binding[]>this.owner.$bindable).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    this.scope = scope;
    this.observer = this.items.$observer || new ArrayObserver(this.items);
    this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.subscribeBatched(this.handleBatchedItemsMutation);
    this.isBound = true;
    if (this.hasPendingInstanceMutation) {
      this.handleInstanceMutation(this.items);
    }
  }

  unbound(): void {
    this.isBound = false;
    this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
    this.observer = this._items = null;
    this.slot.removeAll(true, true);
  }

  handleImmediateItemsMutation = (): void => {
    if (this.isQueued === false) {
      this.isQueued = true;
      this.tq.queueMicroTask(this);
    }
  };

  handleBatchedItemsMutation = (indexMap: Array<number>): void => {
    const children = <IVisual[]>this.slot.children;
    const items = this.items;
    if (children.length === 0 && items.length === 0) {
      return;
    }
    const childrenCopy = children.slice();
    const len = indexMap.length;
    let from = 0;

    let to = 0;
    while (to < len) {
      from = indexMap[to];
      if (from > -1) {
        // move
        children[to] = childrenCopy[from];
        if (this.slot['$isAttached']) {
          const visual = children[to];
          visual.$view.remove();
          visual.renderState = to;
          this.slot['insertVisualCore'](visual);
        }
      } else if (from < -1) {
        // add
        const visual = children[to] = this.factory.create();
        this.addVisual(visual, items[to]);
      } else if (from === -1) {
        // remove
        if (this.slot['$isAttached']) {
          const visual = childrenCopy[to];
          visual.$detach();
          visual.tryReturnToCache();
        }
      }
      to++;
    }
    children.length = items.length;
  };

  addVisual(visual: IVisual, item: any): void {
    visual.$scope = createChildScope(this.scope.overrideContext, { [this.local]: item });
    for (const bindable of visual.$bindable) {
      bindable.$bind(visual.$scope);
    }
    if (this.slot['$isAttached']) {
      visual.$attach(this.slot['encapsulationSource']);
      visual.onRender = this.slot['addVisualCore'];
    }
  }

  handleInstanceMutation(items: any[]): void {
    this.slot.removeAll(true, true);
    const children = <IVisual[]>this.slot.children;
    let len = (children.length = items.length);
    let i = 0;
    while (i < len) {
      this.addVisual((children[i] = this.factory.create()), items[i]);
      i++;
    }
    this.hasPendingInstanceMutation = false;
  }
}

function createChildScope(parentOverrideContext: IOverrideContext, bindingContext: { [key: string]: any }): IScope {
  return {
    bindingContext,
    overrideContext: {
      bindingContext,
      parentOverrideContext
    }
  };
}
