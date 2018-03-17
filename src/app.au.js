import { createOverrideContext } from "./framework/binding/scope";
import { getAst } from "./asts";
import { Binding, TextBinding, Listener } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
import { NameTag } from "src/name-tag.au";
class $AppCustomElement {
    constructor() {
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer("Aurelia Navigation Skeleton"),
                computedName: new Observer("Testing"),
                color: new Observer
            },
            configurable: true
        });
    }
    submit() {
    }
}
export class AppCustomElement extends $AppCustomElement {
    static $html = new Template(`<div class="au"><au-marker class="au"></au-marker> </div>\n  <input class="au" />\n  <name-tag class="au"></name-tag>\n  <hr />\n  <name-tag class="au"></name-tag>\n  <hr />\n  <name-tag class="au"></name-tag>\n  <button class="au"></button>\n  <!-- this should not create custom element -->\n  <color class="au" />`);
    constructor() {
        super();
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
    }
    applyTo(anchor) {
        this.$anchor = anchor;
        this.$view = $AppCustomElement.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new Binding(getAst(3), targets[0], "class", 1, lookupFunctions),
            new Binding(getAst(8), targets[0], "textcontent", 1, lookupFunctions),
            new TextBinding(getAst(1), targets[1], lookupFunctions),
            new Binding(getAst(3), targets[2], "value", 2, lookupFunctions),
            this.$b0 = (new NameTag).applyTo(targets[3]),
            new Binding(getAst(3), this.$b0, "name", 1, lookupFunctions),
            this.$b1 = (new NameTag).applyTo(targets[4]),
            new Binding(getAst(3), this.$b1, "name", 1, lookupFunctions),
            this.$b2 = (new NameTag).applyTo(targets[5]),
            new Binding(getAst(3), this.$b2, "name", 1, lookupFunctions),
            new Listener("click", 2, getAst(7), targets[6], true, lookupFunctions),
            new Binding(getAst(3), targets[7], "color", 1, lookupFunctions)
        ];
        return this;
    }
    bind() {
        var $scope = this.$scope;
        this.$bindings.forEach(b => {
            b.bind($scope);
        });
        super.bind($scope);
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
    get color() { return this.$observers.color.getValue(); }
    set color(v) { this.$observers.color.setValue(v); }
}
