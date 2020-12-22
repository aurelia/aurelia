export class PropertyAccessor {
    constructor() {
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = 0 /* None */;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, flags, obj, key) {
        obj[key] = value;
    }
}
//# sourceMappingURL=property-accessor.js.map