import { createOverrideContext } from "./framework/binding/scope";
import { getAst } from "./asts";
import { Binding, TextBinding, Listener } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
class $AppView {
    constructor() {
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer,
                computedName: new Observer,
                submit: new Observer
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
            new Binding(getAst(1), targets[3], "name", 1, lookupFunctions),
            new Listener("click", 2, getAst(4), targets[4], true, lookupFunctions)
        ];
        return this;
    }
    bind() {
        var $scope = this.$scope;
        this.$bindings.forEach(b => {
            b.bind($scope);
        });
    }
    attach() {
        this.$view.appendTo(this.$anchor);
    }
    detach() {
        this.$view.remove();
    }
    unbind() {
        var $scope = this.$scope;
        this.$bindings.forEach(b => {
            b.unbind($scope);
        });
    }
    get name() { return this.$observers.name.getValue(); }
    set name(v) { this.$observers.name.setValue(v); }
    get computedName() { return this.$observers.computedName.getValue(); }
    set computedName(v) { this.$observers.computedName.setValue(v); }
    get submit() { return this.$observers.submit.getValue(); }
    set submit(v) { this.$observers.submit.setValue(v); }
}
$AppView.$html = new Template(`\n  <require from="./name-tag"></require>\n\n  <div class="au"><au-marker class="au"></au-marker> </div>\n  <input class="au" />\n  <name-tag class="au"></name-tag>\n  <button class="au"></button>\n`);
export class AppCustomElement extends $AppView {
    constructor() {
        super();
    }
    bind() {
        super.bind();
    }
    submit() {
    }
}
