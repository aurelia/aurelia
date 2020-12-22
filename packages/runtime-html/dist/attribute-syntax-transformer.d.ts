export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {
}
export declare const IAttrSyntaxTransformer: import("@aurelia/kernel").InterfaceSymbol<IAttrSyntaxTransformer>;
declare type IsTwoWayPredicate = (element: HTMLElement, attribute: string) => boolean;
export declare class AttrSyntaxTransformer {
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