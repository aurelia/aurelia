import { camelCase, type IContainer, type IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';
import {
  IAccessor,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  astBind,
  astEvaluate,
  astUnbind,
  type IAstEvaluator,
  Scope,
} from '@aurelia/runtime';
import {
  IController,
  IHydratableController,
  IRenderer,
  mixinAstEvaluator,
  mixinUseScope,
  mixingBindingLimited,
  renderer,
  IPlatform,
  type IBinding,
} from '@aurelia/runtime-html';
import {
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type BindingCommandStaticAuDefinition,
} from '@aurelia/template-compiler';
import { ensureExpression, etIsFunction } from './utilities';

const callRegisteredContainer = new WeakSet<IContainer>();

export const callSyntax = {
  register(container: IContainer) {
    if (!callRegisteredContainer.has(container)) {
      callRegisteredContainer.add(container);
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

export class CallBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: 'call',
  };

  public get ignoreAttr() { return false; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.name;
    return new CallBindingInstruction(
      exprParser.parse(info.attr.rawValue, etIsFunction),
      target
    );
  }
}

export const CallBindingRenderer = /*@__PURE__*/ renderer(class CallBindingRenderer implements IRenderer {
  public readonly target = instructionType;

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: CallBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    const expr = ensureExpression(exprParser, instruction.from, etIsFunction);
    renderingCtrl.addBinding(new CallBinding(renderingCtrl.container, observerLocator, expr, getTarget(target), instruction.to));
  }
}, null!);

function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { viewModel?: object }).viewModel != null) {
    return (potentialTarget as { viewModel: object }).viewModel;
  }
  return potentialTarget;
}

/**
 * A binding for handling .call syntax
 */
export interface CallBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class CallBinding implements IBinding {
  static {
    mixinUseScope(CallBinding);
    mixingBindingLimited(CallBinding, () => 'callSource');
    mixinAstEvaluator(CallBinding);
  }

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
