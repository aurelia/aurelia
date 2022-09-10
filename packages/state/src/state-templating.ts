import { camelCase } from '@aurelia/kernel';
import {
  ExpressionKind,
  ExpressionType,
  IExpressionParser,
  IObserverLocator,
  type IsBindingBehavior,
} from '@aurelia/runtime';
import {
  applyBindingBehavior,
  attributePattern,
  AttrSyntax,
  bindingCommand,
  CommandType,
  DefinitionType,
  IAttrMapper,
  IHydratableController,
  IPlatform,
  renderer,
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type IRenderer
} from '@aurelia/runtime-html';
import { IStore } from './interfaces';
import { StateBinding } from './state-binding';
import { StateDispatchBinding } from './state-dispatch-binding';

@attributePattern({ pattern: 'PART.state', symbols: '.' })
export class StateAttributePattern {
  public 'PART.state'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'state');
  }
}

@attributePattern({ pattern: 'PART.dispatch', symbols: '.' })
export class DispatchAttributePattern {
  public 'PART.dispatch'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'dispatch');
  }
}

@bindingCommand('state')
export class StateBindingCommand implements BindingCommandInstance {
  /** @internal */ protected static inject = [IAttrMapper];
  public readonly type: CommandType = CommandType.None;
  public get name(): string { return 'state'; }

  public constructor(
    /** @internal */ private readonly _attrMapper: IAttrMapper,
  ) {}

  public build(info: ICommandBuildInfo): IInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    if (info.bindable == null) {
      target = this._attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      target = info.bindable.property;
    }
    return new StateBindingInstruction(value, target);
  }
}

@bindingCommand('dispatch')
export class DispatchBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType = CommandType.IgnoreAttr;
  public get name(): string { return 'dispatch'; }

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
    public expr: string | IsBindingBehavior,
  ) {}
}

@renderer('sb')
export class StateBindingInstructionRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IStore, IPlatform];
  public readonly target!: 'sb';

  public constructor(
    /** @internal */ private readonly _exprParser: IExpressionParser,
    /** @internal */ private readonly _observerLocator: IObserverLocator,
    /** @internal */ private readonly _stateContainer: IStore<object>,
    /** @internal */ private readonly p: IPlatform,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: object,
    instruction: StateBindingInstruction,
  ): void {
    const binding = new StateBinding(
      renderingCtrl.container,
      this._observerLocator,
      this.p.domWriteQueue,
      ensureExpression(this._exprParser, instruction.from, ExpressionType.IsFunction),
      target,
      instruction.to,
      this._stateContainer,
    );
    renderingCtrl.addBinding(binding);
  }
}

@renderer('sd')
export class DispatchBindingInstructionRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IStore];
  public readonly target!: 'sd';

  public constructor(
    /** @internal */ private readonly _exprParser: IExpressionParser,
    /** @internal */ private readonly _stateContainer: IStore<object>,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: DispatchBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.expr, ExpressionType.IsProperty);
    const binding = new StateDispatchBinding(
      renderingCtrl.container,
      expr,
      target,
      instruction.from,
      this._stateContainer,
    );
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}
