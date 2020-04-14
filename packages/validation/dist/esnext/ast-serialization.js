import * as AST from '@aurelia/runtime';
var ASTExpressionTypes;
(function (ASTExpressionTypes) {
    ASTExpressionTypes["BindingBehaviorExpression"] = "BindingBehaviorExpression";
    ASTExpressionTypes["ValueConverterExpression"] = "ValueConverterExpression";
    ASTExpressionTypes["AssignExpression"] = "AssignExpression";
    ASTExpressionTypes["ConditionalExpression"] = "ConditionalExpression";
    ASTExpressionTypes["AccessThisExpression"] = "AccessThisExpression";
    ASTExpressionTypes["AccessScopeExpression"] = "AccessScopeExpression";
    ASTExpressionTypes["AccessMemberExpression"] = "AccessMemberExpression";
    ASTExpressionTypes["AccessKeyedExpression"] = "AccessKeyedExpression";
    ASTExpressionTypes["CallScopeExpression"] = "CallScopeExpression";
    ASTExpressionTypes["CallMemberExpression"] = "CallMemberExpression";
    ASTExpressionTypes["CallFunctionExpression"] = "CallFunctionExpression";
    ASTExpressionTypes["BinaryExpression"] = "BinaryExpression";
    ASTExpressionTypes["UnaryExpression"] = "UnaryExpression";
    ASTExpressionTypes["PrimitiveLiteralExpression"] = "PrimitiveLiteralExpression";
    ASTExpressionTypes["ArrayLiteralExpression"] = "ArrayLiteralExpression";
    ASTExpressionTypes["ObjectLiteralExpression"] = "ObjectLiteralExpression";
    ASTExpressionTypes["TemplateExpression"] = "TemplateExpression";
    ASTExpressionTypes["TaggedTemplateExpression"] = "TaggedTemplateExpression";
    ASTExpressionTypes["ArrayBindingPattern"] = "ArrayBindingPattern";
    ASTExpressionTypes["ObjectBindingPattern"] = "ObjectBindingPattern";
    ASTExpressionTypes["BindingIdentifier"] = "BindingIdentifier";
    ASTExpressionTypes["ForOfStatement"] = "ForOfStatement";
    ASTExpressionTypes["Interpolation"] = "Interpolation";
})(ASTExpressionTypes || (ASTExpressionTypes = {}));
export class Deserializer {
    static deserialize(serializedExpr) {
        const deserializer = new Deserializer();
        const raw = JSON.parse(serializedExpr);
        return deserializer.hydrate(raw);
    }
    hydrate(raw) {
        switch (raw.$TYPE) {
            case ASTExpressionTypes.AccessMemberExpression: {
                const expr = raw;
                return new AST.AccessMemberExpression(this.hydrate(expr.object), expr.name);
            }
            case ASTExpressionTypes.AccessKeyedExpression: {
                const expr = raw;
                return new AST.AccessKeyedExpression(this.hydrate(expr.object), this.hydrate(expr.key));
            }
            case ASTExpressionTypes.AccessThisExpression: {
                const expr = raw;
                return new AST.AccessThisExpression(expr.ancestor);
            }
            case ASTExpressionTypes.AccessScopeExpression: {
                const expr = raw;
                return new AST.AccessScopeExpression(expr.name, expr.ancestor);
            }
            case ASTExpressionTypes.ArrayLiteralExpression: {
                const expr = raw;
                return new AST.ArrayLiteralExpression(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectLiteralExpression: {
                const expr = raw;
                return new AST.ObjectLiteralExpression(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.PrimitiveLiteralExpression: {
                const expr = raw;
                return new AST.PrimitiveLiteralExpression(this.hydrate(expr.value));
            }
            case ASTExpressionTypes.CallFunctionExpression: {
                const expr = raw;
                return new AST.CallFunctionExpression(this.hydrate(expr.func), this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallMemberExpression: {
                const expr = raw;
                return new AST.CallMemberExpression(this.hydrate(expr.object), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallScopeExpression: {
                const expr = raw;
                return new AST.CallScopeExpression(expr.name, this.hydrate(expr.args), expr.ancestor);
            }
            case ASTExpressionTypes.TemplateExpression: {
                const expr = raw;
                return new AST.TemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.TaggedTemplateExpression: {
                const expr = raw;
                return new AST.TaggedTemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.raw), this.hydrate(expr.func), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.UnaryExpression: {
                const expr = raw;
                return new AST.UnaryExpression(expr.operation, this.hydrate(expr.expression));
            }
            case ASTExpressionTypes.BinaryExpression: {
                const expr = raw;
                return new AST.BinaryExpression(expr.operation, this.hydrate(expr.left), this.hydrate(expr.right));
            }
            case ASTExpressionTypes.ConditionalExpression: {
                const expr = raw;
                return new AST.ConditionalExpression(this.hydrate(expr.condition), this.hydrate(expr.yes), this.hydrate(expr.no));
            }
            case ASTExpressionTypes.AssignExpression: {
                const expr = raw;
                return new AST.AssignExpression(this.hydrate(expr.target), this.hydrate(expr.value));
            }
            case ASTExpressionTypes.ValueConverterExpression: {
                const expr = raw;
                return new AST.ValueConverterExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.BindingBehaviorExpression: {
                const expr = raw;
                return new AST.BindingBehaviorExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.ArrayBindingPattern: {
                const expr = raw;
                return new AST.ArrayBindingPattern(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectBindingPattern: {
                const expr = raw;
                return new AST.ObjectBindingPattern(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.BindingIdentifier: {
                const expr = raw;
                return new AST.BindingIdentifier(expr.name);
            }
            case ASTExpressionTypes.ForOfStatement: {
                const expr = raw;
                return new AST.ForOfStatement(this.hydrate(expr.declaration), this.hydrate(expr.iterable));
            }
            case ASTExpressionTypes.Interpolation: {
                const expr = raw;
                return new AST.Interpolation(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            default:
                if (Array.isArray(raw)) {
                    if (typeof raw[0] === 'object') {
                        return this.deserializeExpressions(raw);
                    }
                    else {
                        return raw.map(deserializePrimitive);
                    }
                }
                else if (typeof raw !== 'object') {
                    return deserializePrimitive(raw);
                }
                throw new Error(`unable to deserialize the expression: ${raw}`); // TODO use reporter/logger
        }
    }
    deserializeExpressions(exprs) {
        const expressions = [];
        for (const expr of exprs) {
            expressions.push(this.hydrate(expr));
        }
        return expressions;
    }
}
export class Serializer {
    static serialize(expr) {
        const visitor = new Serializer();
        if (expr == null || typeof expr.accept !== 'function') {
            return `${expr}`;
        }
        return expr.accept(visitor);
    }
    visitAccessMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)}}`;
    }
    visitAccessKeyed(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessKeyedExpression}","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
    }
    visitAccessThis(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessThisExpression}","ancestor":${expr.ancestor}}`;
    }
    visitAccessScope(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor}}`;
    }
    visitArrayLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ArrayLiteralExpression}","elements":${this.serializeExpressions(expr.elements)}}`;
    }
    visitObjectLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ObjectLiteralExpression}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
    }
    visitPrimitiveLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.PrimitiveLiteralExpression}","value":${serializePrimitive(expr.value)}}`;
    }
    visitCallFunction(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallFunctionExpression}","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallScope(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitTaggedTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TaggedTemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"func":${expr.func.accept(this)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitUnary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.UnaryExpression}","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
    }
    visitBinary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BinaryExpression}","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
    }
    visitConditional(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ConditionalExpression}","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
    }
    visitAssign(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AssignExpression}","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
    }
    visitValueConverter(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ValueConverterExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitBindingBehavior(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BindingBehaviorExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitArrayBindingPattern(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ArrayBindingPattern}","elements":${this.serializeExpressions(expr.elements)}}`;
    }
    visitObjectBindingPattern(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ObjectBindingPattern}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
    }
    visitBindingIdentifier(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BindingIdentifier}","name":"${expr.name}"}`;
    }
    visitHtmlLiteral(_expr) { throw new Error('visitHtmlLiteral'); }
    visitForOfStatement(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ForOfStatement}","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
    }
    visitInterpolation(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.Interpolation}","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    serializeExpressions(args) {
        let text = '[';
        for (let i = 0, ii = args.length; i < ii; ++i) {
            if (i !== 0) {
                text += ',';
            }
            text += args[i].accept(this);
        }
        text += ']';
        return text;
    }
}
export function serializePrimitives(values) {
    let text = '[';
    for (let i = 0, ii = values.length; i < ii; ++i) {
        if (i !== 0) {
            text += ',';
        }
        text += serializePrimitive(values[i]);
    }
    text += ']';
    return text;
}
export function serializePrimitive(value) {
    if (typeof value === 'string') {
        return `"\\"${escapeString(value)}\\""`;
    }
    else if (value == null) {
        return `"${value}"`;
    }
    else {
        return `${value}`;
    }
}
function escapeString(str) {
    let ret = '';
    for (let i = 0, ii = str.length; i < ii; ++i) {
        ret += escape(str.charAt(i));
    }
    return ret;
}
function escape(ch) {
    switch (ch) {
        case '\b': return '\\b';
        case '\t': return '\\t';
        case '\n': return '\\n';
        case '\v': return '\\v';
        case '\f': return '\\f';
        case '\r': return '\\r';
        case '"': return '\\"';
        // case '\'': return '\\\''; /* when used in serialization context, escaping `'` (single quote) is not needed as the string is wrapped in a par of `"` (double quote) */
        case '\\': return '\\\\';
        default: return ch;
    }
}
export function deserializePrimitive(value) {
    if (typeof value === 'string') {
        if (value === 'null') {
            return null;
        }
        if (value === 'undefined') {
            return undefined;
        }
        return value.substring(1, value.length - 1);
    }
    else {
        return value;
    }
}
//# sourceMappingURL=ast-serialization.js.map