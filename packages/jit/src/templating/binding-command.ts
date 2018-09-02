import { Constructable, IContainer, Immutable, Registration, Writable } from '@aurelia/kernel';
import { BindingMode, BindingType, ICustomAttributeSource, IExpressionParser, INode, IResourceDescriptions, IResourceKind, IResourceType, ITemplateSource, TargetedInstruction } from '@aurelia/runtime';
import { CallBindingInstruction, CaptureBindingInstruction, DelegateBindingInstruction, FromViewBindingInstruction, HydrateElementInstruction, HydrateTemplateController, OneTimeBindingInstruction, SetPropertyInstruction, ToViewBindingInstruction, TriggerBindingInstruction, TwoWayBindingInstruction } from './template-compiler';

export interface IBindingCommandSource {
  name: string;
}

export interface IBindingCommand {
  compile(
    attr: { name: string; value: string },
    node: INode,
    targetName: string,
    resources: IResourceDescriptions,
    attributeDefinition: Immutable<Required<ICustomAttributeSource>> | null,
    elementDefinition: Immutable<Required<ITemplateSource>> | null,
    elementInstruction?: HydrateElementInstruction
  ): TargetedInstruction;
}

export type IBindingCommandType = IResourceType<IBindingCommandSource, IBindingCommand>;

export function bindingCommand(nameOrSource: string | IBindingCommandSource) {
  return function<T extends Constructable>(target: T) {
    return BindingCommandResource.define(nameOrSource, target);
  };
}

export const BindingCommandResource: IResourceKind<IBindingCommandSource, IBindingCommandType> = {
  name: 'binding-command',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IBindingCommandType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IBindingCommandSource, ctor: T): T & IBindingCommandType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IBindingCommandType = ctor as any;

    (Type as Writable<IBindingCommandType>).kind = BindingCommandResource;
    (Type as Writable<IBindingCommandType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    return Type;
  }
};

@bindingCommand('bind')
export class DefaultBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}

  public compile(
    attr: { name: string; value: string },
    node: INode,
    targetName: string,
    resources: IResourceDescriptions,
    attributeDefinition: Immutable<Required<ICustomAttributeSource>> | null,
    elementDefinition: Immutable<Required<ITemplateSource>> | null
  ): TargetedInstruction {
    let mode = BindingMode.toView;
    if (elementDefinition) {
      const bindable = elementDefinition.bindables[targetName];
      if (bindable && bindable.mode && bindable.mode !== BindingMode.default) {
        mode = bindable.mode;
      }
    }
    switch (mode) {
      case BindingMode.oneTime:
        return new OneTimeBindingInstruction(this.parser.parse(attr.value, BindingType.OneTimeCommand), targetName);
      case BindingMode.toView:
        return new ToViewBindingInstruction(this.parser.parse(attr.value, BindingType.OneTimeCommand), targetName);
      case BindingMode.fromView:
        return new FromViewBindingInstruction(this.parser.parse(attr.value, BindingType.OneTimeCommand), targetName);
      case BindingMode.twoWay:
        return new TwoWayBindingInstruction(this.parser.parse(attr.value, BindingType.OneTimeCommand), targetName);
    }
  }
}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new OneTimeBindingInstruction(this.parser.parse(attr.value, BindingType.OneTimeCommand), targetName);
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new ToViewBindingInstruction(this.parser.parse(attr.value, BindingType.ToViewCommand), targetName);
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new FromViewBindingInstruction(this.parser.parse(attr.value, BindingType.FromViewCommand), targetName);
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new TwoWayBindingInstruction(this.parser.parse(attr.value, BindingType.TwoWayCommand), targetName);
  }
}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new TriggerBindingInstruction(this.parser.parse(attr.value, BindingType.TriggerCommand), targetName);
  }
}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new DelegateBindingInstruction(this.parser.parse(attr.value, BindingType.DelegateCommand), targetName);
  }
}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new CaptureBindingInstruction(this.parser.parse(attr.value, BindingType.CaptureCommand), targetName);
  }
}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    return new CallBindingInstruction(this.parser.parse(attr.value, BindingType.CallCommand), targetName);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(attr: { name: string; value: string }, node: INode, targetName: string): TargetedInstruction {
    const src: ITemplateSource = {
      templateOrNode: node,
      instructions: []
    };
    return new HydrateTemplateController(src, targetName, [
      new ToViewBindingInstruction(this.parser.parse(attr.value, BindingType.ForCommand), 'items'),
      new SetPropertyInstruction('item', 'local')
    ]);
  }
}
