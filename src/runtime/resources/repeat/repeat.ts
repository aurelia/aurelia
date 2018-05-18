import { customAttribute, templateController, bindable } from "../../decorators";
import { IVisualFactory, IVisual } from "../../templating/view-engine";
import { IRenderSlot } from "../../templating/render-slot";
import { IContainer, inject } from "../../di";
import { IRepeatStrategyRegistry } from "./repeat-strategy-registry";
import { ITargetedInstruction, IHydrateTemplateController } from "../../templating/instructions";
import { IRepeater } from "./repeater";
import { IExpression, BindingBehavior, ValueConverter } from "../../binding/ast";
import { IScope, sourceContext } from "../../binding/binding-context";
import { IRepeatStrategy } from "./repeat-strategy";
import { TaskQueue } from "../../../debug/task-queue";
import { IBindingCollectionObserver } from "../../binding/observation";
import { Binding } from "../../binding/binding";
import { BindingMode } from "../../binding/binding-mode";
import { IViewOwner } from "../../templating/view";

const oneTime = BindingMode.oneTime;

function updateOneTimeBinding(binding) {
  if (isCallableOneTimeBinding(binding)) {
    binding.call(sourceContext);
  } else if (binding.updateOneTimeBindings) {
    binding.updateOneTimeBindings();
  }
}

function isOneTime(expression: IExpression) {
  while (expression instanceof BindingBehavior) {
    if (expression.name === 'oneTime') {
      return true;
    }
    
    expression = expression.expression;
  }

  return false;
}

function isCallableOneTimeBinding(binding): binding is Binding {
  return binding.call && binding.mode === oneTime;
}

function unwrapExpression(expression: IExpression) {
  let unwrapped = false;
  
  while (expression instanceof BindingBehavior) {
    expression = expression.expression;
  }

  while (expression instanceof ValueConverter) {
    expression = expression.expression;
    unwrapped = true;
  }

  return unwrapped ? expression : null;
}

function getBinding(owner: IViewOwner, behavior: any, propertyName: string): Binding {
  return (<any[]>owner.$bindable)
    .find(x => x.target === behavior && x.targetProperty === propertyName);
}

@customAttribute('repeat')
@templateController
@inject(IViewOwner, IVisualFactory, IRenderSlot, IContainer, IRepeatStrategyRegistry)
export class Repeat implements IRepeater {
  private ignoreMutation = false;
  private sourceExpression: IExpression;
  private isOneTime: boolean;
  private strategy: IRepeatStrategy;
  private collectionObserver: IBindingCollectionObserver;
  private callContext: string;
  
  public visualsRequireLifecycle: boolean;
  public scope: IScope;

  /**
  * List of items to bind the repeater to.
  *
  * @property items
  */
  @bindable public items: any;

  /**
   * Local variable which gets assigned on each iteration.
   *
   * @property local
   */
  @bindable public local: string;

  /**
   * Key when iterating over Maps.
   *
   * @property key
   */
  @bindable public key: any;

  /**
   * Value when iterating over Maps.
   *
   * @property value
   */
  @bindable public value: any;

  // TODO: the template compiler should extract this binding for all template controllers
  @bindable public matcher: ((a: any, b: any) => boolean) | null;

  constructor(
    private owner: IViewOwner,
    private viewFactory: IVisualFactory, 
    private viewSlot: IRenderSlot, 
    private container: IContainer,
    private strategyRegistry: IRepeatStrategyRegistry
  ) {
    this.local = 'item';
    this.key = 'key';
    this.value = 'value';
    this.visualsRequireLifecycle = true; // TODO: the template compiler should figure this out
  }

  call(context: string, changes: any) {
    this[context](this.items, changes);
  }

  bound(scope: IScope) {
    this.sourceExpression = getBinding(this.owner, this, 'items').sourceExpression;
    this.isOneTime = isOneTime(this.sourceExpression);
    this.scope = scope;
    this.itemsChanged();
  }

