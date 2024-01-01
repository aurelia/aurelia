import { IServiceLocator, Key, emptyArray } from '@aurelia/kernel';
import { IBinding, IExpressionParser, IObserverLocator, Scope } from '@aurelia/runtime';
import { createMappedError, ErrorNames } from '../errors';
import { CustomElementDefinition, findElementControllerFor } from '../resources/custom-element';
import { ICustomElementController, IHydrationContext, IController, IHydratableController } from '../templating/controller';
import { IHasController, IInstruction, ITemplateCompiler, InstructionType, SpreadElementPropBindingInstruction } from '../renderer';
import { IRendering } from '../templating/rendering';
import { IPlatform } from '../platform';

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
            renderers[(inst as SpreadElementPropBindingInstruction).instructions.type].render(
              spreadBinding,
              findElementControllerFor(target),
              (inst as SpreadElementPropBindingInstruction).instructions,
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

  public constructor(
      /** @internal */ private readonly _hydrationContext: IHydrationContext<object>,
  ) {
    this.$controller = _hydrationContext.controller;
    this.locator = this.$controller.container;
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
    if (controller.vmKind !== 'customAttribute') {
      throw createMappedError(ErrorNames.no_spread_template_controller);
    }
    this.$controller.addChild(controller);
  }
}
