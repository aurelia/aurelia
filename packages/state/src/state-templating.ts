import { camelCase, resolve } from '@aurelia/kernel';
import { IExpressionParser, ExpressionType, type IsBindingBehavior } from '@aurelia/runtime';
import {
  IObserverLocator,
} from '@aurelia/runtime';
import {
  attributePattern,
  AttrSyntax,
  IAttrMapper,
  IHydratableController,
  IPlatform,
  renderer,
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type IRenderer,
  BindingCommandStaticAuDefinition
} from '@aurelia/runtime-html';
import { IStore } from './interfaces';
import { StateBinding } from './state-binding';
import { StateDispatchBinding } from './state-dispatch-binding';

@attributePattern({ pattern: 'PART.state', symbols: '.' })
export class StateAttributePattern {
  public 'PART.state'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'state');
  }
}

@attributePattern({ pattern: 'PART.dispatch', symbols: '.' })
export class DispatchAttributePattern {
  public 'PART.dispatch'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'dispatch');
  }
}

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
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.kind === 'element') {
        value = camelCase(target);
      }
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

@renderer('sb')
export class StateBindingInstructionRenderer implements IRenderer {
  public readonly target!: 'sb';

  /** @internal */ private readonly _stateContainer = resolve(IStore);

  public render(
    renderingCtrl: IHydratableController,
    target: object,
    instruction: StateBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new StateBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, 'IsFunction'),
      target,
      instruction.to,
      this._stateContainer,
    ));
  }
}

@renderer('sd')
export class DispatchBindingInstructionRenderer implements IRenderer {
  public readonly target!: 'sd';
  /** @internal */ private readonly _stateContainer = resolve(IStore);

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
    ));
  }
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}
