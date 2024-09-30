import { type ILogger } from '@aurelia/kernel';
import { CustomElementDefinition } from '@aurelia/runtime-html';
import { ITypedNavigationInstruction_ResolvedComponent, Params, ViewportInstruction, ViewportInstructionTree } from './instructions';
import { type IRouteContext } from './route-context';
import { type NavigationOptions } from './options';
export interface IRouteNodeInitializationOptions {
    path: string;
    finalPath: string;
    context: IRouteContext;
    /** Can only be `null` for the composition root */
    instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
    params?: Params;
    queryParams?: Readonly<URLSearchParams>;
    fragment?: string | null;
    data?: Record<string, unknown>;
    _viewport?: string | null;
    title?: string | ((node: RouteNode) => string | null) | null;
    component: CustomElementDefinition;
    children?: RouteNode[];
    residue?: ViewportInstruction[];
    originalInstruction?: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
}
export declare class RouteNode {
    /**
     * The original configured path pattern that was matched.
     */
    readonly path: string;
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    readonly finalPath: string;
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    readonly context: IRouteContext;
    /** Can only be `null` for the composition root */
    readonly instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
    readonly params: Readonly<Params>;
    readonly queryParams: Readonly<URLSearchParams>;
    readonly fragment: string | null;
    readonly data: Readonly<Record<string, unknown>>;
    readonly title: string | ((node: RouteNode) => string | null) | null;
    readonly component: CustomElementDefinition;
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    readonly residue: ViewportInstruction[];
    get root(): RouteNode;
    get isInstructionsFinalized(): boolean;
    readonly children: RouteNode[];
    private constructor();
    static create(input: IRouteNodeInitializationOptions): RouteNode;
    contains(instructions: ViewportInstructionTree, matchEndpoint?: boolean): boolean;
    getTitle(separator: string): string | null;
    computeAbsolutePath(): string;
    toString(): string;
}
export declare class RouteTree {
    readonly options: NavigationOptions;
    readonly queryParams: Readonly<URLSearchParams>;
    readonly fragment: string | null;
    root: RouteNode;
    constructor(options: NavigationOptions, queryParams: Readonly<URLSearchParams>, fragment: string | null, root: RouteNode);
    contains(instructions: ViewportInstructionTree, matchEndpoint?: boolean): boolean;
    toString(): string;
}
export declare function createAndAppendNodes(log: ILogger, node: RouteNode, vi: ViewportInstruction): void | Promise<void>;
//# sourceMappingURL=route-tree.d.ts.map