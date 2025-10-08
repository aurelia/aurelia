import { camelCase, resolve } from '@aurelia/kernel';
import {
  BindingBehaviorExpression,
  ExpressionType,
  IExpressionParser,
  PrimitiveLiteralExpression,
  type IsAssign,
  type IsBindingBehavior,
} from '@aurelia/expression-parser';
import {
  IObserverLocator,
} from '@aurelia/runtime';
import {
  IHydratableController,
  IPlatform,
  renderer,
  type IRenderer,
} from '@aurelia/runtime-html';
import {
  IAttrMapper,
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type BindingCommandStaticAuDefinition
} from '@aurelia/template-compiler';
import { IStoreRegistry } from './interfaces';
import { StateBinding } from './state-binding';
import { StateDispatchBinding } from './state-dispatch-binding';

export class StateBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: 'state',
  };

  public get ignoreAttr() { return false; }

  public build(info: ICommandBuildInfo, parser: IExpressionParser, attrMapper: IAttrMapper): IInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    value = value === '' ? camelCase(target) : value;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      target = info.bindable.name;
    }
    return new StateBindingInstruction(value, target);
  }
}

export class DispatchBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: 'dispatch',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo): IInstruction {
    const attr = info.attr;
    const value = attr.rawValue;
    return new DispatchBindingInstruction(attr.target, value);
  }
}

export class StateBindingInstruction {
  public readonly type = 'sb';
  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public store?: StoreInstructionArg,
  ) {}
}

type StoreInstructionArg = string | IsAssign;

export class DispatchBindingInstruction {
  public readonly type = 'sd';
  public constructor(
    public from: string,
    public ast: string | IsBindingBehavior,
    public store?: StoreInstructionArg,
  ) {}
}

export const StateBindingInstructionRenderer = /*@__PURE__*/ renderer(class StateBindingInstructionRenderer implements IRenderer {
  public readonly target = 'sb';
  /** @internal */ public readonly _storeRegistry = resolve(IStoreRegistry);

  public render(
    renderingCtrl: IHydratableController,
    target: object,
    instruction: StateBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    let ast = ensureExpression(exprParser, instruction.from, 'IsFunction');
    const { expression, store } = extractStoreLocator(ast);
    ast = expression;

    renderingCtrl.addBinding(new StateBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      ast,
      target,
      instruction.to,
      this._storeRegistry,
      store,
      renderingCtrl.strict ?? false,
    ));
  }
}, null!);

export const DispatchBindingInstructionRenderer = /*@__PURE__*/ renderer(class DispatchBindingInstructionRenderer implements IRenderer {
  public readonly target = 'sd';
  /** @internal */ public readonly _storeRegistry = resolve(IStoreRegistry);

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: DispatchBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    let expr = ensureExpression(exprParser, instruction.ast, 'IsProperty');
    const { expression, store } = extractStoreLocator(expr);
    expr = expression;
    renderingCtrl.addBinding(new StateDispatchBinding(
      renderingCtrl.container,
      expr,
      target,
      instruction.from,
      this._storeRegistry,
      store,
      renderingCtrl.strict ?? false,
    ));
  }
}, null!);

function ensureExpression(parser: IExpressionParser, srcOrExpr: string | IsBindingBehavior, expressionType: ExpressionType): IsBindingBehavior {
  if (typeof srcOrExpr === 'string') {
    // parser.parse always returns an AST; assertion narrows to the binding-behavior shape we consume downstream
    return parser.parse(srcOrExpr, expressionType) as IsBindingBehavior;
  }
  return srcOrExpr;
}

function extractStoreLocator(expression: IsBindingBehavior): { expression: IsBindingBehavior; store?: StoreInstructionArg } {
  const behaviors: BindingBehaviorExpression[] = [];
  let leaf: IsBindingBehavior = expression;

  while (leaf instanceof BindingBehaviorExpression) {
    behaviors.push(leaf);
    // parser AST narrows expression generically; assert to align with binding behavior traversal
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    leaf = leaf.expression as IsBindingBehavior;
  }

  let storeArg: StoreInstructionArg | undefined;
  let rebuilt: IsBindingBehavior = leaf;

  for (let i = behaviors.length - 1; i >= 0; --i) {
    const behavior = behaviors[i];
    if (storeArg === undefined && behavior.name === 'store') {
      const arg = behavior.args[0];
      if (arg == null) {
        throw new Error('The "store" binding behavior requires a store locator argument.');
      }
      storeArg = arg instanceof PrimitiveLiteralExpression && typeof arg.value === 'string'
        ? arg.value
        : arg;
      continue;
    }

    rebuilt = new BindingBehaviorExpression(rebuilt, behavior.name, behavior.args);
  }

  return { expression: rebuilt, store: storeArg };
}
