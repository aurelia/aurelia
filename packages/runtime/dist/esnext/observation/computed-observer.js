import { __decorate } from "tslib";
import { PLATFORM, Reporter } from '@aurelia/kernel';
import { subscriberCollection } from './subscriber-collection';
const slice = Array.prototype.slice;
export function computed(config) {
    return function (target, key) {
        /**
         * The 'computed' property defined on prototype needs to be non-enumerable to prevent getting this in loops,
         * iterating over object properties, such as for..in.
         *
         * The 'value' of the property should not have any prototype. Otherwise if by mistake the target passed
         * here is `Object`, then we are in soup. Because then every instance of `Object` will have the `computed`
         * property, including the `value` (in the descriptor of the property), when assigned `{}`. This might
         * lead to infinite recursion for the cases as mentioned above.
         */
        if (!target.computed) {
            Reflect.defineProperty(target, 'computed', {
                writable: true,
                configurable: true,
                enumerable: false,
                value: Object.create(null)
            });
        }
        target.computed[key] = config;
    };
}
const computedOverrideDefaults = { static: false, volatile: false };
/* @internal */
export function createComputedObserver(flags, observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
    if (descriptor.configurable === false) {
        return dirtyChecker.createProperty(instance, propertyName);
    }
    if (descriptor.get) {
        const { constructor: { prototype: { computed: givenOverrides } } } = instance;
        const overrides = givenOverrides && givenOverrides[propertyName] || computedOverrideDefaults;
        if (descriptor.set) {
            if (overrides.volatile) {
                return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
            }
            return new CustomSetterObserver(instance, propertyName, descriptor);
        }
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
    }
    throw Reporter.error(18, propertyName);
}
// Used when the getter is dependent solely on changes that happen within the setter.
let CustomSetterObserver = class CustomSetterObserver {
    constructor(obj, propertyKey, descriptor) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = this.oldValue = undefined;
        this.descriptor = descriptor;
        this.observing = false;
    }
    setValue(newValue) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.descriptor.set.call(this.obj, newValue); // Non-null is implied because descriptors without setters won't end up here
        if (this.currentValue !== newValue) {
            this.oldValue = this.currentValue;
            this.currentValue = newValue;
            this.callSubscribers(newValue, this.oldValue, 16 /* updateTargetInstance */);
        }
    }
    subscribe(subscriber) {
        if (!this.observing) {
            this.convertProperty();
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
    }
    convertProperty() {
        this.observing = true;
        this.currentValue = this.obj[this.propertyKey];
        const set = (newValue) => { this.setValue(newValue); };
        Reflect.defineProperty(this.obj, this.propertyKey, { set, get: this.descriptor.get });
    }
};
CustomSetterObserver = __decorate([
    subscriberCollection()
], CustomSetterObserver);
export { CustomSetterObserver };
// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
let GetterObserver = class GetterObserver {
    constructor(flags, overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.isCollecting = false;
        this.currentValue = this.oldValue = undefined;
        this.propertyDeps = [];
        this.collectionDeps = [];
        this.overrides = overrides;
        this.subscriberCount = 0;
        this.descriptor = descriptor;
        this.proxy = new Proxy(obj, createGetterTraps(flags, observerLocator, this));
        const get = () => this.getValue();
        Reflect.defineProperty(obj, propertyKey, { get, set: descriptor.set });
    }
    addPropertyDep(subscribable) {
        if (!this.propertyDeps.includes(subscribable)) {
            this.propertyDeps.push(subscribable);
        }
    }
    addCollectionDep(subscribable) {
        if (!this.collectionDeps.includes(subscribable)) {
            this.collectionDeps.push(subscribable);
        }
    }
    getValue() {
        if (this.subscriberCount === 0 || this.isCollecting) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.currentValue = Reflect.apply(this.descriptor.get, this.proxy, PLATFORM.emptyArray); // Non-null is implied because descriptors without getters won't end up here
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.currentValue = Reflect.apply(this.descriptor.get, this.obj, PLATFORM.emptyArray); // Non-null is implied because descriptors without getters won't end up here
        }
        return this.currentValue;
    }
    subscribe(subscriber) {
        this.addSubscriber(subscriber);
        if (++this.subscriberCount === 1) {
            this.getValueAndCollectDependencies(true);
        }
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
        if (--this.subscriberCount === 0) {
            this.unsubscribeAllDependencies();
        }
    }
    handleChange() {
        const oldValue = this.currentValue;
        const newValue = this.getValueAndCollectDependencies(false);
        if (oldValue !== newValue) {
            this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
        }
    }
    handleCollectionChange() {
        const oldValue = this.currentValue;
        const newValue = this.getValueAndCollectDependencies(false);
        if (oldValue !== newValue) {
            this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
        }
    }
    getValueAndCollectDependencies(requireCollect) {
        const dynamicDependencies = !this.overrides.static || requireCollect;
        if (dynamicDependencies) {
            this.unsubscribeAllDependencies();
            this.isCollecting = true;
        }
        this.currentValue = this.getValue();
        if (dynamicDependencies) {
            this.propertyDeps.forEach(x => { x.subscribe(this); });
            this.collectionDeps.forEach(x => { x.subscribeToCollection(this); });
            this.isCollecting = false;
        }
        return this.currentValue;
    }
    doNotCollect(key) {
        return !this.isCollecting || key === '$observers';
    }
    unsubscribeAllDependencies() {
        this.propertyDeps.forEach(x => { x.unsubscribe(this); });
        this.propertyDeps.length = 0;
        this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
        this.collectionDeps.length = 0;
    }
};
GetterObserver = __decorate([
    subscriberCollection()
], GetterObserver);
export { GetterObserver };
const toStringTag = Object.prototype.toString;
function createGetterTraps(flags, observerLocator, observer) {
    const traps = {
        get: function (target, key, receiver) {
            if (observer.doNotCollect(key)) {
                return Reflect.get(target, key, receiver);
            }
            // The length and iterator properties need to be invoked on the original object (for Map and Set
            // at least) or they will throw.
            switch (toStringTag.call(target)) {
                case '[object Array]':
                    observer.addCollectionDep(observerLocator.getArrayObserver(flags, target));
                    if (key === 'length') {
                        return Reflect.get(target, key, target);
                    }
                case '[object Map]':
                    observer.addCollectionDep(observerLocator.getMapObserver(flags, target));
                    if (key === 'size') {
                        return Reflect.get(target, key, target);
                    }
                case '[object Set]':
                    observer.addCollectionDep(observerLocator.getSetObserver(flags, target));
                    if (key === 'size') {
                        return Reflect.get(target, key, target);
                    }
                default:
                    observer.addPropertyDep(observerLocator.getObserver(flags, target, key));
            }
            return proxyOrValue(flags, target, key, observerLocator, observer);
        }
    };
    return traps;
}
function proxyOrValue(flags, target, key, observerLocator, observer) {
    const value = Reflect.get(target, key, target);
    if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return target[key].bind(target); // We need Function's bind() method here
    }
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}
//# sourceMappingURL=computed-observer.js.map