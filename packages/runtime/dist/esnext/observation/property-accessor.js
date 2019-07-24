const slice = Array.prototype.slice;
export class PropertyAccessor {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        if (obj.$observers !== void 0
            && obj.$observers[propertyKey] !== void 0
            && obj.$observers[propertyKey].setValue !== void 0) {
            this.setValue = this.setValueDirect;
        }
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(value, flags) {
        this.obj[this.propertyKey] = value;
    }
    setValueDirect(value, flags) {
        this.obj.$observers[this.propertyKey].setValue(value, flags);
    }
}
//# sourceMappingURL=property-accessor.js.map