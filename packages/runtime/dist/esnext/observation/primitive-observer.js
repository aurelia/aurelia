import { PLATFORM } from '@aurelia/kernel';
const slice = Array.prototype.slice;
// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
export class PrimitiveObserver {
    constructor(obj, propertyKey) {
        this.doNotCache = true;
        this.type = 0 /* None */;
        this.task = null;
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
((proto, noop) => {
    proto.setValue = noop;
    proto.subscribe = noop;
    proto.unsubscribe = noop;
    proto.dispose = noop;
})(PrimitiveObserver.prototype, PLATFORM.noop);
//# sourceMappingURL=primitive-observer.js.map