import { ViewportInstructionTree } from './instructions';
import { type NavigationOptions } from './options';
import { ParsedUrl } from './url-parser';
export type ExpressionKind = 'Route' | 'CompositeSegment' | 'ScopedSegment' | 'SegmentGroup' | 'Segment' | 'Component' | 'Action' | 'Viewport' | 'ParameterList' | 'Parameter';
export type RouteExpressionOrHigher = CompositeSegmentExpressionOrHigher | RouteExpression;
export declare class RouteExpression {
    readonly isAbsolute: boolean;
    readonly root: CompositeSegmentExpressionOrHigher;
    readonly queryParams: Readonly<URLSearchParams>;
    readonly fragment: string | null;
    get kind(): 'Route';
    constructor(isAbsolute: boolean, root: CompositeSegmentExpressionOrHigher, queryParams: Readonly<URLSearchParams>, fragment: string | null);
    static parse(value: ParsedUrl): RouteExpression;
    toInstructionTree(options: NavigationOptions): ViewportInstructionTree;
}
export type CompositeSegmentExpressionOrHigher = ScopedSegmentExpressionOrHigher | CompositeSegmentExpression;
export type CompositeSegmentExpressionOrLower = RouteExpression | CompositeSegmentExpression;
/**
 * A single 'traditional' (slash-separated) segment consisting of one or more sibling segments.
 *
 * ### Variations:
 *
 * 1: `a+b`
 * - siblings: [`a`, `b`]
 * - append: `false`
 *
 * 2: `+a`
 * - siblings: [`a`]
 * - append: `true`
 *
 * 3: `+a+a`
 * - siblings: [`a`, `b`]
 * - append: `true`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 * - b = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
export declare class CompositeSegmentExpression {
    readonly siblings: readonly ScopedSegmentExpressionOrHigher[];
    get kind(): 'CompositeSegment';
    constructor(siblings: readonly ScopedSegmentExpressionOrHigher[]);
}
export type ScopedSegmentExpressionOrHigher = SegmentGroupExpressionOrHigher | ScopedSegmentExpression;
export type ScopedSegmentExpressionOrLower = CompositeSegmentExpressionOrLower | ScopedSegmentExpression;
/**
 * The (single) left-hand side and the (one or more) right-hand side of a slash-separated segment.
 *
 * Variations:
 *
 * 1: `a/b`
 * - left: `a`
 * - right: `b`
 *
 * Where
 * - a = `SegmentGroupExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression`)
 * - b = `ScopedSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression`)
 */
export declare class ScopedSegmentExpression {
    readonly left: SegmentGroupExpressionOrHigher;
    readonly right: ScopedSegmentExpressionOrHigher;
    get kind(): 'ScopedSegment';
    constructor(left: SegmentGroupExpressionOrHigher, right: ScopedSegmentExpressionOrHigher);
}
export type SegmentGroupExpressionOrHigher = SegmentExpression | SegmentGroupExpression;
export type SegmentGroupExpressionOrLower = ScopedSegmentExpressionOrLower | SegmentGroupExpression;
/**
 * Any kind of segment wrapped in parentheses, increasing its precedence.
 * Specifically, the parentheses are needed to deeply specify scoped siblings.
 * The precedence is intentionally similar to the familiar mathematical `/` and `+` operators.
 *
 * For example, consider this viewport structure:
 * - viewport-a
 * - - viewport-a1
 * - - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * This can only be deeply specified by using the grouping operator: `a/(a1+a2)+b/b1`
 *
 * Because `a/a1+a2+b/b1` would be interpreted differently:
 * - viewport-a
 * - - viewport-a1
 * - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * ### Variations:
 *
 * 1: `(a)`
 * - expression: `a`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
export declare class SegmentGroupExpression {
    readonly expression: CompositeSegmentExpressionOrHigher;
    get kind(): 'SegmentGroup';
    constructor(expression: CompositeSegmentExpressionOrHigher);
}
/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
export declare class SegmentExpression {
    readonly component: ComponentExpression;
    readonly viewport: ViewportExpression;
    readonly scoped: boolean;
    get kind(): 'Segment';
    static get Empty(): SegmentExpression;
    constructor(component: ComponentExpression, viewport: ViewportExpression, scoped: boolean);
}
export declare class ComponentExpression {
    readonly name: string;
    readonly parameterList: ParameterListExpression;
    get kind(): 'Component';
    static get Empty(): ComponentExpression;
    /**
     * A single segment matching parameter, e.g. `:foo` (will match `a` but not `a/b`)
     */
    readonly isParameter: boolean;
    /**
     * A multi-segment matching parameter, e.g. `*foo` (will match `a` as well as `a/b`)
     */
    readonly isStar: boolean;
    /**
     * Whether this is either a parameter or a star segment.
     */
    readonly isDynamic: boolean;
    /**
     * If this is a dynamic segment (parameter or star), this is the name of the parameter (the name without the `:` or `*`)
     */
    readonly parameterName: string;
    constructor(name: string, parameterList: ParameterListExpression);
}
export declare class ViewportExpression {
    readonly name: string | null;
    get kind(): 'Viewport';
    static get Empty(): ViewportExpression;
    constructor(name: string | null);
}
export declare class ParameterListExpression {
    readonly expressions: readonly ParameterExpression[];
    get kind(): 'ParameterList';
    static get Empty(): ParameterListExpression;
    constructor(expressions: readonly ParameterExpression[]);
}
export declare class ParameterExpression {
    readonly key: string;
    readonly value: string;
    get kind(): 'Parameter';
    static get Empty(): ParameterExpression;
    constructor(key: string, value: string);
}
export declare const AST: Readonly<{
    RouteExpression: typeof RouteExpression;
    CompositeSegmentExpression: typeof CompositeSegmentExpression;
    ScopedSegmentExpression: typeof ScopedSegmentExpression;
    SegmentGroupExpression: typeof SegmentGroupExpression;
    SegmentExpression: typeof SegmentExpression;
    ComponentExpression: typeof ComponentExpression;
    ViewportExpression: typeof ViewportExpression;
    ParameterListExpression: typeof ParameterListExpression;
    ParameterExpression: typeof ParameterExpression;
}>;
//# sourceMappingURL=route-expression.d.ts.map