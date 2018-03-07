import { createOverrideContext } from "./framework/binding/scope";
import { getAst } from "./asts";
import { Binding, TextBinding, Listener } from "./framework/binding/binding";
import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
export class NameTag {
    @bindable
    name;
}
export class $NameTagView extends NameTag {
    constructor() {
        super();
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer,
                color: new Observer,
                borderColor: new Observer,
                borderWidth: new Observer,
                showHeader: new Observer
            },
            configurable: true
        });
    }
    static $html = new Template(`\n  <header>Aurelia Name Tag</header>\n  <div>\n    <input type="text" class="au" /><br />\n    <span class="au" style="font-weight: bold; padding: 10px 0;"><au-marker class="au"></au-marker> </span>\n  </div>\n  <hr />\n  <div>\n    <label>\n      Name tag color:\n      <select class="au">\n        <option>red</option>\n        <option>green</option>\n        <option>blue</option>\n      </select>\n    </label>\n  </div>\n  <hr />\n  <div>\n    <label>\n      Name tag border color:\n      <select class="au">\n        <option>orange</option>\n        <option>black</option>\n        <option>rgba(0,0,0,0.5)</option>\n      </select>\n    </label>\n  </div>\n  <hr />\n  <div>\n    <label>\n      Name tag border width:\n      <input type="number" min="1" step="1" max="10" class="au" />\n    </label>\n  </div>\n  <div>\n    <label>\n      Show header:\n      <input type="checkbox" class="au" />\n    </label>\n  </div>\n  <button class="au">Reset</button>\n`);
    applyTo(anchor: Element) {
        this.$anchor = anchor;
        this.$view = $NameTagView.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new Binding(getAst(1), targets[0], "value", 2, lookupFunctions),
            new TextBinding(getAst(2), targets[1], lookupFunctions),
            new Binding(getAst(3), targets[2], "value", 2, lookupFunctions),
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
export class AppCustomElement {
    constructor() {
    }
    submit() {
    }
}
export class $AppView extends AppCustomElement {
    constructor() {
        super();
        this.$scope = {
            bindingContext: this,
            overrideContext: createOverrideContext(this)
        };
        Object.defineProperty(this, "$observers", {
            value: {
                name: new Observer,
                computedName: new Observer
            },
            configurable: true
        });
    }
    static $html = new Template(`\n  \n\n  <div class="au"><au-marker class="au"></au-marker> </div>\n  <input class="au" />\n  <name-tag class="au"></name-tag>\n  <button class="au"></button>\n`);
    applyTo(anchor: Element) {
        this.$anchor = anchor;
        this.$view = $AppView.$html.create();
        var targets = this.$view.targets;
        this.$bindings = [
            new Binding(getAst(1), targets[0], "class", 1, lookupFunctions),
            new Binding(getAst(8), targets[0], "textcontent", 1, lookupFunctions),
            new TextBinding(getAst(2), targets[1], lookupFunctions),
            new Binding(getAst(1), targets[2], "value", 2, lookupFunctions),
            this.$b0 = (new NameTag).applyTo(targets[3]),
            new Binding(getAst(1), this.$b1, "name", 1, lookupFunctions),
            new Listener("click", 2, getAst(7), targets[4], true, lookupFunctions)
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
}
