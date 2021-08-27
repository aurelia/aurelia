import { camelCase } from "@aurelia/kernel";
import {
  ExpressionType,
  IExpressionParser,
  IObserverLocator,
} from '@aurelia/runtime';
import {
  attributePattern,
  bindingCommand,
  CommandType,
  AttrSyntax,
  renderer,
  IAttrMapper,
  IPlatform,
  IComponentController,
  DefinitionType,
} from "@aurelia/runtime-html";
import { StreamAstVisitor } from './ast';
import { SubscribeBinding } from './subscribe-binding';
import type { AnyBindingExpression } from '@aurelia/runtime';
import type {
  ICommandBuildInfo,
  IHydratableController,
  IInstruction,
  BindingCommandInstance,
  IRenderer,
} from "@aurelia/runtime-html";

@attributePattern({ pattern: 'PART.subscribe', symbols: '.' })
export class SubscribeAttrPattern {
  public ['PART.subscribe'](rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'subscribe');
  }
}

@bindingCommand('subscribe')
export class SubscribeCommand implements BindingCommandInstance {
  /** @internal */ protected static inject = [IExpressionParser, IAttrMapper];
  public type: CommandType = CommandType.None;
  public get name() { return 'subscribe'; }
  public constructor(
    /** @internal */ private readonly _exprParser: IExpressionParser,
    /** @internal */ private readonly _attrMapper: IAttrMapper,
  ) {}

  public build(info: ICommandBuildInfo): IInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = info.attr.rawValue;
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
    return new SubscribeCommandInstruction(
      StreamAstVisitor.rewrite(this._exprParser.parse(value, ExpressionType.IsProperty)),
      target
    );
  }
}

export class SubscribeCommandInstruction implements IInstruction {
  public get type() { return 'si'; }
  public constructor(
    public readonly from: AnyBindingExpression,
    public readonly to: string,
  ) { }
}

@renderer('si')
export class SubscribeCommandInstructionRenderer implements IRenderer {
  /** @internal */ protected static inject = [IPlatform, IObserverLocator];

  public constructor(
    /** @internal */ private readonly _platform: IPlatform,
    /** @internal */ private readonly _observerLocator: IObserverLocator,
  ) { }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement | IComponentController,
    instruction: SubscribeCommandInstruction
  ): void {
    renderingCtrl.addBinding(new SubscribeBinding(
      instruction.from,
      'nodeType' in target ? target : target.viewModel,
      instruction.to,
      renderingCtrl.container,
      this._observerLocator,
      this._platform.domWriteQueue,
    ));
  }
}
