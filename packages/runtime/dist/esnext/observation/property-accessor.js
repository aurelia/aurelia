export class PropertyAccessor {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = 4 /* Obj */;
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