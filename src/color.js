import { createOverrideContext } from "./framework/binding/scope";
import { getAst } from "./asts";
import { Binding, TextBinding, Listener } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
class $Color {
    colors = [];
    constructor() {
        Object.defineProperty(this, "$observers", {
            value: {
                color: new Observer("#fff")
            },
            configurable: true
        });
        this.color = "rgba(255, 15, 255, 0.5)";
    }
}
export class Color extends $Color {
    static $html = new Template(`<span style="display: inline-block"><au-marker class="au"></au-marker> </span>\n  <select class="au">\n    <option>red</option>\n    <option>green</option>\n    <option>blue</option>\n  </select>`);
    constructor() {
        super();
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
    }
    applyTo(anchor) {
        this.$anchor = anchor;
        this.$view = $Color.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new TextBinding(getAst(1), targets[0], lookupFunctions),
            new Binding(getAst(2), targets[1], "value", 2, lookupFunctions)
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
    get color() { return this.$observers.color.getValue(); }
    set color(v) { this.$observers.color.setValue(v); }
}
