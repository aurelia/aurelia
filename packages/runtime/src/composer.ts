import { IContainer, DI, Class, IRegistry, Metadata, Registration } from '@aurelia/kernel';
import { InstructionTypeName, IInstruction } from './definitions';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { IComposableController } from './lifecycle';
import { CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element';
import { ICompiledCompositionContext } from './templating/composition-context';
import { RegisteredProjections } from './resources/custom-elements/au-slot';

export interface ITemplateCompiler {
  compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export interface IComposer {
  compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void;

  composeChildren(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    instructions: readonly IInstruction[],
    controller: IComposableController,
    target: unknown,
  ): void ;
}
export const IComposer = DI.createInterface<IComposer>('IComposer').noDefault();

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}
export interface IInstructionComposer<
  TType extends InstructionTypeName = InstructionTypeName
> extends Partial<IInstructionTypeClassifier<TType>> {
  compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: unknown,
    instruction: IInstruction,
  ): void;
}

export const IInstructionComposer = DI.createInterface<IInstructionComposer>('IInstructionComposer').noDefault();

type DecoratableInstructionComposer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionComposer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>, TClass> & IRegistry;

type InstructionComposerDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionComposer<TType, TProto, TClass>) => DecoratedInstructionComposer<TType, TProto, TClass>;

export function instructionComposer<TType extends string>(instructionType: TType): InstructionComposerDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionComposer<TType, TProto, TClass>): DecoratedInstructionComposer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function (...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionComposer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): void {
      Registration.singleton(IInstructionComposer, decoratedTarget).register(container);
    };
    // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
    // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
    // the length (number of ctor arguments) is copied for the same reason
    const metadataKeys = Metadata.getOwnKeys(target);
    for (const key of metadataKeys) {
      Metadata.define(key, Metadata.getOwn(key, target), decoratedTarget);
    }
    const ownProperties = Object.getOwnPropertyDescriptors(target);
    Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
      Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
    });
    return decoratedTarget;
  };
}
