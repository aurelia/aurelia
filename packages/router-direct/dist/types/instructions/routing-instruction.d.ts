import { InstructionParameters, Parameters } from './instruction-parameters';
import { InstructionComponent } from './instruction-component';
import { ComponentAppellation, ComponentParameters, LoadInstruction } from '../interfaces';
import { RoutingScope } from '../routing-scope';
import { FoundRoute } from '../found-route';
import { Endpoint, EndpointType } from '../endpoints/endpoint';
import { IRouter, IRouterConfiguration, Navigation } from '../index';
import { EndpointHandle, InstructionEndpoint } from './instruction-endpoint';
import { IContainer } from '@aurelia/kernel';
export interface IRoutingInstructionStringifyOptions {
    excludeEndpoint?: boolean;
    endpointContext?: boolean;
    fullState?: boolean;
}
/**
 * The routing instructions are the core of the router's navigations. All
 * navigation instructions to the router are translated to a set of
 * routing instructions. The routing instructions are resolved "non-early"
 * to support dynamic, local resolutions.
 *
 * Routing instructions are used to represent the full navigation state
 * and is serialized when storing and restoring the navigation state. (But
 * not full component state with component instance state. ViewportContent
 * is used for that.)
 */
export declare class RoutingInstruction {
    /**
     * The component part of the routing instruction.
     */
    component: InstructionComponent;
    /**
     * The endpoint part of the routing instruction.
     */
    endpoint: InstructionEndpoint;
    /**
     * The parameters part of the routing instruction.
     */
    parameters: InstructionParameters;
    /**
     * Whether the routing instruction owns its scope.
     */
    ownsScope: boolean;
    /**
     * The routing instructions in the next scope ("children").
     */
    nextScopeInstructions: RoutingInstruction[] | null;
    /**
     * The scope the the routing instruction belongs to.
     */
    scope: RoutingScope | null;
    /**
     * The scope modifier of the routing instruction.
     */
    scopeModifier: string;
    /**
     * Whether the routing instruction can be resolved within the scope without having
     * endpoint specified. Used when creating string instructions/links/url.
     */
    needsEndpointDescribed: boolean;
    /**
     * The configured route, if any, that the routing instruction is part of.
     */
    route: FoundRoute | string | null;
    /**
     * The instruction is the start/first instruction of a configured route.
     */
    routeStart: boolean;
    /**
     * Whether the routing instruction is the result of a (viewport) default (meaning it
     * has lower priority when processing instructions).
     */
    default: boolean;
    /**
     * Whether the routing instruction is the top instruction in its routing instruction
     * hierarchy. Used when syncing swap of all (top) instructions.
     */
    topInstruction: boolean;
    /**
     * The string, if any, that was used to parse the instruction. Includes anything
     * in the string after the actual part for the instruction itself.
     */
    unparsed: string | null;
    /**
     * Whether the routing instruction has been cancelled (aborted) for some reason
     */
    cancelled: boolean;
    constructor(component?: ComponentAppellation | Promise<ComponentAppellation>, endpoint?: EndpointHandle, parameters?: ComponentParameters);
    /**
     * Create a new routing instruction.
     *
     * @param component - The component (appelation) part of the instruction. Can be a promise
     * @param endpoint - The endpoint (handle) part of the instruction
     * @param parameters - The parameters part of the instruction
     * @param ownScope - Whether the routing instruction owns its scope
     * @param nextScopeInstructions - The routing instructions in the next scope ("children")
     */
    static create(component?: ComponentAppellation | Promise<ComponentAppellation>, endpoint?: EndpointHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: RoutingInstruction[] | null): RoutingInstruction | Promise<RoutingInstruction>;
    /**
     * Create a clear endpoint routing instruction.
     *
     * @param endpoint - The endpoint to create the clear instruction for
     */
    static createClear(context: IRouterConfiguration | IRouter, endpoint: EndpointType | Endpoint): RoutingInstruction;
    /**
     * Get routing instructions based on load instructions.
     *
     * @param context - The context (used for syntax) within to parse the instructions
     * @param loadInstructions - The load instructions to get the routing
     * instructions from.
     */
    static from(context: IRouterConfiguration | IRouter | IContainer, loadInstructions: LoadInstruction | LoadInstruction[]): RoutingInstruction[];
    /**
     * The routing instruction component that represents "clear".
     */
    static clear(context: IRouterConfiguration | IRouter): string;
    /**
     * The routing instruction component that represents "add".
     */
    static add(context: IRouterConfiguration | IRouter): string;
    /**
     * Parse an instruction string into a list of routing instructions.
     *
     * @param context - The context (used for syntax) within to parse the instructions
     * @param instructions - The instruction string to parse
     */
    static parse(context: IRouterConfiguration | IRouter | IContainer, instructions: string): RoutingInstruction[];
    /**
     * Stringify a list of routing instructions, recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param instructions - The instructions to stringify
     * @param options - The options for stringifying the instructions
     * @param endpointContext - Whether to include endpoint context in the string. [Deprecated] Use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }
     */
    static stringify(context: IRouterConfiguration | IRouter | IContainer, instructions: RoutingInstruction[] | string, options?: IRoutingInstructionStringifyOptions | boolean, endpointContext?: boolean): string;
    /**
     * Resolve a list of routing instructions, returning a promise that should be awaited if needed.
     *
     * @param instructions - The instructions to resolve
     */
    static resolve(instructions: RoutingInstruction[]): void | Promise<void | ComponentAppellation[]>;
    /**
     * Whether the instructions, on any level, contains siblings
     *
     * @param instructions - The instructions to check
     */
    static containsSiblings(context: IRouterConfiguration | IRouter, instructions: RoutingInstruction[] | null): boolean;
    /**
     * Get all routing instructions, recursively down next scope/child instructions, as
     * a "flat" list.
     *
     * @param instructions - The instructions to flatten
     */
    static flat(instructions: RoutingInstruction[]): RoutingInstruction[];
    /**
     * Clone a list of routing instructions.
     *
     * @param instructions - The instructions to clone
     * @param keepInstances - Whether actual instances should be transfered
     * @param scopeModifier - Whether the scope modifier should be transfered
     */
    static clone(instructions: RoutingInstruction[], keepInstances?: boolean, scopeModifier?: boolean): RoutingInstruction[];
    /**
     * Whether a list of routing instructions contains another list of routing
     * instructions. If deep, all next scope instructions needs to be contained
     * in containing next scope instructions as well.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param instructionsToSearch - Instructions that should contain (superset)
     * @param instructionsToFind - Instructions that should be contained (subset)
     * @param deep - Whether next scope instructions also need to be contained (recursively)
     */
    static contains(context: IRouterConfiguration | IRouter | IContainer, instructionsToSearch: RoutingInstruction[], instructionsToFind: RoutingInstruction[], deep: boolean): boolean;
    /**
     * The endpoint of the routing instruction if it's a viewport OR if
     * it can't be decided (no instance, just a name).
     */
    get viewport(): InstructionEndpoint | null;
    /**
     * The endpoint of the routing instruction if it's a viewport scope OR if
     * it can't be decided (no instance, just a name).
     */
    get viewportScope(): InstructionEndpoint | null;
    /**
     * The previous instruction for the specific endpoint. This can only evaluate
     * to a value when the instruction has an assigned endpoint. This is a
     * convenience property in the API.
     */
    get previous(): RoutingInstruction | null | undefined;
    /**
     * Whether the routing instruction is an "add" instruction.
     */
    isAdd(context: IRouterConfiguration | IRouter): boolean;
    /**
     * Whether the routing instruction is a "clear" instruction.
     */
    isClear(context: IRouterConfiguration | IRouter): boolean;
    /**
     * Whether the routing instruction is an "add all" instruction.
     */
    isAddAll(context: IRouterConfiguration | IRouter): boolean;
    /**
     * Whether the routing instruction is an "clear all" instruction.
     */
    isClearAll(context: IRouterConfiguration | IRouter): boolean;
    /**
     * Whether the routing instruction has next scope/"children" instructions.
     */
    get hasNextScopeInstructions(): boolean;
    /**
     * Get the dynasty of the routing instruction. The dynasty is the instruction
     * itself and all its descendants (next scope instructions iteratively).
     */
    get dynasty(): RoutingInstruction[];
    /**
     * Whether the routing instruction is unresolved.
     */
    get isUnresolved(): boolean;
    /**
     * Resolve the routing instruction.
     */
    resolve(): void | Promise<ComponentAppellation>;
    /**
     * Get the instruction parameters with type specification applied.
     */
    typeParameters(context: IRouterConfiguration | IRouter | IContainer): Parameters;
    /**
     * Compare the routing instruction's route with the route of another routing
     * instruction.
     *
     * @param other - The routing instruction to compare to
     */
    sameRoute(other: RoutingInstruction): boolean;
    /**
     * Compare the routing instruction's component with the component of another routing
     * instruction. Compares on name unless `compareType` is `true`.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param other - The routing instruction to compare to
     * @param compareParameters - Whether parameters should also be compared
     * @param compareType - Whether comparision should be made on type only (and not name)
     */
    sameComponent(context: IRouterConfiguration | IRouter | IContainer, other: RoutingInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
    /**
     * Compare the routing instruction's endpoint with the endpoint of another routing
     * instruction. Compares on endpoint instance if possible, otherwise name.
     *
     * @param other - The routing instruction to compare to
     * @param compareScope - Whether comparision should be made on scope as well (and not
     * only instance/name)
     */
    sameEndpoint(other: RoutingInstruction, compareScope: boolean): boolean;
    /**
     * Compare the routing instruction's parameters with the parameters of another routing
     * instruction. Compares on actual values.
     *
     * @param other - The routing instruction to compare to
     * @param compareType - Whether comparision should be made on type as well
     */
    sameParameters(context: IRouterConfiguration | IRouter | IContainer, other: RoutingInstruction, compareType?: boolean): boolean;
    /**
     * Stringify the routing instruction, recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param options - The options for stringifying the instructions
     * @param endpointContext - Whether to include endpoint context in the string.
     * [Deprecated] Use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }
     * @param shallow - Whether to stringify next scope instructions
     */
    stringify(context: IRouterConfiguration | IRouter | IContainer, options?: IRoutingInstructionStringifyOptions | boolean, endpointContextOrShallow?: boolean, shallow?: boolean): string;
    /**
     * Clone the routing instruction.
     *
     * @param keepInstances - Whether actual instances should be transfered
     * @param scopeModifier - Whether the scope modifier should be transfered
     * @param shallow - Whether it should be a shallow clone only
     */
    clone(keepInstances?: boolean, scopeModifier?: boolean, shallow?: boolean): RoutingInstruction;
    /**
     * Whether the routing instruction is in a list of routing instructions. If
     * deep, all next scope instructions needs to be contained in containing
     * next scope instructions as well.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param searchIn - Instructions that should contain (superset)
     * @param deep - Whether next scope instructions also need to be contained (recursively)
     */
    isIn(context: IRouterConfiguration | IRouter | IContainer, searchIn: RoutingInstruction[], deep: boolean): boolean;
    /**
     * Get the title for the routing instruction.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(navigation: Navigation): string;
    toJSON(): unknown;
    /**
     * Stringify the routing instruction shallowly, NOT recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param excludeEndpoint - Whether to exclude endpoint names in the string
     * @param excludeComponent - Whether to exclude component names in the string
     */
    private stringifyShallow;
}
//# sourceMappingURL=routing-instruction.d.ts.map