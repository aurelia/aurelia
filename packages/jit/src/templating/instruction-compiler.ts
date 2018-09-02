import { Constructable, IContainer, Immutable, Registration, Writable } from '@aurelia/kernel';
import { ICustomAttributeSource, INode, IResourceDescriptions, IResourceKind, IResourceType, ITemplateSource, TargetedInstruction } from '@aurelia/runtime';
import { HydrateElementInstruction } from './template-compiler';

export interface IInstructionCompilerSource {
  name: string;
}

export interface IInstructionCompiler {
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

export type IInstructionCompilerType = IResourceType<IInstructionCompilerSource, IInstructionCompiler>;

export function instructionCompiler(nameOrSource: string | IInstructionCompilerSource) {
  return function<T extends Constructable>(target: T) {
    return InstructionCompilerResource.define(nameOrSource, target);
  };
}

export const InstructionCompilerResource: IResourceKind<IInstructionCompilerSource, IInstructionCompilerType> = {
  name: 'instruction-compiler',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IInstructionCompilerType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IInstructionCompilerSource, ctor: T): T & IInstructionCompilerType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IInstructionCompilerType = ctor as any;

    (Type as Writable<IInstructionCompilerType>).kind = InstructionCompilerResource;
    (Type as Writable<IInstructionCompilerType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    return Type;
  }
};
