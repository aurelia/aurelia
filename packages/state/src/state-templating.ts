import { camelCase } from '@aurelia/kernel';
import { ExpressionType, IExpressionParser, IObserverLocator, IsBindingBehavior } from '@aurelia/runtime';
import {
  attributePattern,
  AttrSyntax,
  bindingCommand,
  CommandType,
  DefinitionType,
  IAttrMapper,
  IHydratableController,
  renderer,
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type IRenderer
} from '@aurelia/runtime-html';
import { IStateContainer } from './state';
import { StateBinding } from './state-binding';

@attributePattern({ pattern: 'PART.state', symbols: '.' })
export class StateAttributePattern {
  public 'PART.state'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'state');
  }
}

@bindingCommand('state')
export class StateBindingCommand implements BindingCommandInstance {
  /** @internal */ protected static inject = [IAttrMapper];
  public readonly type: CommandType = CommandType.None;
  public get name(): string { return 'state'; }

  public constructor(
    private readonly _attrMapper: IAttrMapper,
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

export class StateBindingInstruction {
  public readonly type = 'sb';
  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

@renderer('sb')
export class StateBindingInstructionRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IStateContainer];
  public readonly target = 'sb';

  public constructor(
    private readonly _exprParser: IExpressionParser,
    private readonly _observerLocator: IObserverLocator,
    private readonly _stateContainer: IStateContainer<object>,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: object,
    instruction: StateBindingInstruction,
  ): void {
    const binding = new StateBinding(
      renderingCtrl.container,
      this._stateContainer,
      this._observerLocator,
      ensureExpression(this._exprParser, instruction.from, ExpressionType.IsFunction),
      target,
      instruction.to
    );
    renderingCtrl.addBinding(binding);
  }
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}
