import { BindingMode, IExpressionParser, IObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { IEventDelegator } from './observation/event-delegator.js';
import { CustomElementDefinition } from './resources/custom-element.js';
import { IProjections } from './resources/slot-injectables.js';
import { CustomAttributeDefinition } from './resources/custom-attribute.js';
import { INode } from './dom.js';
import { IController } from './templating/controller.js';
import { IPlatform } from './platform.js';
import { IRendering } from './templating/rendering.js';
import type { IServiceLocator, IContainer, Class, IRegistry } from '@aurelia/kernel';
import type { Interpolation, IsBindingBehavior, IInterceptableBinding, ForOfStatement, DelegationStrategy } from '@aurelia/runtime';
import type { IHydratableController } from './templating/controller.js';
import type { PartialCustomElementDefinition } from './resources/custom-element.js';
export declare const enum InstructionType {
    hydrateElement = "ra",
    hydrateAttribute = "rb",
    hydrateTemplateController = "rc",
    hydrateLetElement = "rd",
    setProperty = "re",
    interpolation = "rf",
    propertyBinding = "rg",
    callBinding = "rh",
    letBinding = "ri",
    refBinding = "rj",
    iteratorBinding = "rk",
    textBinding = "ha",
    listenerBinding = "hb",
    attributeBinding = "hc",
    stylePropertyBinding = "hd",
    setAttribute = "he",
    setClassAttribute = "hf",
    setStyleAttribute = "hg"
}
export declare type NodeInstruction = HydrateElementInstruction | HydrateTemplateController | HydrateLetElementInstruction | TextBindingInstruction;
export declare type AttributeInstruction = InterpolationInstruction | PropertyBindingInstruction | IteratorBindingInstruction | CallBindingInstruction | RefBindingInstruction | SetPropertyInstruction | LetBindingInstruction | HydrateAttributeInstruction | ListenerBindingInstruction | AttributeBindingInstruction | StylePropertyBindingInstruction | SetAttributeInstruction | SetClassAttributeInstruction | SetStyleAttributeInstruction;
export declare type Instruction = NodeInstruction | AttributeInstruction;
export declare type InstructionRow = [Instruction, ...AttributeInstruction[]];
export declare type InstructionTypeName = string;
export interface IInstruction {
    readonly type: InstructionTypeName;
}
export declare const IInstruction: import("@aurelia/kernel").InterfaceSymbol<IInstruction>;
export declare function isInstruction(value: unknown): value is IInstruction;
export declare class InterpolationInstruction {
    from: string | Interpolation;
    to: string;
    get type(): InstructionType.interpolation;
    constructor(from: string | Interpolation, to: string);
}
export declare class PropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    mode: BindingMode;
    get type(): InstructionType.propertyBinding;
    constructor(from: string | IsBindingBehavior, to: string, mode: BindingMode);
}
export declare class IteratorBindingInstruction {
    from: string | ForOfStatement;
    to: string;
    get type(): InstructionType.iteratorBinding;
    constructor(from: string | ForOfStatement, to: string);
}
export declare class CallBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    get type(): InstructionType.callBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction {
    readonly from: string | IsBindingBehavior;
    readonly to: string;
    get type(): InstructionType.refBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction {
    value: unknown;
    to: string;
    get type(): InstructionType.setProperty;
    constructor(value: unknown, to: string);
}
export declare class HydrateElementInstruction {
    /**
     * The name of the custom element this instruction is associated with
     */
    res: string | /* Constructable |  */ CustomElementDefinition;
    alias: string | undefined;
    /**
     * Bindable instructions for the custom element instance
     */
    instructions: IInstruction[];
    /**
     * Indicates what projections are associated with the element usage
     */
    projections: Record<string, CustomElementDefinition> | null;
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless: boolean;
    get type(): InstructionType.hydrateElement;
    /**
     * A special property that can be used to store <au-slot/> usage information
     */
    auSlot: {
        name: string;
        fallback: CustomElementDefinition;
    } | null;
    constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    res: string | /* Constructable |  */ CustomElementDefinition, alias: string | undefined, 
    /**
     * Bindable instructions for the custom element instance
     */
    instructions: IInstruction[], 
    /**
     * Indicates what projections are associated with the element usage
     */
    projections: Record<string, CustomElementDefinition> | null, 
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless: boolean);
}
export declare class HydrateAttributeInstruction {
    res: string | /* Constructable |  */ CustomAttributeDefinition;
    alias: string | undefined;
    /**
     * Bindable instructions for the custom attribute instance
     */
    instructions: IInstruction[];
    get type(): InstructionType.hydrateAttribute;
    constructor(res: string | /* Constructable |  */ CustomAttributeDefinition, alias: string | undefined, 
    /**
     * Bindable instructions for the custom attribute instance
     */
    instructions: IInstruction[]);
}
export declare class HydrateTemplateController {
    def: PartialCustomElementDefinition;
    res: string | /* Constructable |  */ CustomAttributeDefinition;
    alias: string | undefined;
    /**
     * Bindable instructions for the template controller instance
     */
    instructions: IInstruction[];
    get type(): InstructionType.hydrateTemplateController;
    constructor(def: PartialCustomElementDefinition, res: string | /* Constructable |  */ CustomAttributeDefinition, alias: string | undefined, 
    /**
     * Bindable instructions for the template controller instance
     */
    instructions: IInstruction[]);
}
export declare class HydrateLetElementInstruction {
    instructions: LetBindingInstruction[];
    toBindingContext: boolean;
    get type(): InstructionType.hydrateLetElement;
    constructor(instructions: LetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction {
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    get type(): InstructionType.letBinding;
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
export declare class TextBindingInstruction {
    from: string | Interpolation;
    /**
     * Indicates whether the value of the expression "from"
     * should be evaluated in strict mode.
     *
     * In none strict mode, "undefined" and "null" are coerced into empty string
     */
    strict: boolean;
    get type(): InstructionType.textBinding;
    constructor(from: string | Interpolation, 
    /**
     * Indicates whether the value of the expression "from"
     * should be evaluated in strict mode.
     *
     * In none strict mode, "undefined" and "null" are coerced into empty string
     */
    strict: boolean);
}
export declare class ListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    preventDefault: boolean;
    strategy: DelegationStrategy;
    get type(): InstructionType.listenerBinding;
    constructor(from: string | IsBindingBehavior, to: string, preventDefault: boolean, strategy: DelegationStrategy);
}
export declare class StylePropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    get type(): InstructionType.stylePropertyBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetAttributeInstruction {
    value: string;
    to: string;
    get type(): InstructionType.setAttribute;
    constructor(value: string, to: string);
}
export declare class SetClassAttributeInstruction {
    readonly value: string;
    readonly type: InstructionType.setClassAttribute;
    constructor(value: string);
}
export declare class SetStyleAttributeInstruction {
    readonly value: string;
    readonly type: InstructionType.setStyleAttribute;
    constructor(value: string);
}
export declare class AttributeBindingInstruction {
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string;
    from: string | IsBindingBehavior;
    to: string;
    get type(): InstructionType.attributeBinding;
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string, from: string | IsBindingBehavior, to: string);
}
export declare const ITemplateCompiler: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompiler>;
export interface ITemplateCompiler {
    /**
     * Indicates whether this compiler should compile template in debug mode
     *
     * For the default compiler, this means all expressions are kept as is on the template
     */
    debug: boolean;
    /**
     * Experimental API, for optimization.
     *
     * `true` to create CustomElement/CustomAttribute instructions
     * with resolved resources constructor during compilation, instead of name
     */
    resolveResources: boolean;
    compile(partialDefinition: PartialCustomElementDefinition, context: IContainer, compilationInstruction: ICompliationInstruction | null): CustomElementDefinition;
}
export interface ICompliationInstruction {
    /**
     * A record of projections available for compiling a template.
     * Where each key is the matching slot name for <au-slot/> inside,
     * and each value is the definition to render and project
     */
    projections: IProjections | null;
}
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IRenderer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
    render(flags: LifecycleFlags, 
    /**
     * The controller that is current invoking this renderer
     */
    renderingCtrl: IHydratableController, target: unknown, instruction: IInstruction): void;
}
export declare const IRenderer: import("@aurelia/kernel").InterfaceSymbol<IRenderer<string>>;
declare type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>, TClass> & IRegistry;
declare type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;
export declare function renderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType>;
export declare class SetPropertyRenderer implements IRenderer {
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: IController, instruction: SetPropertyInstruction): void;
}
export declare class CustomElementRenderer implements IRenderer {
    private readonly r;
    static get inject(): unknown[];
    constructor(r: IRendering);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateElementInstruction): void;
}
export declare class CustomAttributeRenderer implements IRenderer {
    private readonly r;
    static get inject(): unknown[];
    constructor(r: IRendering);
    render(f: LifecycleFlags, 
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateAttributeInstruction): void;
}
export declare class TemplateControllerRenderer implements IRenderer {
    private readonly r;
    static get inject(): unknown[];
    constructor(r: IRendering);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateTemplateController): void;
}
export declare class LetElementRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    constructor(parser: IExpressionParser, oL: IObserverLocator);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: Node & ChildNode, instruction: HydrateLetElementInstruction): void;
}
export declare class CallBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: IController, instruction: CallBindingInstruction): void;
}
export declare class RefBindingRenderer implements IRenderer {
    private readonly parser;
    constructor(parser: IExpressionParser);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: INode, instruction: RefBindingInstruction): void;
}
export declare class InterpolationBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: IController, instruction: InterpolationInstruction): void;
}
export declare class PropertyBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(flags: LifecycleFlags, renderingCtrl: IHydratableController, target: IController, instruction: PropertyBindingInstruction): void;
}
export declare class IteratorBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: IController, instruction: IteratorBindingInstruction): void;
}
export declare function applyBindingBehavior<T extends IInterceptableBinding>(binding: T, expression: IsBindingBehavior, locator: IServiceLocator): T;
export declare class TextBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: ChildNode, instruction: TextBindingInstruction): void;
}
export declare class ListenerBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly eventDelegator;
    constructor(parser: IExpressionParser, eventDelegator: IEventDelegator);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: HTMLElement, instruction: ListenerBindingInstruction): void;
}
export declare class SetAttributeRenderer implements IRenderer {
    render(f: LifecycleFlags, _: IHydratableController, target: HTMLElement, instruction: SetAttributeInstruction): void;
}
export declare class SetClassAttributeRenderer implements IRenderer {
    render(f: LifecycleFlags, _: IHydratableController, target: HTMLElement, instruction: SetClassAttributeInstruction): void;
}
export declare class SetStyleAttributeRenderer implements IRenderer {
    render(f: LifecycleFlags, _: IHydratableController, target: HTMLElement, instruction: SetStyleAttributeInstruction): void;
}
export declare class StylePropertyBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: HTMLElement, instruction: StylePropertyBindingInstruction): void;
}
export declare class AttributeBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    constructor(parser: IExpressionParser, oL: IObserverLocator);
    render(f: LifecycleFlags, renderingCtrl: IHydratableController, target: HTMLElement, instruction: AttributeBindingInstruction): void;
}
export {};
//# sourceMappingURL=renderer.d.ts.map