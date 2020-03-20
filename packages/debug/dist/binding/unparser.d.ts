import * as AST from '@aurelia/runtime';
export declare function enableImprovedExpressionDebugging(): void;
export declare class Unparser implements AST.IVisitor<void> {
    text: string;
    static unparse(expr: AST.IExpression): string;
    visitAccessMember(expr: AST.AccessMemberExpression): void;
    visitAccessKeyed(expr: AST.AccessKeyedExpression): void;
    visitAccessThis(expr: AST.AccessThisExpression): void;
    visitAccessScope(expr: AST.AccessScopeExpression): void;
    visitArrayLiteral(expr: AST.ArrayLiteralExpression): void;
    visitObjectLiteral(expr: AST.ObjectLiteralExpression): void;
    visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): void;
    visitCallFunction(expr: AST.CallFunctionExpression): void;
    visitCallMember(expr: AST.CallMemberExpression): void;
    visitCallScope(expr: AST.CallScopeExpression): void;
    visitTemplate(expr: AST.TemplateExpression): void;
    visitTaggedTemplate(expr: AST.TaggedTemplateExpression): void;
    visitUnary(expr: AST.UnaryExpression): void;
    visitBinary(expr: AST.BinaryExpression): void;
    visitConditional(expr: AST.ConditionalExpression): void;
    visitAssign(expr: AST.AssignExpression): void;
    visitValueConverter(expr: AST.ValueConverterExpression): void;
    visitBindingBehavior(expr: AST.BindingBehaviorExpression): void;
    visitArrayBindingPattern(expr: AST.ArrayBindingPattern): void;
    visitObjectBindingPattern(expr: AST.ObjectBindingPattern): void;
    visitBindingIdentifier(expr: AST.BindingIdentifier): void;
    visitHtmlLiteral(expr: AST.HtmlLiteralExpression): void;
    visitForOfStatement(expr: AST.ForOfStatement): void;
    visitInterpolation(expr: AST.Interpolation): void;
    private writeArgs;
}
//# sourceMappingURL=unparser.d.ts.map