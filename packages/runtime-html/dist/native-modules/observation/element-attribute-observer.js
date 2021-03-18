import { subscriberCollection, withFlushQueue } from '../../../../runtime/dist/native-modules/index.js';
/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export class AttributeObserver {
    constructor(platform, observerLocator, obj, propertyKey, targetAttribute) {
        this.platform = platform;
        this.observerLocator = observerLocator;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.targetAttribute = targetAttribute;
        this.value = null;
        this.oldValue = null;
        this.hasChanges = false;
        // layout is not certain, depends on the attribute being flushed to owner element
        // but for simple start, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.f = 0 /* none */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(value, flags) {
        this.value = value;
        this.hasChanges = value !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            this.oldValue = currentValue;
            switch (this.targetAttribute) {
                case 'class': {
                    // Why does class attribute observer setValue look different with class attribute accessor?
                    // ==============
                    // For class list
                    // newValue is simply checked if truthy or falsy
                    // and toggle the class accordingly
                    // -- the rule of this is quite different to normal attribute
                    //
                    // for class attribute, observer is different in a way that it only observes one class at a time
                    // this also comes from syntax, where it would typically be my-class.class="someProperty"
                    //
                    // so there is no need for separating class by space and add all of them like class accessor
                    this.obj.classList.toggle(this.propertyKey, !!currentValue);
                    break;
                }
                case 'style': {
                    let priority = '';
                    let newValue = currentValue;
                    if (typeof newValue === 'string' && newValue.includes('!important')) {
                        priority = 'important';
                        newValue = newValue.replace('!important', '');
                    }
                    this.obj.style.setProperty(this.propertyKey, newValue, priority);
                }
            }
        }
    }
    handleMutation(mutationRecords) {
        let shouldProcess = false;
        for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
            const record = mutationRecords[i];
            if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
                shouldProcess = true;
                break;
            }
        }
        if (shouldProcess) {
            let newValue;
            switch (this.targetAttribute) {
                case 'class':
                    newValue = this.obj.classList.contains(this.propertyKey);
                    break;
                case 'style':
                    newValue = this.obj.style.getPropertyValue(this.propertyKey);
                    break;
                default:
                    throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
            }
            if (newValue !== this.value) {
                this.oldValue = this.value;
                this.value = newValue;
                this.hasChanges = false;
                this.f = 0 /* none */;
                this.queue.add(this);
            }
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.value = this.oldValue = this.obj.getAttribute(this.propertyKey);
            startObservation(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            stopObservation(this.obj, this);
        }
    }
    flush() {
        oV = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
}
subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);
const startObservation = ($MutationObserver, element, subscription) => {
    if (element.$eMObservers === undefined) {
        element.$eMObservers = new Set();
    }
    if (element.$mObserver === undefined) {
        (element.$mObserver = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
    }
    element.$eMObservers.add(subscription);
};
const stopObservation = (element, subscription) => {
    const $eMObservers = element.$eMObservers;
    if ($eMObservers && $eMObservers.delete(subscription)) {
        if ($eMObservers.size === 0) {
            element.$mObserver.disconnect();
            element.$mObserver = undefined;
        }
        return true;
    }
    return false;
};
const handleMutation = (mutationRecords) => {
    mutationRecords[0].target.$eMObservers.forEach(invokeHandleMutation, mutationRecords);
};
function invokeHandleMutation(s) {
    s.handleMutation(this);
}
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;
//# sourceMappingURL=element-attribute-observer.js.map