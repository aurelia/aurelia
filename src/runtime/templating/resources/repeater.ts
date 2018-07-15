import { Collection, CollectionObserver, CollectionKind } from './../../binding/observation/collection-observer';
import { ICustomAttributeSource, CustomAttributeResource } from '../custom-attribute';
import { AttachLifecycle, DetachLifecycle } from '../../templating/lifecycle';
import { IRuntimeBehavior, RuntimeBehavior } from '../../templating/runtime-behavior';
import { IRenderingEngine } from '../../templating/rendering-engine';
import { PLATFORM } from '../../../kernel/platform';
import { IRepeater } from './repeat/repeater';
import { IContainer, inject, Registration } from '../../../kernel/di';
import { ArrayObserver, getArrayObserver } from '../../binding/observation/array-observer';
import { ITaskQueue } from '../../task-queue';
import { IRenderSlot } from '../../templating/render-slot';
import { IViewOwner } from '../../templating/view';
import { IVisualFactory, IVisual } from '../../templating/visual';
import { IScope, IOverrideContext, sourceContext } from '../../binding/binding-context';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { Immutable } from '../../../kernel/interfaces';
import { IResourceKind, IResourceType } from '../../resource';
import { INode, DOM } from '../../dom';
import { BindingFlags } from '../../binding/binding-flags';
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

@inject(ITaskQueue, IRenderSlot, IViewOwner, IVisualFactory, IContainer)
export class Repeater<T extends Collection> implements Partial<IRepeater>, ICustomAttribute {
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
  public $bind(scope: IScope, flags: BindingFlags): void {      
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }
    this.$scope = scope
    this.$isBound = true;
    this.bound(scope, flags);
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
      // if already bound before, but currently unbound, then unbound will have taken care of unsubscribing
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
  public bound(scope: IScope, flags: BindingFlags): void {
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
    if (!(flags & (BindingFlags.instanceMutation | BindingFlags.itemsMutation))) {
      this.slot.removeAll(true, true);
    }
  }

  /**
   * Add a new visual to this instance with the specified item in the bindingContext
   */
  public addVisual(visual: IVisual, item: any): void {
    const scope = createChildScope(this.scope.overrideContext, { [this.local]: item });
    visual.$bind(scope, BindingFlags.none);
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
        return;
      } else {
        this.slot.removeAll(true, true);
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
      if (visual.renderState !== -1) {
        if (previousIndex !== i) {
          if (previousIndex >= 0) {
            // item moved to another item's position; reuse the scope of the item at that position
            visual.$bind(previousScopes[previousIndex], BindingFlags.itemsMutation);
          } else {
            // item is new; create a new scope
            const scope = createChildScope(this.scope.overrideContext, { [this.local]: items[i] });
            visual.$bind(scope, BindingFlags.itemsMutation);
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
      }
    }

    if (oldLength < newLength) {
      this.addMissingVisuals(oldLength, newLength, visuals, items);
    } else if (newLength < oldLength) {
      this.removeSurplusVisuals(oldLength, newLength, visuals);
    }

    let i = 0;
    while (i < newLength) {
      const visual = visuals[i];
      if (visual.renderState !== -1) {
        // item is new; create a new scopes
        const scope = createChildScope(this.scope.overrideContext, { [this.local]: items[i] });
        visual.$bind(scope, BindingFlags.instanceMutation);
      } else {
        // reset the renderState of newly added item (so we don't ignore it again next flush)
        visual.renderState = undefined;
      }
      i++;
    }
    this.hasPendingInstanceMutation = false;
  }

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
