import { AccessScopeExpression, IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';
import { IServiceLocator, Key, emptyArray } from '@aurelia/kernel';
import { TaskQueue } from '@aurelia/platform';
import { IObserverLocator, IObserverLocatorBasedConnectable, connectable } from '@aurelia/runtime';
import { BindingMode, IInstruction, ITemplateCompiler, InstructionType, SpreadElementPropBindingInstruction } from '@aurelia/template-compiler';
import { IAstEvaluator, astBind, astEvaluate } from '../ast.eval';
import { ErrorNames, createMappedError } from '../errors';
import { IPlatform } from '../platform';
import { IHasController, } from '../renderer';
import { CustomElementDefinition, findElementControllerFor } from '../resources/custom-element';
import { IController, ICustomElementController, IHydratableController, IHydrationContext, vmkCa } from '../templating/controller';
import { IRendering } from '../templating/rendering';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { IBinding, IBindingController } from './interfaces-bindings';
import { PropertyBinding } from './property-binding';
import { Scope } from './scope';

/**
 * The public methods of this binding emulates the necessary of an IHydratableController,
 * which mainly is the addBinding method since a spread binding
 * is a surrogate of other bindings created from the captured attrs
 */
export class SpreadBinding implements IBinding, IHasController {

  /**
   * Create a list of SpreadBinding by searching for captured attributes in HydrationContexts
   * from a container
   */
  public static create(
    hydrationContext: IHydrationContext,
    target: HTMLElement,
    /**
     * To be supplied to the compilation of spread' attrs
     * Sometimes in dynamic compilation scenario, this could be used to influence
     * what attributes can be compiled into (i.e bindable vs normal)
     */
    targetDef: CustomElementDefinition | undefined,
    rendering: IRendering,
    compiler: ITemplateCompiler,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): SpreadBinding[] {
    const bindings: SpreadBinding[] = [];
    const renderers = rendering.renderers;
    const getHydrationContext = (ancestor: number) => {
      let currentLevel = ancestor;
      let currentContext: IHydrationContext | undefined = hydrationContext;
      while (currentContext != null && currentLevel > 0) {
        currentContext = currentContext.parent;
        --currentLevel;
      }
      if (currentContext == null) {
        throw createMappedError(ErrorNames.no_spread_scope_context_found);
      }
      return currentContext as IHydrationContext<object>;
    };
    const renderSpreadInstruction = (ancestor: number) => {
      const context = getHydrationContext(ancestor);
      const spreadBinding = new SpreadBinding(context) as SpreadBinding & IHydratableController;
      const instructions = compiler.compileSpread(
        context.controller.definition,
        context.instruction?.captures ?? emptyArray,
        context.controller.container,
        target,
        targetDef
      );
      let inst: IInstruction;
      for (inst of instructions) {
        switch (inst.type) {
          case InstructionType.spreadBinding:
            renderSpreadInstruction(ancestor + 1);
            break;
          case InstructionType.spreadElementProp:
            renderers[(inst as SpreadElementPropBindingInstruction).instruction.type].render(
              spreadBinding,
              findElementControllerFor(target),
              (inst as SpreadElementPropBindingInstruction).instruction,
              platform,
              exprParser,
              observerLocator,
            );
            break;
          default:
            renderers[inst.type].render(spreadBinding, target, inst, platform, exprParser, observerLocator);
        }
      }
      bindings.push(spreadBinding);
    };
    renderSpreadInstruction(0);
    return bindings;
  }

  public scope?: Scope | undefined;
  public isBound: boolean = false;
  public readonly locator: IServiceLocator;

  public readonly $controller: ICustomElementController;

  public get container() {
    return this.locator;
  }

  public get definition(): CustomElementDefinition {
    return this.$controller.definition;
  }

  public get state() {
    return this.$controller.state;
  }

  /** @internal */ private readonly _innerBindings: IBinding[] = [];
  /** @internal */ private readonly _hydrationContext: IHydrationContext<object>;

  public constructor(
    hydrationContext: IHydrationContext<object>,
  ) {
    this.locator = (this.$controller = (this._hydrationContext = hydrationContext).controller).container;
  }

  public get(key: Key) {
    return this.locator.get(key);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = true;
    const innerScope = this.scope = this._hydrationContext.controller.scope.parent ?? void 0;
    if (innerScope == null) {
      throw createMappedError(ErrorNames.no_spread_scope_context_found);
    }

    this._innerBindings.forEach(b => b.bind(innerScope));
  }

  public unbind(): void {
    this._innerBindings.forEach(b => b.unbind());
    this.isBound = false;
  }

  public addBinding(binding: IBinding) {
    this._innerBindings.push(binding);
  }

  public addChild(controller: IController) {
    if (controller.vmKind !== vmkCa) {
      throw createMappedError(ErrorNames.no_spread_template_controller);
    }
    this.$controller.addChild(controller);
  }
}

export interface SpreadValueBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}
export class SpreadValueBinding implements IBinding {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(SpreadValueBinding);
    mixingBindingLimited(SpreadValueBinding, () => 'updateTarget');
    connectable(SpreadValueBinding, null!);
    mixinAstEvaluator(true, false)(SpreadValueBinding);
  });

  public isBound = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  private readonly _taskQueue: TaskQueue;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  private readonly _controller: IBindingController;
  private readonly _bindings: PropertyBinding[] = [];
  private readonly _bindingCache: Record<PropertyKey, PropertyBinding> = {};

  public constructor(
    controller: IBindingController,
    public target: object,
    public targetKeys: string[],
    public ast: IsBindingBehavior,
    ol: IObserverLocator,
    l: IServiceLocator,
    taskQueue: TaskQueue,
  ) {
    this._controller = controller;
    this.oL = ol;
    this.l = l;
    this._taskQueue = taskQueue;
  }

  public updateTarget(): void {
    // do nothing
    this.obs.version++;
    let newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      this
    ) as Record<PropertyKey, unknown> | null;
    this.obs.clear();

    if (newValue == null) {
      // dev logging
      newValue = {};
    } else if (!(newValue instanceof Object)) {
      // dev logging
      newValue = {};
    }

    this.targetKeys.forEach(key => {
      let binding = this._bindingCache[key];
      if (key in newValue) {
        if (binding == null) {
          binding = this._bindingCache[key] = new PropertyBinding(
            this._controller,
            this.l,
            this.oL,
            this._taskQueue,
            new AccessScopeExpression(key, 0),
            this.target,
            key,
            BindingMode.toView
          );
        }
        binding.bind(Scope.fromParent(this._scope!, newValue));
        this._bindings.push(binding);
      }
    });
  }

  public handleChange(): void {
    /* istanbul ignore next */
    if (!this.isBound) {
      return;
    }
    this.updateTarget();
  }

  public handleCollectionChange(): void {
    /* istanbul ignore next */
    if (!this.isBound) {
      return;
    }
    this.updateTarget();
  }

  public bind(scope: Scope) {
    /* istanbul ignore next */
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this._scope = scope;

    astBind(this.ast, scope, this);

    let value = astEvaluate(this.ast, scope, this, this) as Record<string, unknown> | null;

    if (value == null) {
      // dev logging
      value = {};
    } else if (!(value instanceof Object)) {
      // dev logging
      value = {};
    }

    this.targetKeys.forEach(key => {
      let binding = this._bindingCache[key];
      if (key in value) {
        if (binding == null) {
          binding = this._bindingCache[key] = new PropertyBinding(
            this._controller,
            this.l,
            this.oL,
            this._taskQueue,
            new AccessScopeExpression(key, 0),
            this.target,
            key,
            BindingMode.toView
          );
        }
        binding.bind(Scope.fromParent(scope, value));
        this._bindings.push(binding);
      }
    });
  }

  public unbind(): void {
    /* istanbul ignore next */
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._scope = void 0;
    this._bindings.forEach(b => b.unbind());
    this._bindings.length = 0;
  }
}
