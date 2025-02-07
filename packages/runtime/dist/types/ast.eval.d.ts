import { CustomExpression, type IsExpressionOrStatement } from '@aurelia/expression-parser';
import { type IConnectable } from './interfaces';
import { Scope } from './scope';
/**
 * An interface describing the object that can evaluate Aurelia AST
 */
export interface IAstEvaluator {
    /** describe whether the evaluator wants to evaluate in strict mode */
    strict?: boolean;
    /** describe whether the evaluator wants a bound function to be returned, in case the returned value is a function */
    boundFn?: boolean;
    /**
     * bind a behavior by the given name
     */
    bindBehavior?(name: string, scope: Scope, args: unknown[]): void;
    /**
     * unbind a behavior by the given name
     */
    unbindBehavior?(name: string, scope: Scope): void;
    /**
     * bind a converter by the given name
     */
    bindConverter?(name: string): void;
    /**
     * unbind a converter by the given name
     */
    unbindConverter?(name: string): void;
    /**
     * use a converter to convert a value
     */
    useConverter?(name: string, mode: 'toView' | 'fromView', value: unknown, args: unknown[]): unknown;
}
export declare const astAssign: (ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null, val: unknown) => unknown, astEvaluate: (ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null) => unknown, astBind: (ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator) => void, astUnbind: (ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator) => void;
//# sourceMappingURL=ast.eval.d.ts.map