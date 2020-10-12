export class PropertyAccessor {
    constructor() {
        this.task = null;
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = 4 /* Obj */;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, flags, obj, key) {
        obj[key] = value;
    }
}
export const propertyAccessor = new PropertyAccessor();
//# sourceMappingURL=property-accessor.js.map