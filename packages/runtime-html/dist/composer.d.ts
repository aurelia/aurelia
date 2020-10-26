import { IServiceLocator, IContainer, Class, IRegistry } from '@aurelia/kernel';
import { IExpressionParser, IObserverLocator, IsBindingBehavior, LifecycleFlags, IInterceptableBinding } from '@aurelia/runtime';
import { IEventDelegator } from './observation/event-delegator';
import { AttributeBindingInstruction, CallBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, InterpolationInstruction, IteratorBindingInstruction, ListenerBindingInstruction, PropertyBindingInstruction, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, StylePropertyBindingInstruction, Instruction, TextBindingInstruction } from './instructions';
import { InstructionTypeName, IInstruction } from './definitions';
import { IComposableController, IController } from './lifecycle';
import { CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element';
import { ICompiledCompositionContext } from './templating/composition-context';
import { RegisteredProjections } from './resources/custom-elements/au-slot';
import { INode } from './dom';
import { IPlatform } from './platform';
export interface ITemplateCompiler {
    compile(partialDefinition: PartialCustomElementDefinition, context: IContainer, targetedProjections: RegisteredProjections | null): CustomElementDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompiler>;
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IInstructionComposer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: unknown, instruction: IInstruction): void;
}
export declare const IInstructionComposer: import("@aurelia/kernel").InterfaceSymbol<IInstructionComposer<string>>;
declare type DecoratableInstructionComposer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionComposer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>, TClass> & IRegistry;
declare type InstructionComposerDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionComposer<TType, TProto, TClass>) => DecoratedInstructionComposer<TType, TProto, TClass>;
export declare function instructionComposer<TType extends string>(instructionType: TType): InstructionComposerDecorator<TType>;
export interface IComposer extends Composer {
}
export declare const IComposer: import("@aurelia/kernel").InterfaceSymbol<IComposer>;
export declare class Composer {
    private readonly instructionComposers;
    constructor(instructionComposers: IInstructionComposer[]);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
    composeChildren(flags: LifecycleFlags, context: ICompiledCompositionContext, instructions: readonly Instruction[], controller: IComposableController, target: unknown): void;
}
export declare class SetPropertyComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: IController, instruction: SetPropertyInstruction): void;
}
export declare class CustomElementComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: INode, instruction: HydrateElementInstruction): void;
}
export declare class CustomAttributeComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: Node, instruction: HydrateAttributeInstruction): void;
}
export declare class TemplateControllerComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: INode, instruction: HydrateTemplateController): void;
}
export declare class LetElementComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: Node & ChildNode, instruction: HydrateLetElementInstruction): void;
}
export declare class CallBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: IController, instruction: CallBindingInstruction): void;
}
export declare class RefBindingComposer implements IInstructionComposer {
    private readonly parser;
    constructor(parser: IExpressionParser);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: INode, instruction: RefBindingInstruction): void;
}
export declare class InterpolationBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: IController, instruction: InterpolationInstruction): void;
}
export declare class PropertyBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: IController, instruction: PropertyBindingInstruction): void;
}
export declare class IteratorBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: IController, instruction: IteratorBindingInstruction): void;
}
export declare function applyBindingBehavior(binding: IInterceptableBinding, expression: IsBindingBehavior, locator: IServiceLocator): IInterceptableBinding;
export declare class TextBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: ChildNode, instruction: TextBindingInstruction): void;
}
export declare class ListenerBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly eventDelegator;
    constructor(parser: IExpressionParser, eventDelegator: IEventDelegator);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: ListenerBindingInstruction): void;
}
export declare class SetAttributeComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: SetAttributeInstruction): void;
}
export declare class SetClassAttributeComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: SetClassAttributeInstruction): void;
}
export declare class SetStyleAttributeComposer implements IInstructionComposer {
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: SetStyleAttributeInstruction): void;
}
export declare class StylePropertyBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: StylePropertyBindingInstruction): void;
}
export declare class AttributeBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: ICompiledCompositionContext, controller: IComposableController, target: HTMLElement, instruction: AttributeBindingInstruction): void;
}
export {};
//# sourceMappingURL=composer.d.ts.map