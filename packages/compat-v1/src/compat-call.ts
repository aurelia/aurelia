import { camelCase, IIndexable, type IContainer } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, ExpressionType, IAccessor, IAstEvaluator, IBinding, IConnectableBinding, IExpressionParser, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';
import { bindingCommand, BindingCommandInstance, CommandType, ICommandBuildInfo, IController, IHydratableController, IInstruction, IRenderer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited, renderer } from '@aurelia/runtime-html';
import { ensureExpression } from './utilities';

import type { IServiceLocator } from '@aurelia/kernel';

const registeredSymbol = Symbol('.call');

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export const callSyntax = {
  register(container: IContainer) {
    /* istanbul ignore next */
    if (!(container as unknown as IIndexable)[registeredSymbol]) {
      /* istanbul ignore next */
      (container as unknown as IIndexable)[registeredSymbol] = true;
      container.register(
        CallBindingCommand,
        CallBindingRenderer,
      );
    }
  }
};

const instructionType = 'rh';

export class CallBindingInstruction {
  public readonly type = instructionType;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) { }
}

@bindingCommand('call')
export class CallBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new CallBindingInstruction(
      exprParser.parse(info.attr.rawValue, (ExpressionType.IsProperty | ExpressionType.IsFunction) as ExpressionType) as IsBindingBehavior,
      target
    );
  }
}

@renderer(instructionType)
export class CallBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;

  public target!: typeof instructionType;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: CallBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty | ExpressionType.IsFunction);
    renderingCtrl.addBinding(new CallBinding(renderingCtrl.container, this._observerLocator, expr, getTarget(target), instruction.to));
  }
}

function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { viewModel?: object }).viewModel != null) {
    return (potentialTarget as { viewModel: object }).viewModel;
  }
  return potentialTarget;
}

/**
 * A binding for handling .call syntax
 */
export interface CallBinding extends IAstEvaluator, IConnectableBinding { }
export class CallBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope;

  public targetObserver: IAccessor;

  /** @internal */
  public l: IServiceLocator;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsBindingBehavior,
    public readonly target: object,
    public readonly targetProperty: string,
  ) {
    this.l = locator;
    this.targetObserver = observerLocator.getAccessor(target, targetProperty);
  }

  public callSource(args: object): unknown {
    const overrideContext = this._scope!.overrideContext;
    overrideContext.$event = args;
    const result = astEvaluate(this.ast, this._scope!, this, null);
    Reflect.deleteProperty(overrideContext, '$event');

    return result;
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
        return;
      }

      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    this.targetObserver.setValue(($args: object) => this.callSource($args), this.target, this.targetProperty);
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.targetObserver.setValue(null, this.target, this.targetProperty);
  }
}

mixinUseScope(CallBinding);
mixingBindingLimited(CallBinding, () => 'callSource');
mixinAstEvaluator(true)(CallBinding);
