import { Constructable, IContainer } from '@aurelia/kernel';
import { CustomElementDefinition, IHydratedController } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType } from '../interfaces';
import { RoutingInstruction } from './routing-instruction';
export interface IInstructionComponent extends InstructionComponent {
}
/**
 * Public API - The routing instructions are the core of the router's navigations. The component
 * part of a routing instruction can be specified as
 * - a component name, or
 * - a custom element definition, or
 * - a custom element class, or
 * - a custom element instance.
 *
 * The instruction component isn't limited to routing instructions, but can be found in for example load instructions as well.
 * The instruction components are resolved "non-early" to support dynamic, local resolutions.
 */
/** */
export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | CustomElementDefinition | Constructable;
export type ComponentAppellationFunction = (instruction?: RoutingInstruction) => ComponentAppellation | Promise<ComponentAppellation>;
export declare class InstructionComponent {
    /**
     * The name of the component.
     */
    name: string | null;
    /**
     * The (custom element) type of the component.
     */
    type: RouteableComponentType | null;
    /**
     * The (custom element) instance of the component.
     */
    instance: IRouteableComponent | null;
    /**
     * A promise that will resolve into a component name, type,
     * instance or definition.
     */
    promise: Promise<ComponentAppellation> | null;
    /**
     * A function that should result in a component name, type,
     * instance, definition or promise to any of these at the time
     * of route invocation.
     */
    func: ComponentAppellationFunction | null;
    /**
     * Create a new instruction component.
     *
     * @param component - The component
     */
    static create(componentAppelation?: ComponentAppellation | Promise<ComponentAppellation>): InstructionComponent;
    static isName(component: ComponentAppellation): component is string;
    static isDefinition(component: ComponentAppellation): component is CustomElementDefinition;
    static isType(component: ComponentAppellation): component is RouteableComponentType;
    static isInstance(component: ComponentAppellation): component is IRouteableComponent;
    static isAppelation(component: ComponentAppellation): component is ComponentAppellation;
    static getName(component: ComponentAppellation): string;
    static getType(component: ComponentAppellation): RouteableComponentType | null;
    static getInstance(component: ComponentAppellation): IRouteableComponent | null;
    set(component: ComponentAppellation | Promise<ComponentAppellation> | undefined | null): void;
    resolve(instruction: RoutingInstruction): void | Promise<ComponentAppellation>;
    get none(): boolean;
    isName(): boolean;
    isType(): boolean;
    isInstance(): boolean;
    isPromise(): boolean;
    isFunction(): boolean;
    toType(container: IContainer, instruction: RoutingInstruction): RouteableComponentType | null;
    /**
     * Returns the component instance of this instruction.
     *
     * Throws instantiation error if there was an error during instantiation.
     */
    toInstance(parentContainer: IContainer, parentController: IHydratedController, parentElement: HTMLElement, instruction: RoutingInstruction): IRouteableComponent | null | Promise<IRouteableComponent | null>;
    same(other: InstructionComponent, compareType?: boolean): boolean;
    private getNewName;
}
//# sourceMappingURL=instruction-component.d.ts.map