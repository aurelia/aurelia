import { camelCase, resolve } from '@aurelia/kernel';
import { IExpressionParser, ExpressionType, type IsBindingBehavior } from '@aurelia/expression-parser';
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
import { IStore } from './interfaces';
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
    return new DispatchBindingInstruction(attr.target, attr.rawValue);
  }
}

export class StateBindingInstruction {
  public readonly type = 'sb';
  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DispatchBindingInstruction {
  public readonly type = 'sd';
  public constructor(
    public from: string,
    public ast: string | IsBindingBehavior,
  ) {}
}

export const StateBindingInstructionRenderer = /*@__PURE__*/ renderer(class StateBindingInstructionRenderer implements IRenderer {
  public readonly target = 'sb';

  /** @internal */ public readonly _stateContainer = resolve(IStore);

  public render(
    renderingCtrl: IHydratableController,
    target: object,
    instruction: StateBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    const ast = ensureExpression(exprParser, instruction.from, 'IsFunction');

    renderingCtrl.addBinding(new StateBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      ast,
      target,
      instruction.to,
      this._stateContainer,
      renderingCtrl.strict ?? false,
    ));
  }
}, null!);

export const DispatchBindingInstructionRenderer = /*@__PURE__*/ renderer(class DispatchBindingInstructionRenderer implements IRenderer {
  public readonly target = 'sd';
  /** @internal */ public readonly _stateContainer = resolve(IStore);

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: DispatchBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    const expr = ensureExpression(exprParser, instruction.ast, 'IsProperty');
    renderingCtrl.addBinding(new StateDispatchBinding(
      renderingCtrl.container,
      expr,
      target,
      instruction.from,
      this._stateContainer,
      renderingCtrl.strict ?? false,
    ));
  }
}, null!);

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}
