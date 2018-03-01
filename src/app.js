import { getAst } from "./asts";
import { Binding, TextBinding } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
class $AppView {
    constructor() {
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer(""),
                computedName: new Observer(""),
                submit: new Observer("")
            },
            configurable: true
        });
    }
    applyTo(anchor) {
        this.$anchor = anchor;
        this.$view = $AppView.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new Binding(getAst(1), targets[0], "class", 1, lookupFunctions),
            new Binding(getAst(2), targets[0], "textcontent", 1, lookupFunctions),
            new TextBinding(getAst(3), targets[1], lookupFunctions),
            new Binding(getAst(1), targets[2], "value", 2, lookupFunctions),
            new Listener("click", 2, getAst(4), targets[3], true, lookupFunctions)
        ];
        return this;
    }
    bind() {
        var $scope = this.$scope;
        this.$bindings.forEach(b => {
            b.bind($scope);
        });
    }
    unbind() {
        var $scope = this.$scope;
        this.$bindings.forEach(b => {
            b.unbind($scope);
        });
    }
    get name() { return this.$observers.getValue(); }
    set name(v) { this.$observers.setValue(v); }
    get computedName() { return this.$observers.getValue(); }
    set computedName(v) { this.$observers.setValue(v); }
    get submit() { return this.$observers.getValue(); }
    set submit(v) { this.$observers.setValue(v); }
}
$AppView.$html = new Template("<div class=\"au\"><au-marker class=\"au\"></au-marker> </div>\r\n  <input class=\"au\" />\r\n  <button class=\"au\"></button>\r\n");
export class AppCustomElement extends $AppView {
    constructor() {
    }
    bind() {
        super.bind();
    }
    submit() {
    }
}
