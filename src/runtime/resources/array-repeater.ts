import { IExpression } from './../binding/ast';
import { AttachLifecycle, DetachLifecycle } from '../templating/lifecycle';
import { IRuntimeBehavior, RuntimeBehavior } from '../templating/runtime-behavior';
import { IRenderingEngine } from '../templating/rendering-engine';
import { PLATFORM } from '../../kernel/platform';
import { IRepeater } from './repeat/repeater';
import { IContainer, inject, Registration } from '../../kernel/di';
import { ArrayObserver, IObservedArray } from '../binding/array-observer';
import { ITaskQueue } from '../task-queue';
import { IRenderSlot } from '../templating/render-slot';
import { IViewOwner } from '../templating/view';
import { IVisualFactory, IVisual } from '../templating/visual';
import { IScope, IOverrideContext } from '../binding/binding-context';
import { ForOfStatement } from '../binding/ast';
import { Binding } from '../binding/binding';
import { BindingMode } from '../binding/binding-mode';
import { Immutable } from '../../kernel/interfaces';
import { IAttributeSource } from '../templating/instructions';
import { Resource, IResourceKind } from '../resource';
import { ICustomAttribute } from '../templating/component';
import { INode } from '../dom';
import { BindingFlags } from '../binding/binding-flags';

@inject(ITaskQueue, IRenderSlot, IViewOwner, IVisualFactory, IContainer)
export class ArrayRepeater implements Partial<IRepeater>, ICustomAttribute {
  // attribute
  public static kind: IResourceKind = Resource.attribute;
  public static definition: Immutable<Required<IAttributeSource>> = {
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
    container.register(Registration.transient('custom-attribute:repeat', ArrayRepeater));
  }

  // attribute proto.$hydrate
  public $changeCallbacks: (() => void)[] = [];
  public $isAttached: boolean = false;
  public $isBound: boolean = false;
  public $scope: IScope = null;
  public $slot: IRenderSlot;
  public $behavior: IRuntimeBehavior = new (<any>RuntimeBehavior)();
  public $hydrate(renderingEngine: IRenderingEngine): void {
    let b: RuntimeBehavior = renderingEngine['behaviorLookup'].get(ArrayRepeater);
    if (!b) {
      b = new (<any>RuntimeBehavior)();
      b.bindables = ArrayRepeater.definition.bindables;
      b.hasCreated = b.hasAttaching = b.hasAttached = b.hasDetaching = b.hasDetached = b.hasCreateView = false;
      b.hasBound = b.hasUnbound = true;
      renderingEngine['behaviorLookup'].set(ArrayRepeater, b);
    }
    this.$behavior = b;
  }

  // attribute proto.$bind
  public $bind(scope: IScope): void {      
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.$scope = scope
    this.$isBound = true;
    this.bound(scope);
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
  public $unbind(): void {
    if (this.$isBound) {
      this.unbound();
      this.$isBound = false;
    }
  }

  private _items: IObservedArray;
  public set items(newValue: IObservedArray) {
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
        this.observer = newValue.$observer || new ArrayObserver(newValue);
        this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
        this.observer.subscribeBatched(this.handleBatchedItemsMutation);
      }
      this.tq.queueMicroTask(this);
    }
    this.hasPendingInstanceMutation = true;
  }
  public get items(): IObservedArray {
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
    this.observer = this.items = null;
    this.slot.removeAll(true, true);
  }

  handleImmediateItemsMutation = (): void => {
    if (this.isQueued === false) {
      this.isQueued = true;
      this.tq.queueMicroTask(this);
    }
  };

  handleBatchedItemsMutation = (indexMap: Array<number>): void => {
    const visuals = <IVisual[]>this.slot.children;
    const items = this.items;
    const visualCount = visuals.length;
    if (visualCount === 0 && items.length === 0) {
      return;
    }
    const previousVisuals = visuals.slice();
    const len = indexMap.length;
    let from = 0;
    let to = 0;
    while (to < len) {
      from = indexMap[to];
      if (from !== to) {
        if (from > -1) { // move
          visuals[to] = previousVisuals[from];
        } else { // add new (if it's not 0 or higher, it will always be -2 or lower)
          const visual = visuals[to] = this.factory.create();
          this.addVisual(visual, items[to]);
        }
      }
      to++;
    }
    visuals.length = len;
    const isAttached = this.slot['$isAttached'];
    to = 0;
    while (to < visualCount) {
      const visual = previousVisuals[to];
      if (visuals.indexOf(visual) === -1) {
        // remove
        if (isAttached) {
          visual.$detach();
        }
        visual.tryReturnToCache();
      }
      to++;
    }
    if (isAttached) {
      const container = this.container;
      to = 0;
      while (to < len) {
        // reorder the children by re-appending them to the parent
        // todo: identify+move only the ones that actually need to move
        const visual = visuals[to];
        const el = <Node>visual.$view.firstChild;
        el.parentNode.appendChild(el);

        updateBindingTargets(visual, container);
        to++;
      }
    }
  };

  addVisual(visual: IVisual, item: any): void {
    const scope = createChildScope(this.scope.overrideContext, { [this.local]: item });
    visual.$bind(scope);
    visual.parent = this.slot;
    visual.onRender = this.slot['addVisualCore'];
    if (this.slot['$isAttached']) {
      visual.$attach(this.slot['encapsulationSource']);
    }
  }

  handleInstanceMutation(items: any[]): void {
    this.slot.removeAll(true, true);
    const children = <IVisual[]>this.slot.children;
    let len = (children.length = items.length);
    let i = 0;
    while (i < len) {
      const visual = children[i] = this.factory.create();
      this.addVisual(visual, items[i]);
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

function updateBindingTargets(visual: IVisual, container: IContainer): void {
  const bindable = visual.$bindable;
  const bindableCount = bindable.length;
  const scope = visual.$scope;
  let i = 0;
  while (i < bindableCount) {
    const binding = bindable[i];
    const value = binding['sourceExpression'].evaluate(scope, container, BindingFlags.none);
    binding['updateTarget'](value);
    i++;
  }
}
