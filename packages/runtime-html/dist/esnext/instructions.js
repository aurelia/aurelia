import { DelegationStrategy } from '@aurelia/runtime';
export class TextBindingInstruction {
    constructor(from) {
        this.type = "ha" /* textBinding */;
        this.from = from;
    }
}
export class TriggerBindingInstruction {
    constructor(from, to) {
        this.type = "hb" /* listenerBinding */;
        this.from = from;
        this.preventDefault = true;
        this.strategy = DelegationStrategy.none;
        this.to = to;
    }
}
export class DelegateBindingInstruction {
    constructor(from, to) {
        this.type = "hb" /* listenerBinding */;
        this.from = from;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.bubbling;
        this.to = to;
    }
}
export class CaptureBindingInstruction {
    constructor(from, to) {
        this.type = "hb" /* listenerBinding */;
        this.from = from;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.capturing;
        this.to = to;
    }
}
export class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.type = "hd" /* stylePropertyBinding */;
        this.from = from;
        this.to = to;
    }
}
export class SetAttributeInstruction {
    constructor(value, to) {
        this.type = "he" /* setAttribute */;
        this.to = to;
        this.value = value;
    }
}
export class SetClassAttributeInstruction {
    constructor(value) {
        this.type = "hf" /* setClassAttribute */;
        this.value = value;
    }
}
export class SetStyleAttributeInstruction {
    constructor(value) {
        this.type = "hg" /* setStyleAttribute */;
        this.value = value;
    }
}
export class AttributeBindingInstruction {
    constructor(attr, from, to) {
        this.type = "hc" /* attributeBinding */;
        this.from = from;
        this.attr = attr;
        this.to = to;
    }
}
//# sourceMappingURL=instructions.js.map