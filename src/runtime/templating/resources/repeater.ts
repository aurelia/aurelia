import { Collection, CollectionObserver, CollectionKind } from './../../binding/observation/collection-observer';
import { ICustomAttributeSource, CustomAttributeResource } from '../custom-attribute';
import { AttachLifecycle, DetachLifecycle } from '../../templating/lifecycle';
import { IRuntimeBehavior, RuntimeBehavior } from '../../templating/runtime-behavior';
import { IRenderingEngine } from '../../templating/rendering-engine';
import { PLATFORM } from '../../../kernel/platform';
import { IContainer, inject, Registration } from '../../../kernel/di';
import { ArrayObserver, getArrayObserver } from '../../binding/observation/array-observer';
import { ITaskQueue } from '../../task-queue';
import { IRenderSlot } from '../../templating/render-slot';
import { IViewOwner } from '../../templating/view';
import { IVisualFactory, IVisual } from '../../templating/visual';
import { IScope, IOverrideContext } from '../../binding/binding-context';
import { ForOfStatement } from '../../binding/ast';
import { Binding, BindingMode, BindingFlags } from '../../binding/binding';
import { Immutable } from '../../../kernel/interfaces';
import { IResourceKind, IResourceType } from '../../resource';
import { INode } from '../../dom';
import { ICustomAttribute } from '../custom-attribute';
import { getMapObserver } from '../../binding/observation/map-observer';
import { getSetObserver } from '../../binding/observation/set-observer';


export function getCollectionObserver(collection: any): CollectionObserver {
  if (Array.isArray(collection)) {
    return <any>getArrayObserver(collection);
  } else if (collection instanceof Map) {
    return <any>getMapObserver(collection);
  } else if (collection instanceof Set) {
    return <any>getSetObserver(collection);
  }
}
/* 
 * How the repeater works
 * ----------------------
 * 
 * There are 2 main flows: ItemsMutation and InstanceMutation
 * 
 * ItemsMutation is triggered from the CollectionObserver
 * 1. A change comes in at handleImmediateItemsMutation (called synchronously by the observer with each mutation)
 * 2. handleImmediateItemsMutation queues this.call() to the microTaskQueue; consecutive calls before the next flush are ignored
 * 3. this.call() tells the observer to flush its changes which in turn calls this.handleBatchedItemsMutation with an indexMap
 *    this is something that still needs to be changed (observer should do the queueing)
 * 4. indexMap contains a mapping of the items current indices and their previous indices, which is used to efficiently
 *    update the visual state
 * 
 * InstanceMutation is triggered by the items setter on this class when assigned by an observer
 * 1. The observer is re-subscribed to the new collection instance and this.call() is queued
 * 2. The same process for occurs as for ItemsMutation, but instead this.handleInstanceMutation() is called
 * 3. The logic is largely similar, except all items are considered "new" and so there is less reusing of binding contexts
 *  
 */
@inject(ITaskQueue, IRenderSlot, IViewOwner, IVisualFactory, IContainer)
export class Repeater<T extends Collection> implements ICustomAttribute {
  // note: everything declared from #region to #endregion is more-or-less copy-paste from what the
  // @templateController decorator would apply to this class, but we have more information here than the decorator
  // does, so we can take a few shortcuts for slightly better perf (and one can argue that this makes the repeater
  // as a whole easier to understand)

