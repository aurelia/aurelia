import { IContainer } from './../../kernel/di';
import { ArrayObserver, IObservedArray } from '../binding/array-observer';
import { ITaskQueue } from '../task-queue';
import { IRenderSlot } from '../templating/render-slot';
import { IViewOwner } from '../templating/view';
import { IVisualFactory, IVisual } from '../templating/visual';
import { IScope } from '../binding/binding-context';
import { ForOfStatement } from '../binding/ast';
import { Binding } from '../binding/binding';

export class ArrayRepeater {
  private _items: IObservedArray;
  public set items(newValue: IObservedArray) {
    if (this._items === newValue) {
      return;
    }
    this._items = newValue;
    if (this.isBound) {
      this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
      this.observer = newValue.$observer || new ArrayObserver(newValue);
      this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.subscribeBatched(this.handleBatchedItemsMutation);
    }
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
  public sourceExpression: ForOfStatement;

  constructor(
    public tq: ITaskQueue,
    public slot: IRenderSlot,
    public owner: IViewOwner,
    public factory: IVisualFactory,
    public container: IContainer) {
    this.scope = null;
    this.observer = null;
    this.isQueued = false;
    this.isBound = false;
  }

  call(): void {
    this.isQueued = false;
    this.observer.flushChanges();
  }

  bound(scope: IScope): void {
    this.sourceExpression = <any>(<Binding[]>this.owner.$bindable).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    this.scope = scope;
    this.observer = this.items.$observer || new ArrayObserver(this.items);
    this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.subscribeBatched(this.handleBatchedItemsMutation);
    this.isBound = true;
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
    // this is a two-pass thing; first process removed items, then move/add
    const childrenCopy = children.slice();
    const len = indexMap.length;
    let to = 0;
    let from = 0;

    // first pass
    while (to < len) {
      from = indexMap[to];
      if (from === to) {
        to++;
        continue;
      }
      // remove
      if (from === -1) {
        const visual = children[to];
        if (this.slot['$isAttached']) {
          visual.$detach();
          visual.tryReturnToCache();
        }
      }
      to++;
    }
    to = 0;

    // second pass
    while (to < len) {
      from = indexMap[to];
      if (from === to) {
        to++;
        continue;
      }
      if (from > -1) {
        // move existing
        const visual = children[to] = childrenCopy[from];
        if (this.slot['$isAttached']) {
          visual.$view.remove();
          visual.renderState = to;
          this.slot['insertVisualCore'](visual);
        }
      } else if (from < -1) {
        // add new
        const visual = children[to] = this.factory.create();
        const bindingContext = { [this.local]: items[-from - 2] };
        const scope = {
          bindingContext,
          overrideContext: {
            bindingContext,
            parentOverrideContext: this.scope.overrideContext
          }
        };
        visual.$scope = scope;
        for (const bindable of visual.$bindable) {
          bindable.$bind(scope);
        }
        if (this.slot['$isAttached']) {
          visual.$attach(this.slot['encapsulationSource']);
          visual.onRender = this.slot['addVisualCore'];
        }
      } else if (from === undefined) {
        // todo: implement length observation and add a method on the array object
        // that provides an observed means of directly assigning to an index
      }
      to++;
    }
    children.length = items.length;
  };
}
