(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AST = require("@aurelia/runtime");
    const astTypeMap = [
        { type: AST.AccessKeyedExpression, name: 'AccessKeyedExpression' },
        { type: AST.AccessMemberExpression, name: 'AccessMemberExpression' },
        { type: AST.AccessScopeExpression, name: 'AccessScopeExpression' },
        { type: AST.AccessThisExpression, name: 'AccessThisExpression' },
        { type: AST.ArrayBindingPattern, name: 'ArrayBindingPattern' },
        { type: AST.ArrayLiteralExpression, name: 'ArrayLiteralExpression' },
        { type: AST.AssignExpression, name: 'AssignExpression' },
        { type: AST.BinaryExpression, name: 'BinaryExpression' },
        { type: AST.BindingBehaviorExpression, name: 'BindingBehaviorExpression' },
        { type: AST.BindingIdentifier, name: 'BindingIdentifier' },
        { type: AST.CallFunctionExpression, name: 'CallFunctionExpression' },
        { type: AST.CallMemberExpression, name: 'CallMemberExpression' },
        { type: AST.CallScopeExpression, name: 'CallScopeExpression' },
        { type: AST.ConditionalExpression, name: 'ConditionalExpression' },
        { type: AST.ForOfStatement, name: 'ForOfStatement' },
        { type: AST.HtmlLiteralExpression, name: 'HtmlLiteralExpression' },
        { type: AST.Interpolation, name: 'Interpolation' },
        { type: AST.ObjectBindingPattern, name: 'ObjectBindingPattern' },
        { type: AST.ObjectLiteralExpression, name: 'ObjectLiteralExpression' },
        { type: AST.PrimitiveLiteralExpression, name: 'PrimitiveLiteralExpression' },
        { type: AST.TaggedTemplateExpression, name: 'TaggedTemplateExpression' },
        { type: AST.TemplateExpression, name: 'TemplateExpression' },
        { type: AST.UnaryExpression, name: 'UnaryExpression' },
        { type: AST.ValueConverterExpression, name: 'ValueConverterExpression' }
    ];
    function enableImprovedExpressionDebugging() {
        astTypeMap.forEach(x => { adoptDebugMethods(x.type, x.name); });
    }
    exports.enableImprovedExpressionDebugging = enableImprovedExpressionDebugging;
    /** @internal */
    function adoptDebugMethods($type, name) {
        $type.prototype.toString = function () { return Unparser.unparse(this); };
    }
    exports.adoptDebugMethods = adoptDebugMethods;
    class Unparser {
        constructor() {
            this.text = '';
        }
        static unparse(expr) {
            const visitor = new Unparser();
            expr.accept(visitor);
            return visitor.text;
        }
        visitAccessMember(expr) {
            expr.object.accept(this);
            this.text += `.${expr.name}`;
        }
        visitAccessKeyed(expr) {
            expr.object.accept(this);
            this.text += '[';
            expr.key.accept(this);
            this.text += ']';
        }
        visitAccessThis(expr) {
            if (expr.ancestor === 0) {
                this.text += '$this';
                return;
            }
            this.text += '$parent';
            let i = expr.ancestor - 1;
            while (i--) {
                this.text += '.$parent';
            }
        }
        visitAccessScope(expr) {
            let i = expr.ancestor;
            while (i--) {
                this.text += '$parent.';
            }
            this.text += expr.name;
        }
        visitArrayLiteral(expr) {
            const elements = expr.elements;
            this.text += '[';
            for (let i = 0, length = elements.length; i < length; ++i) {
                if (i !== 0) {
                    this.text += ',';
                }
                elements[i].accept(this);
            }
            this.text += ']';
        }
        visitObjectLiteral(expr) {
            const keys = expr.keys;
            const values = expr.values;
            this.text += '{';
            for (let i = 0, length = keys.length; i < length; ++i) {
                if (i !== 0) {
                    this.text += ',';
                }
                this.text += `'${keys[i]}':`;
                values[i].accept(this);
            }
            this.text += '}';
        }
        visitPrimitiveLiteral(expr) {
            this.text += '(';
            if (typeof expr.value === 'string') {
                const escaped = expr.value.replace(/'/g, '\\\'');
                this.text += `'${escaped}'`;
            }
            else {
                this.text += `${expr.value}`;
            }
            this.text += ')';
        }
        visitCallFunction(expr) {
            this.text += '(';
            expr.func.accept(this);
            this.writeArgs(expr.args);
            this.text += ')';
        }
        visitCallMember(expr) {
            this.text += '(';
            expr.object.accept(this);
            this.text += `.${expr.name}`;
            this.writeArgs(expr.args);
            this.text += ')';
        }
        visitCallScope(expr) {
            this.text += '(';
            let i = expr.ancestor;
            while (i--) {
                this.text += '$parent.';
            }
            this.text += expr.name;
            this.writeArgs(expr.args);
            this.text += ')';
        }
        visitTemplate(expr) {
            const { cooked, expressions } = expr;
            const length = expressions.length;
            this.text += '`';
            this.text += cooked[0];
            for (let i = 0; i < length; i++) {
                expressions[i].accept(this);
                this.text += cooked[i + 1];
            }
            this.text += '`';
        }
        visitTaggedTemplate(expr) {
            const { cooked, expressions } = expr;
            const length = expressions.length;
            expr.func.accept(this);
            this.text += '`';
            this.text += cooked[0];
            for (let i = 0; i < length; i++) {
                expressions[i].accept(this);
                this.text += cooked[i + 1];
            }
            this.text += '`';
        }
        visitUnary(expr) {
            this.text += `(${expr.operation}`;
            if (expr.operation.charCodeAt(0) >= /* a */ 97) {
                this.text += ' ';
            }
            expr.expression.accept(this);
            this.text += ')';
        }
        visitBinary(expr) {
            this.text += '(';
            expr.left.accept(this);
            if (expr.operation.charCodeAt(0) === /* i */ 105) {
                this.text += ` ${expr.operation} `;
            }
            else {
                this.text += expr.operation;
            }
            expr.right.accept(this);
            this.text += ')';
        }
        visitConditional(expr) {
            this.text += '(';
            expr.condition.accept(this);
            this.text += '?';
            expr.yes.accept(this);
            this.text += ':';
            expr.no.accept(this);
            this.text += ')';
        }
        visitAssign(expr) {
            this.text += '(';
            expr.target.accept(this);
            this.text += '=';
            expr.value.accept(this);
            this.text += ')';
        }
        visitValueConverter(expr) {
            const args = expr.args;
            expr.expression.accept(this);
            this.text += `|${expr.name}`;
            for (let i = 0, length = args.length; i < length; ++i) {
                this.text += ':';
                args[i].accept(this);
            }
        }
        visitBindingBehavior(expr) {
            const args = expr.args;
            expr.expression.accept(this);
            this.text += `&${expr.name}`;
            for (let i = 0, length = args.length; i < length; ++i) {
                this.text += ':';
                args[i].accept(this);
            }
        }
        visitArrayBindingPattern(expr) {
            const elements = expr.elements;
            this.text += '[';
            for (let i = 0, length = elements.length; i < length; ++i) {
                if (i !== 0) {
                    this.text += ',';
                }
                elements[i].accept(this);
            }
            this.text += ']';
        }
        visitObjectBindingPattern(expr) {
            const keys = expr.keys;
            const values = expr.values;
            this.text += '{';
            for (let i = 0, length = keys.length; i < length; ++i) {
                if (i !== 0) {
                    this.text += ',';
                }
                this.text += `'${keys[i]}':`;
                values[i].accept(this);
            }
            this.text += '}';
        }
        visitBindingIdentifier(expr) {
            this.text += expr.name;
        }
        visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
        visitForOfStatement(expr) {
            expr.declaration.accept(this);
            this.text += ' of ';
            expr.iterable.accept(this);
        }
        visitInterpolation(expr) {
            const { parts, expressions } = expr;
            const length = expressions.length;
            this.text += '${';
            this.text += parts[0];
            for (let i = 0; i < length; i++) {
                expressions[i].accept(this);
                this.text += parts[i + 1];
            }
            this.text += '}';
        }
        writeArgs(args) {
            this.text += '(';
            for (let i = 0, length = args.length; i < length; ++i) {
                if (i !== 0) {
                    this.text += ',';
                }
                args[i].accept(this);
            }
            this.text += ')';
        }
    }
    exports.Unparser = Unparser;
    class Serializer {
        static serialize(expr) {
            const visitor = new Serializer();
            if (expr == null || typeof expr.accept !== 'function') {
                return `${expr}`;
            }
            return expr.accept(visitor);
        }
        visitAccessMember(expr) {
            return `{"type":"AccessMemberExpression","name":${expr.name},"object":${expr.object.accept(this)}}`;
        }
        visitAccessKeyed(expr) {
            return `{"type":"AccessKeyedExpression","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
        }
        visitAccessThis(expr) {
            return `{"type":"AccessThisExpression","ancestor":${expr.ancestor}}`;
        }
        visitAccessScope(expr) {
            return `{"type":"AccessScopeExpression","name":"${expr.name}","ancestor":${expr.ancestor}}`;
        }
        visitArrayLiteral(expr) {
            return `{"type":"ArrayLiteralExpression","elements":${this.serializeExpressions(expr.elements)}}`;
        }
        visitObjectLiteral(expr) {
            return `{"type":"ObjectLiteralExpression","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
        }
        visitPrimitiveLiteral(expr) {
            return `{"type":"PrimitiveLiteralExpression","value":${serializePrimitive(expr.value)}}`;
        }
        visitCallFunction(expr) {
            return `{"type":"CallFunctionExpression","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
        }
        visitCallMember(expr) {
            return `{"type":"CallMemberExpression","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
        }
        visitCallScope(expr) {
            return `{"type":"CallScopeExpression","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
        }
        visitTemplate(expr) {
            return `{"type":"TemplateExpression","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
        }
        visitTaggedTemplate(expr) {
            return `{"type":"TaggedTemplateExpression","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
        }
        visitUnary(expr) {
            return `{"type":"UnaryExpression","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
        }
        visitBinary(expr) {
            return `{"type":"BinaryExpression","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
        }
        visitConditional(expr) {
            return `{"type":"ConditionalExpression","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
        }
        visitAssign(expr) {
            return `{"type":"AssignExpression","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
        }
        visitValueConverter(expr) {
            return `{"type":"ValueConverterExpression","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
        }
        visitBindingBehavior(expr) {
            return `{"type":"BindingBehaviorExpression","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
        }
        visitArrayBindingPattern(expr) {
            return `{"type":"ArrayBindingPattern","elements":${this.serializeExpressions(expr.elements)}}`;
        }
        visitObjectBindingPattern(expr) {
            return `{"type":"ObjectBindingPattern","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
        }
        visitBindingIdentifier(expr) {
            return `{"type":"BindingIdentifier","name":"${expr.name}"}`;
        }
        visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
        visitForOfStatement(expr) {
            return `{"type":"ForOfStatement","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
        }
        visitInterpolation(expr) {
            return `{"type":"Interpolation","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
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
    exports.Serializer = Serializer;
    function serializePrimitives(values) {
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
    function serializePrimitive(value) {
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
            case '\'': return '\\\'';
            case '\\': return '\\\\';
            default: return ch;
        }
    }
});
//# sourceMappingURL=unparser.js.map