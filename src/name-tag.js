import { createOverrideContext } from "./framework/binding/scope";
import { getAst } from "./asts";
import { Binding, TextBinding, Listener } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
import { Color } from "src/color.au";
class $NameTag {
    constructor() {
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer("Aurelia"),
                color: new Observer("violet"),
                borderColor: new Observer,
                borderWidth: new Observer,
                showHeader: new Observer
            },
            configurable: true
        });
    }
}
export class NameTag extends $NameTag {
    static $html = new Template(`<header>Aurelia Name Tag</header>\n  <div>\n    <input type="text" class="au" /><br />\n    <span class="au" style="font-weight: bold; padding: 10px 0;"><au-marker class="au"></au-marker> </span>\n  </div>\n  <hr />\n  <div>\n    <color class="au" />\n  </div>\n  <hr />\n  <div>\n    <label>\n      Name tag border color:\n      <select class="au">\n        <option>orange</option>\n        <option>black</option>\n        <option>rgba(0,0,0,0.5)</option>\n      </select>\n    </label>\n  </div>\n  <hr />\n  <div>\n    <label>\n      Name tag border width:\n      <input type="number" min="1" step="1" max="10" class="au" />\n    </label>\n  </div>\n  <div>\n    <label>\n      Show header:\n      <input type="checkbox" class="au" />\n    </label>\n  </div>\n  <button class="au">Reset</button>`);
    constructor() {
        super();
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
    }
    applyTo(anchor) {
        this.$anchor = anchor;
        this.$view = $NameTag.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new Binding(getAst(3), targets[0], "value", 2, lookupFunctions),
            new TextBinding(getAst(1), targets[1], lookupFunctions),
            this.$b0 = (new Color).applyTo(targets[2]),
            new Binding(getAst(2), this.$b0, "color", 1, lookupFunctions),
            new Binding(getAst(4), targets[3], "value", 2, lookupFunctions),
            new Binding(getAst(5), targets[4], "value", 2, lookupFunctions),
            new Binding(getAst(6), targets[5], "value", 2, lookupFunctions),
            new Listener("click", 0, getAst(7), targets[6], true, lookupFunctions)
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
    get color() { return this.$observers.color.getValue(); }
    set color(v) { this.$observers.color.setValue(v); }
    get borderColor() { return this.$observers.borderColor.getValue(); }
    set borderColor(v) { this.$observers.borderColor.setValue(v); }
    get borderWidth() { return this.$observers.borderWidth.getValue(); }
    set borderWidth(v) { this.$observers.borderWidth.setValue(v); }
    get showHeader() { return this.$observers.showHeader.getValue(); }
    set showHeader(v) { this.$observers.showHeader.setValue(v); }
}
