import { DelegationStrategy } from '@aurelia/runtime';
export class TextBindingInstruction {
    constructor(from) {
        this.from = from;
        this.type = "ha" /* textBinding */;
    }
}
export class TriggerBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = true;
        this.strategy = DelegationStrategy.none;
    }
}
export class DelegateBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.bubbling;
    }
}
export class CaptureBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.capturing;
    }
}
export class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hd" /* stylePropertyBinding */;
    }
}
export class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
        this.type = "he" /* setAttribute */;
    }
}
export class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hf" /* setClassAttribute */;
    }
}
export class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hg" /* setStyleAttribute */;
    }
}
export class AttributeBindingInstruction {
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr, from, to) {
        this.attr = attr;
        this.from = from;
        this.to = to;
        this.type = "hc" /* attributeBinding */;
    }
}
//# sourceMappingURL=instructions.js.map