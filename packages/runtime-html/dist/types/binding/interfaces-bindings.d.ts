import { AnyBindingExpression, IConnectableBinding } from '@aurelia/runtime';
export interface IAstBasedBinding extends IConnectableBinding {
    sourceExpression: AnyBindingExpression;
}
export declare const enum BindingFlags {
    /**
     * Indicates whether a binding should evaluate its expression in strict mode
     */
    strict = 1,
    /**
     * Indicates that a binding should only observe leaf properties in its expression
     */
    leafOnly = 128
}
//# sourceMappingURL=interfaces-bindings.d.ts.map