var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/* eslint-disable eqeqeq, compat/compat */
import { PLATFORM, Reporter, isArrayIndex } from '@aurelia/kernel';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection } from './subscriber-collection';
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
        if (target.computed == null) {
            Reflect.defineProperty(target, 'computed', {
                writable: true,
                configurable: true,
                enumerable: false,
                value: Object.create(null)
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        target.computed[key] = config;
    };
}
const computedOverrideDefaults = { static: false, volatile: false };
/* @internal */
export function createComputedObserver(flags, observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
    if (descriptor.configurable === false) {
        return dirtyChecker.createProperty(instance, propertyName);
    }
    if (descriptor.get != null) {
        const { constructor: { prototype: { computed: givenOverrides } } } = instance;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-type-assertion
        const overrides = givenOverrides && givenOverrides[propertyName] || computedOverrideDefaults;
        if (descriptor.set != null) {
            if (overrides.volatile) {
                return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
            }
            return new CustomSetterObserver(instance, propertyName, descriptor);
        }
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
    }
    throw Reporter.error(18, propertyName);
}
// Used when the getter is dependent solely on changes that happen within the setter.
let CustomSetterObserver = class CustomSetterObserver {
    constructor(obj, propertyKey, descriptor) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.descriptor = descriptor;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.observing = false;
    }
    setValue(newValue) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
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
    subscriberCollection(),
    __metadata("design:paramtypes", [Object, String, Object])
], CustomSetterObserver);
export { CustomSetterObserver };
// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
let GetterObserver = class GetterObserver {
    constructor(flags, overrides, obj, propertyKey, descriptor, observerLocator) {
        this.overrides = overrides;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.descriptor = descriptor;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.propertyDeps = [];
        this.collectionDeps = [];
        this.subscriberCount = 0;
        this.isCollecting = false;
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
        if (this.subscriberCount > 0 || this.isCollecting) {
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
    doNotCollect(target, key, receiver) {
        return !this.isCollecting
            || key === '$observers'
            || key === '$synthetic'
            || key === 'constructor';
    }
    unsubscribeAllDependencies() {
        this.propertyDeps.forEach(x => { x.unsubscribe(this); });
        this.propertyDeps.length = 0;
        this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
        this.collectionDeps.length = 0;
    }
};
GetterObserver = __decorate([
    subscriberCollection(),
    __metadata("design:paramtypes", [Number, Object, Object, String, Object, Object])
], GetterObserver);
export { GetterObserver };
const toStringTag = Object.prototype.toString;
/**
 * _@param observer The owning observer of current evaluation, will subscribe to all observers created via proxy
 */
function createGetterTraps(flags, observerLocator, observer) {
    return {
        get: function (target, key, receiver) {
            if (observer.doNotCollect(target, key, receiver)) {
                return Reflect.get(target, key, receiver);
            }
            // The length and iterator properties need to be invoked on the original object
            // (for Map and Set at least) or they will throw.
            switch (toStringTag.call(target)) {
                case '[object Array]':
                    if (key === 'length' || isArrayIndex(key)) {
                        observer.addCollectionDep(observerLocator.getArrayObserver(flags, target));
                        return proxyOrValue(flags, target, key, observerLocator, observer);
                    }
                    break;
                case '[object Map]':
                    if (key === 'size') {
                        observer.addCollectionDep(observerLocator.getMapObserver(flags, target));
                        return Reflect.get(target, key, target);
                    }
                    break;
                case '[object Set]':
                    if (key === 'size') {
                        observer.addCollectionDep(observerLocator.getSetObserver(flags, target));
                        return Reflect.get(target, key, target);
                    }
                    break;
            }
            observer.addPropertyDep(observerLocator.getObserver(flags, target, key));
            return proxyOrValue(flags, target, key, observerLocator, observer);
        }
    };
}
/**
 * _@param observer The owning observer of current evaluation, will subscribe to all observers created via proxy
 */
function proxyOrValue(flags, target, key, observerLocator, observer) {
    const value = Reflect.get(target, key, target);
    if (typeof value !== 'object' || typeof value === 'function' || value === null) {
        return value;
    }
    return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}
//# sourceMappingURL=computed-observer.js.map