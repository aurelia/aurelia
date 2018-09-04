import { Constructable, IContainer, Immutable, Registration, Writable, PLATFORM } from '@aurelia/kernel';
import { BindingMode, BindingType, ICustomAttributeSource, IExpressionParser, INode, IResourceDescriptions, IResourceKind, IResourceType, ITemplateSource, TargetedInstruction, AttributeDefinition, ElementDefinition } from '@aurelia/runtime';
import { CallBindingInstruction, CaptureBindingInstruction, DelegateBindingInstruction, FromViewBindingInstruction, HydrateElementInstruction, HydrateTemplateController, OneTimeBindingInstruction, SetPropertyInstruction, ToViewBindingInstruction, TriggerBindingInstruction, TwoWayBindingInstruction, resolveTarget } from './template-compiler';

export interface IBindingCommandSource {
  name: string;
}

export interface IBindingCommand {
  compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction;
  handles(attribute: Immutable<Required<ICustomAttributeSource>> | null): boolean;
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
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource, target: null } : nameOrSource;
    const Type: T & IBindingCommandType = ctor as any;

    (Type as Writable<IBindingCommandType>).kind = BindingCommandResource;
    (Type as Writable<IBindingCommandType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    const proto = Type.prototype;

    proto.handles = proto.handles || defaultHandles;

    return Type;
  }
};

function defaultHandles(this: IBindingCommand, attributeDefinition: Immutable<Required<ICustomAttributeSource>>): boolean {
  return !attributeDefinition || attributeDefinition.isTemplateController === false;
}

export interface DefaultBindingCommand extends IBindingCommand {}

@bindingCommand('bind')
export class DefaultBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}

  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    let mode = BindingMode.toView;
    if (element) {
      target = resolveTarget(target, element, attribute);
      const bindable = element.bindables[target];
      if (bindable && bindable.mode && bindable.mode !== BindingMode.default) {
        mode = bindable.mode;
      }
    }
    switch (mode) {
      case BindingMode.oneTime:
        return new OneTimeBindingInstruction(this.parser.parse(value, BindingType.OneTimeCommand), target);
      case BindingMode.toView:
        return new ToViewBindingInstruction(this.parser.parse(value, BindingType.ToViewCommand), target);
      case BindingMode.fromView:
        return new FromViewBindingInstruction(this.parser.parse(value, BindingType.FromViewCommand), target);
      case BindingMode.twoWay:
        return new TwoWayBindingInstruction(this.parser.parse(value, BindingType.TwoWayCommand), target);
    }
  }
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new OneTimeBindingInstruction(this.parser.parse(value, BindingType.OneTimeCommand), resolveTarget(target, element, attribute));
  }
}

export interface ToViewBindingCommand extends IBindingCommand {}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new ToViewBindingInstruction(this.parser.parse(value, BindingType.ToViewCommand), resolveTarget(target, element, attribute));
  }
}

export interface FromViewBindingCommand extends IBindingCommand {}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new FromViewBindingInstruction(this.parser.parse(value, BindingType.FromViewCommand), resolveTarget(target, element, attribute));
  }
}

export interface TwoWayBindingCommand extends IBindingCommand {}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new TwoWayBindingInstruction(this.parser.parse(value, BindingType.TwoWayCommand), resolveTarget(target, element, attribute));
  }
}

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new TriggerBindingInstruction(this.parser.parse(value, BindingType.TriggerCommand), target);
  }
}

export interface DelegateBindingCommand extends IBindingCommand {}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new DelegateBindingInstruction(this.parser.parse(value, BindingType.DelegateCommand), target);
  }
}

export interface CaptureBindingCommand extends IBindingCommand {}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new CaptureBindingInstruction(this.parser.parse(value, BindingType.CaptureCommand), target);
  }
}

export interface CallBindingCommand extends IBindingCommand {}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    return new CallBindingInstruction(this.parser.parse(value, BindingType.CallCommand), resolveTarget(target, element, attribute));
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  static inject = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile(target: string, value: string, node: INode, attribute: AttributeDefinition, element: ElementDefinition): TargetedInstruction {
    const src: ITemplateSource = {
      templateOrNode: node,
      instructions: []
    };
    return new HydrateTemplateController(src, 'repeat', [
      new ToViewBindingInstruction(this.parser.parse(value, BindingType.ForCommand), 'items'),
      new SetPropertyInstruction('item', 'local')
    ]);
  }

  public handles(attributeDefinition: Immutable<Required<ICustomAttributeSource>>): boolean {
    return !!attributeDefinition && attributeDefinition.name === 'repeat';
  }
}
