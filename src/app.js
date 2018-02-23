import { AstKind, Chain, BindingBehavior, ValueConverter, Assign, Conditional, AccessThis, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, Binary, PrefixNot, LiteralPrimitive, LiteralString, LiteralArray, LiteralObject } from "./core";
class $App {
    constructor() {
        this.$observers = {
            name: new Observer("")
        };
        this.$html = "<div class=\"au\"><au-marker></au-marker> </div>\n  <input value.bind=\"name\" />";
    }
    get name() { return this.$observer.getValue(); }
    set name(value) { this.$observer.setValue(value); }
}
export class App extends $App {
    submit() {
    }
}
