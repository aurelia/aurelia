import { PLATFORM } from '@aurelia/kernel';
const slice = Array.prototype.slice;
const noop = PLATFORM.noop;
// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
export class PrimitiveObserver {
    constructor(obj, propertyKey) {
        this.doNotCache = true;
        // we don't need to store propertyName because only 'length' can return a useful value
        if (propertyKey === 'length') {
            // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
            this.obj = obj;
            this.getValue = this.getStringLength;
        }
        else {
            this.getValue = this.returnUndefined;
        }
    }
    getStringLength() {
        return this.obj.length;
    }
    returnUndefined() {
        return undefined;
    }
}
PrimitiveObserver.prototype.setValue = noop;
PrimitiveObserver.prototype.subscribe = noop;
PrimitiveObserver.prototype.unsubscribe = noop;
PrimitiveObserver.prototype.dispose = noop;
//# sourceMappingURL=primitive-observer.js.map