export { type ExpressionKind, CallFunctionExpression, CallGlobalExpression, CustomExpression, BindingBehaviorExpression, ValueConverterExpression, AssignExpression, ConditionalExpression, AccessThisExpression, AccessGlobalExpression, AccessScopeExpression, AccessBoundaryExpression, AccessMemberExpression, AccessKeyedExpression, CallScopeExpression, CallMemberExpression, BinaryExpression, UnaryExpression, PrimitiveLiteralExpression, ArrayLiteralExpression, ObjectLiteralExpression, TemplateExpression, TaggedTemplateExpression, ArrayBindingPattern, ObjectBindingPattern, BindingIdentifier, ForOfStatement, Interpolation, DestructuringAssignmentExpression, DestructuringAssignmentSingleExpression, DestructuringAssignmentRestExpression, ArrowFunction, NewExpression, type AnyBindingExpression, type IsPrimary, type IsLiteral, type IsLeftHandSide, type IsUnary, type IsBinary, type IsConditional, type IsAssign, type IsValueConverter, type IsBindingBehavior, type IsAssignable, type IsExpression, type IsExpressionOrStatement, type BinaryOperator, type AssignmentOperator, type BindingIdentifierOrPattern, type UnaryOperator, } from './ast';
export { astVisit, type IVisitor, Unparser } from './ast.visitor';
export { IExpressionParser, ExpressionParser, type ExpressionType, parseExpression, } from './expression-parser';
//# sourceMappingURL=index.d.ts.map