  // #region custom-attribute definition
  // attribute
  public static kind: IResourceKind<ICustomAttributeSource, IResourceType<ICustomAttributeSource, ICustomAttribute>> = CustomAttributeResource;
  public static description: Immutable<Required<ICustomAttributeSource>> = {
    name: 'repeat',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: {
      items: { attribute: 'items', mode: BindingMode.toView, property: 'items' },
      local: { attribute: 'local', mode: BindingMode.toView, property: 'local' }
    }
  };
  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:repeat', Repeater));
  }

  // attribute proto.$hydrate
  public $changeCallbacks: (() => void)[] = [];
  public $isAttached: boolean = false;
  public $isBound: boolean = false;
  public $scope: IScope = null;
  public $slot: IRenderSlot;
  public $behavior: IRuntimeBehavior = new (<any>RuntimeBehavior)();
  public $hydrate(renderingEngine: IRenderingEngine): void {
    let b: RuntimeBehavior = renderingEngine['behaviorLookup'].get(Repeater);
    if (!b) {
      b = new (<any>RuntimeBehavior)();
      b.bindables = Repeater.description.bindables;
      b.hasCreated = b.hasAttaching = b.hasAttached = b.hasDetaching = b.hasDetached = b.hasCreateView = false;
      b.hasBound = b.hasUnbound = true;
      renderingEngine['behaviorLookup'].set(Repeater, b);
    }
    this.$behavior = b;
  }

  // attribute proto.$bind
  public $bind(flags: BindingFlags, scope: IScope): void {      
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }
    this.$scope = scope
    this.$isBound = true;
    this.bound(flags, scope);
  }

  // attribute proto.$attach
  public $attach(encapsulationSource: INode, lifecycle: AttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }
    if (this.$slot !== null) {
      this.$slot.$attach(encapsulationSource, lifecycle);
    }
    this.$isAttached = true;
  }
  // attribute proto.$detach
  public $detach(lifecycle: DetachLifecycle): void {
    if (this.$isAttached) {
      if (this.$slot !== null) {
        this.$slot.$detach(lifecycle);
      }
      this.$isAttached = false;
    }
  }
  // attribute proto.$unbind
  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      this.unbound(flags);
      this.$isBound = false;
    }
  }
  // #endregion

  private _items: T & { $observer: CollectionObserver };
  public set items(newValue: T & { $observer: CollectionObserver }) {
    const oldValue = this._items;
    if (oldValue === newValue) {
      // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
      return;
    }
    this._items = newValue;
    if (this.isBound) {
      // only re-subscribe and queue if we're bound; otherwise bound() below will pick up hasPendingInstanceMutation
      // and act accordingly
      this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
      if (newValue !== null && newValue !== undefined) {
        this.observer = getCollectionObserver(newValue);
        this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
        this.observer.subscribeBatched(this.handleBatchedItemsMutation);
      }
      this.tq.queueMicroTask(this);
    }
    this.hasPendingInstanceMutation = true;
  }
  public get items(): T & { $observer: CollectionObserver } {
    return this._items;
  }

  private _local: string;
  public get local(): string {
    return this._local || this.sourceExpression.declaration.name;
  }
  public set local(value: string) {
    this._local = value;
  }

  public visualsRequireLifecycle: boolean;

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

  /**
   * Process any pending array or instance mutations
   * - called by the TaskQueue
   */
  public call(): void {
    this.isQueued = false;
    if (this.hasPendingInstanceMutation) {
      // if a new array instance is assigned, disregard the observer state and start from scratch
      if (this.observer.hasChanges) {
        this.observer.resetIndexMap();
        this.observer.hasChanges = false;
      }
      this.handleInstanceMutation(<any>this.items);
    } else {
      this.observer.flushChanges();
    }
  }

  /**
   * Initialize array observation and process any pending instance mutation (if this is a re-bind)
   * - called by $bind
   */
  public bound(flags: BindingFlags, scope: IScope): void {
    this.sourceExpression = <any>(<Binding[]>this.owner.$bindable).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    this.scope = scope;
    this.observer = getCollectionObserver(this.items);
    this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.subscribeBatched(this.handleBatchedItemsMutation);
    this.isBound = true;
    if (this.hasPendingInstanceMutation) {
      this.handleInstanceMutation(<any>this.items);
    }
  }

  /**
   * Cleanup subscriptions and remove rendered items from the DOM
   * - called by $unbind
   */
  public unbound(flags: BindingFlags): void {
    this.isBound = false;
    this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
    this.observer = this.items = null;
    // if this is a re-bind triggered by some ancestor repeater, then keep the visuals so we can reuse them
    // (this flag is passed down from handleInstanceMutation/handleItemsMutation down below at visual.$bind)
    if (!(flags & (BindingFlags.instanceMutation | BindingFlags.itemsMutation))) {
      this.slot.removeAll(true, true);
    }
  }

  /**
   * Add a new visual to this instance with the specified item in the bindingContext
   */
  public addVisual(visual: IVisual, item: any): void {
    const scope = createChildScope(this.scope.overrideContext, { [this.local]: item });
    visual.$bind(BindingFlags.none, scope);
    visual.parent = this.slot;
    visual.onRender = this.slot['addVisualCore'];
    if (this.slot['$isAttached']) {
      visual.$attach(this.slot['encapsulationSource']);
    }
  }

  /**
   * Queue this.call() in the TaskQueue
   * - called automatically by the ArrayObserver on any array mutation
   */
  private handleImmediateItemsMutation = (): void => {
    if (this.isQueued === false) {
      this.isQueued = true;
      this.tq.queueMicroTask(this);
    }
  };

  /**
   * Process all pending array mutations (add/move/remove), update bindings and views (if attached)
   * - called manually by ArrayObserver.flushChanges
   */
  private handleBatchedItemsMutation = (indexMap: Array<number>): void => {
    const visuals = <IVisual[]>this.slot.children;
    const items = <any[]>(this.observer.collectionKind & CollectionKind.indexed ? this.items : Array.from(this.items));
    const oldLength = visuals.length;
    const newLength = indexMap.length;
    if (newLength === 0) {
      if (oldLength === 0) {
        // if we had 0 items and still have 0 items, we don't need to do anything
        return;
      } else {
        // if we had >0 items and now have 0 items, just remove all and return
        this.slot.removeAll(true, true);
        return;
      }
    }

    // store the scopes of the current indices so we can reuse them for moved visuals
    const previousScopes = new Array<IScope>(oldLength);
    let i = 0;
    while (i < oldLength) {
      previousScopes[i] = visuals[i].$scope;
      i++;
    }

    if (oldLength < newLength) {
      this.addMissingVisuals(oldLength, newLength, visuals, items);
    } else if (newLength < oldLength) {
      this.removeSurplusVisuals(oldLength, newLength, visuals);
    }

    i = 0;
    while (i < newLength) {
      const visual = visuals[i];
      const previousIndex = indexMap[i];
      // renderState is set to -1 by addMissingVisuals, so we know we don't need to refresh bindings on those
      if (visual.renderState !== -1) {
        // for some reason we don't need to refresh bindings when an item hasn't changed index.. this feels weird though,
        // may need to investigate and try to break this with some well-placed oneTime bindings;
        // if it does break, we simply need to refreshBindings in the "else"
        if (previousIndex !== i) {
          if (previousIndex >= 0) {
            // item moved to another item's position; reuse the scope of the item at that position
            visual.$bind(BindingFlags.itemsMutation, previousScopes[previousIndex]);
          } else {
            // item is new; create a new scope
            const scope = createChildScope(this.scope.overrideContext, { [this.local]: items[i] });
            visual.$bind(BindingFlags.itemsMutation, scope);
          }
        }
      } else {
        // reset the renderState of newly added item (so we don't ignore it again next flush)
        visual.renderState = undefined;
      }
      i++;
    }
  };

  /**
   * Process an instance mutation (completely replace the visuals)
   * - called by the items setter
   */
  private handleInstanceMutation(items: Array<any> & { $observer: CollectionObserver }): void {
    items = this.observer.collectionKind & CollectionKind.indexed ? items : <any>Array.from(items);
    const visuals = <IVisual[]>this.slot.children;
    const oldLength = visuals.length;
    const newLength = items.length;
    if (newLength === 0) {
      if (oldLength === 0) {
        return;
      } else {
        this.slot.removeAll(true, true);
        return;
      }
    }

    if (oldLength < newLength) {
      this.addMissingVisuals(oldLength, newLength, visuals, items);
    } else if (newLength < oldLength) {
      this.removeSurplusVisuals(oldLength, newLength, visuals);
    }
    // up to this point the logic is identical to handleItemsMutation

    // this piece is also similar to handleItemsMutation, with the key difference that all items are considered "new" here
    // (maybe that's not true and some further optimization is possible?)
    let i = 0;
    while (i < newLength) {
      const visual = visuals[i];
      if (visual.renderState !== -1) {
        // item is new; create a new scopes
        const scope = createChildScope(this.scope.overrideContext, { [this.local]: items[i] });
        visual.$bind(BindingFlags.instanceMutation, scope);
      } else {
        // reset the renderState of newly added item (so we don't ignore it again next flush)
        visual.renderState = undefined;
      }
      i++;
    }
    this.hasPendingInstanceMutation = false;
  }

  // addMissingVisuals and removeSurplusVisuals are simply to make sure that we have the same amount of visuals
  // as items, without necessarily checking if the correct item is added or if the visual being removed also corresponds
  // to an item that was removed, so here's a potential perf improvement for better reusing of scopes/bindings
  private addMissingVisuals(oldLength: number, newLength: number, visuals: IVisual[], items: any[]): void {
    // make sure we have a visual for every item
    visuals.length = newLength;
    const factory = this.factory;
    let i = oldLength;
    while (i < newLength) {
      const visual = visuals[i] = factory.create();
      this.addVisual(visual, items[i]);
      // set this field so we know we don't need to update the bindings down below
      visual.renderState = -1;
      i++;
    }
  }

  private removeSurplusVisuals(oldLength: number, newLength: number, visuals: IVisual[],): void {
    // remove any surplus visuals
    const isAttached = this.slot['$isAttached'];
    let i = newLength;
    while (i < oldLength) {
      const visual = visuals[i];
      if (isAttached) {
        visual.$detach();
      }
      visual.tryReturnToCache();
      i++;
    }
    visuals.length = newLength;
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
