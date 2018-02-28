import { AstKind, Chain, BindingBehavior, ValueConverter, Assign, Conditional, AccessThis, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, Binary, PrefixNot, LiteralPrimitive, LiteralString, TemplateLiteral, LiteralArray, LiteralObject } from "./framework/binding/ast";
export var getAst = id => Asts[id];
var Asts = {
    1: new AccessScope("name", 0),
    2: new AccessScope("computedName", 0),
    3: new TemplateLiteral(new LiteralString("\r\n    Name tag: "), new AccessScope("computedName", 0), new LiteralString("\r\n  ")),
    4: new CallScope("submit", 0)
};