  unbound() {
    this.scope = null;
    this.items = null;
    this.viewSlot.removeAll(true, true);
    this.unsubscribeCollection();
  }

  private unsubscribeCollection() {
    if (this.collectionObserver) {
      this.collectionObserver.unsubscribe(this.callContext, this);
      this.collectionObserver = null;
      this.callContext = null;
    }
  }

  itemsChanged() {
    this.unsubscribeCollection();

    // still bound?
    if (!this.scope) {
      return;
    }

    let items = this.items;
    this.strategy = this.strategyRegistry.getStrategyForItems(items);

    if (!this.strategy) {
      throw new Error(`Value for '${this.sourceExpression}' is non-repeatable`);
    }

    if (!this.isOneTime && !this.observeInnerCollection()) {
      this.observeCollection();
    }

    this.strategy.instanceChanged(this, items);
  }

  private getInnerCollection() {
    let expression = unwrapExpression(this.sourceExpression);

    if (!expression) {
      return null;
    }

    return expression.evaluate(this.scope, this.container);
  }

  handleCollectionMutated(collection, changes) {
    if (!this.collectionObserver) {
      return;
    }

    this.strategy.instanceMutated(this, collection, changes);
  }

  handleInnerCollectionMutated(collection, changes) {
    if (!this.collectionObserver) {
      return;
    }

    // guard against source expressions that have observable side-effects that could
    // cause an infinite loop- eg a value converter that mutates the source array.
    if (this.ignoreMutation) {
      return;
    }

    this.ignoreMutation = true;
    let newItems = this.sourceExpression.evaluate(this.scope, this.container);

    TaskQueue.queueMicroTask(() => this.ignoreMutation = false);

    // call itemsChanged...
    if (newItems === this.items) {
      // call itemsChanged directly.
      this.itemsChanged();
    } else {
      // call itemsChanged indirectly by assigning the new collection value to
      // the items property, which will trigger the self-subscriber to call itemsChanged.
      this.items = newItems;
    }
  }

  private observeInnerCollection() {
    let items = this.getInnerCollection();
    let strategy = this.strategyRegistry.getStrategyForItems(items);
    
    if (!strategy) {
      return false;
    }
    
    this.collectionObserver = strategy.getCollectionObserver(items);
    
    if (!this.collectionObserver) {
      return false;
    }

    this.callContext = 'handleInnerCollectionMutated';
    this.collectionObserver.subscribe(this.callContext, this);

    return true;
  }

  private observeCollection() {
    let items = this.items;
    this.collectionObserver = this.strategy.getCollectionObserver(items);

    if (this.collectionObserver) {
      this.callContext = 'handleCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
    }
  }

  visualCount() { 
    return this.viewSlot.children.length; 
  }
  
  visuals() { 
    return this.viewSlot.children; 
  }
  
  visualAt(index) { 
    return this.viewSlot.children[index]; 
  }

  addVisualWithScope(scope: IScope) {
    let visual = this.viewFactory.create();
    visual.$bind(scope);
    this.viewSlot.add(visual);
  }

  insertVisualWithScope(index, scope: IScope) {
    let visual = this.viewFactory.create();
    visual.$bind(scope);
    this.viewSlot.insert(index, visual);
  }

  moveVisual(sourceIndex, targetIndex) {
    this.viewSlot.move(sourceIndex, targetIndex);
  }

  removeAllVisuals(returnToCache, skipAnimation) {
    return this.viewSlot.removeAll(returnToCache, skipAnimation);
  }

  removeVisuals(viewsToRemove, returnToCache, skipAnimation) {
    return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
  }

  removeVisual(index, returnToCache, skipAnimation) {
    return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
  }

  updateBindings(visual: IVisual) {
    const bindables = visual.$bindable;
    let j = visual.$bindable.length;

    while (j--) {
      updateOneTimeBinding(bindables[j]);
    }
  }
}
