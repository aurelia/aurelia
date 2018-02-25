import { AstKind, Chain, BindingBehavior, ValueConverter, Assign, Conditional, AccessThis, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, Binary, PrefixNot, LiteralPrimitive, LiteralString, TemplateLiteral, LiteralArray, LiteralObject } from "./core";
class $App {
    constructor() {
        this.$observers = {
            name: new Observer(""),
            computedName: new Observer(""),
            submit: new Observer("")
        };
    }
    get name() { return this.$observer.getValue(); }
    set name(value) { this.$observer.setValue(value); }
    get computedName() { return this.$observer.getValue(); }
    set computedName(value) { this.$observer.setValue(value); }
    get submit() { return this.$observer.getValue(); }
    set submit(value) { this.$observer.setValue(value); }
}
$App.$html = "<div class=\"au\"><au-marker class=\"au\"></au-marker> </div>\n  <input class=\"au\" />\n  <button class=\"au\"></button>\n";
$App.$bindings = [
    [0, 1, [8, "name", 0], "class", 1],
    [0, 1, [8, "computedName", 0], "textcontent", 1],
    [1, 4, [20, [[19, "\n    Name tag: "], [8, "computedName", 0], [19, "\n  "]]]],
    [2, 1, [8, "name", 0], "value", 2],
    [3, 2, [11, "submit", [], 0], "click", 1]
];
export class App extends $App {
    submit() {
    }
}
