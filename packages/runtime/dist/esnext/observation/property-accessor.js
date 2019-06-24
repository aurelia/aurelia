import { Tracer } from '@aurelia/kernel';
const slice = Array.prototype.slice;
export class PropertyAccessor {
    constructor(obj, propertyKey) {
        if (Tracer.enabled) {
            Tracer.enter('PropertyAccessor', 'constructor', slice.call(arguments));
        }
        this.obj = obj;
        this.propertyKey = propertyKey;
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(value) {
        this.obj[this.propertyKey] = value;
    }
}
//# sourceMappingURL=property-accessor.js.map