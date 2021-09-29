import { IExpressionHydrator } from '@aurelia/runtime';
import * as AST from '@aurelia/runtime';
export declare class Deserializer implements IExpressionHydrator {
    static deserialize(serializedExpr: string): AST.IsExpressionOrStatement;
    hydrate(raw: any): any;
    private deserializeExpressions;
}
export declare class Serializer implements AST.IVisitor<string> {
    static serialize(expr: AST.IsExpressionOrStatement): string;
    visitAccessMember(expr: AST.AccessMemberExpression): string;
    visitAccessKeyed(expr: AST.AccessKeyedExpression): string;
    visitAccessThis(expr: AST.AccessThisExpression): string;
    visitAccessScope(expr: AST.AccessScopeExpression): string;
    visitArrayLiteral(expr: AST.ArrayLiteralExpression): string;
    visitObjectLiteral(expr: AST.ObjectLiteralExpression): string;
    visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): string;
    visitCallFunction(expr: AST.CallFunctionExpression): string;
    visitCallMember(expr: AST.CallMemberExpression): string;
    visitCallScope(expr: AST.CallScopeExpression): string;
    visitTemplate(expr: AST.TemplateExpression): string;
    visitTaggedTemplate(expr: AST.TaggedTemplateExpression): string;
    visitUnary(expr: AST.UnaryExpression): string;
    visitBinary(expr: AST.BinaryExpression): string;
    visitConditional(expr: AST.ConditionalExpression): string;
    visitAssign(expr: AST.AssignExpression): string;
    visitValueConverter(expr: AST.ValueConverterExpression): string;
    visitBindingBehavior(expr: AST.BindingBehaviorExpression): string;
    visitArrayBindingPattern(expr: AST.ArrayBindingPattern): string;
    visitObjectBindingPattern(expr: AST.ObjectBindingPattern): string;
    visitBindingIdentifier(expr: AST.BindingIdentifier): string;
    visitHtmlLiteral(_expr: AST.HtmlLiteralExpression): string;
    visitForOfStatement(expr: AST.ForOfStatement): string;
    visitInterpolation(expr: AST.Interpolation): string;
    visitDestructuringAssignmentExpression(expr: AST.DestructuringAssignmentExpression): string;
    visitDestructuringAssignmentSingleExpression(expr: AST.DestructuringAssignmentSingleExpression): string;
    visitDestructuringAssignmentRestExpression(expr: AST.DestructuringAssignmentRestExpression): string;
    private serializeExpressions;
}
export declare function serializePrimitives(values: readonly unknown[]): string;
export declare function serializePrimitive(value: unknown): string;
export declare function deserializePrimitive(value: unknown): any;
//# sourceMappingURL=ast-serialization.d.ts.map