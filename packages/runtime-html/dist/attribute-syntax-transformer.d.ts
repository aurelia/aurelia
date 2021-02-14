import { ISVGAnalyzer } from './observation/svg-analyzer.js';
export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {
}
export declare const IAttrSyntaxTransformer: import("@aurelia/kernel").InterfaceSymbol<IAttrSyntaxTransformer>;
declare type IsTwoWayPredicate = (element: Element, attribute: string) => boolean;
export declare class AttrSyntaxTransformer {
    private readonly svg;
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<ISVGAnalyzer>[];
    constructor(svg: ISVGAnalyzer);
    /**
     * Allow application to teach Aurelia how to define how to map attributes to properties
     * based on element tagName
     */
    useMapping(config: Record<string, Record<string, PropertyKey>>): void;
    /**
     * Allow applications to teach Aurelia how to define how to map attributes to properties
     * for all elements
     */
    useGlobalMapping(config: Record<string, PropertyKey>): void;
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be transformed to `'two-way'` command.
     *
     * If one of those functions in this lists returns true, the `'bind'` command
     * will be transformed into `'two-way'` command.
     *
     * The function will be called with 2 parameters:
     * - element: the element that the template compiler is currently working with
     * - property: the target property name
     */
    useTwoWay(fn: IsTwoWayPredicate): void;
}
export {};
//# sourceMappingURL=attribute-syntax-transformer.d.ts.map