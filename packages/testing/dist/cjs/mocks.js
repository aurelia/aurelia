"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpySubscriber = exports.CollectionChangeSet = exports.ProxyChangeSet = exports.ChangeSet = exports.MockBrowserHistoryLocation = exports.MockContext = exports.MockValueConverter = exports.MockTracingExpression = exports.MockPropertySubscriber = exports.MockSignaler = exports.MockServiceLocator = exports.MockBindingBehavior = exports.MockBinding = void 0;
const kernel_1 = require("@aurelia/kernel");
class MockBinding {
    constructor() {
        this.interceptor = this;
        this.calls = [];
    }
    updateTarget(value, flags) {
        this.trace('updateTarget', value, flags);
    }
    updateSource(value, flags) {
        this.trace('updateSource', value, flags);
    }
    handleChange(newValue, _previousValue, flags) {
        this.trace('handleChange', newValue, _previousValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.trace('handleCollectionChange', indexMap, flags);
    }
    observeProperty(obj, propertyName) {
        this.trace('observeProperty', obj, propertyName);
    }
    observeCollection(col) {
        this.trace('observeCollection', col);
    }
    subscribeTo(subscribable) {
        this.trace('subscribeTo', subscribable);
    }
    $bind(flags, scope) {
        this.trace('$bind', flags, scope);
    }
    $unbind(flags) {
        this.trace('$unbind', flags);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
    dispose() {
        this.trace('dispose');
    }
}
exports.MockBinding = MockBinding;
class MockBindingBehavior {
    constructor() {
        this.calls = [];
    }
    bind(flags, scope, binding, ...rest) {
        this.trace('bind', flags, scope, binding, ...rest);
    }
    unbind(flags, scope, binding, ...rest) {
        this.trace('unbind', flags, scope, binding, ...rest);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockBindingBehavior = MockBindingBehavior;
class MockServiceLocator {
    constructor(registrations) {
        this.registrations = registrations;
        this.calls = [];
    }
    get(key) {
        this.trace('get', key);
        return this.registrations.get(key);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockServiceLocator = MockServiceLocator;
class MockSignaler {
    constructor() {
        this.calls = [];
    }
    dispatchSignal(...args) {
        this.trace('dispatchSignal', ...args);
    }
    addSignalListener(...args) {
        this.trace('addSignalListener', ...args);
    }
    removeSignalListener(...args) {
        this.trace('removeSignalListener', ...args);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockSignaler = MockSignaler;
class MockPropertySubscriber {
    constructor() {
        this.calls = [];
    }
    handleChange(newValue, previousValue, flags) {
        this.trace(`handleChange`, newValue, previousValue, flags);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockPropertySubscriber = MockPropertySubscriber;
class MockTracingExpression {
    constructor(inner) {
        this.inner = inner;
        this.$kind = 2048 /* HasBind */ | 4096 /* HasUnbind */;
        this.calls = [];
    }
    evaluate(...args) {
        this.trace('evaluate', ...args);
        return this.inner.evaluate(...args);
    }
    assign(...args) {
        this.trace('assign', ...args);
        return this.inner.assign(...args);
    }
    connect(...args) {
        this.trace('connect', ...args);
        this.inner.connect(...args);
    }
    bind(...args) {
        this.trace('bind', ...args);
        if (this.inner.bind) {
            this.inner.bind(...args);
        }
    }
    unbind(...args) {
        this.trace('unbind', ...args);
        if (this.inner.unbind) {
            this.inner.unbind(...args);
        }
    }
    accept(...args) {
        this.trace('accept', ...args);
        this.inner.accept(...args);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockTracingExpression = MockTracingExpression;
class MockValueConverter {
    constructor(methods) {
        this.calls = [];
        for (const method of methods) {
            this[method] = this[`$${method}`];
        }
    }
    $fromView(value, ...args) {
        this.trace('fromView', value, ...args);
        return value;
    }
    $toView(value, ...args) {
        this.trace('toView', value, ...args);
        return value;
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
exports.MockValueConverter = MockValueConverter;
class MockContext {
    constructor() {
        this.log = [];
    }
}
exports.MockContext = MockContext;
class MockBrowserHistoryLocation {
    constructor() {
        this.states = [{}];
        this.paths = [''];
        this.index = 0;
    }
    get length() {
        return this.states.length;
    }
    get state() {
        return this.states[this.index];
    }
    get path() {
        return this.paths[this.index];
    }
    get pathname() {
        const parts = this.parts;
        // parts.shift();
        let path = parts.shift();
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        return path;
    }
    get search() {
        const parts = this.parts;
        // if (parts.shift()) {
        //   parts.shift();
        // }
        parts.shift();
        const part = parts.shift();
        return part !== undefined ? `?${part}` : '';
    }
    get hash() {
        const parts = this.parts;
        // if (!parts.shift()) {
        //   parts.shift();
        // }
        parts.shift();
        parts.shift();
        const part = parts.shift();
        return part !== undefined ? `#${part}` : '';
    }
    set hash(value) {
        if (value.startsWith('#')) {
            value = value.substring(1);
        }
        const parts = this.parts;
        // const hashFirst = parts.shift();
        let path = parts.shift();
        // if (hashFirst) {
        //   parts.shift();
        //   path += `#${value}`;
        //   const part = parts.shift();
        //   if (part !== undefined) {
        //     path += `?${part}`;
        //   }
        // } else {
        const part = parts.shift();
        if (part !== undefined) {
            path += `?${part}`;
        }
        parts.shift();
        path += `#${value}`;
        // }
        this.pushState({}, null, path);
        this.notifyChange();
    }
    activate() { return; }
    deactivate() { return; }
    // TODO: Fix a better split
    get parts() {
        const parts = [];
        const ph = this.path.split('#');
        if (ph.length > 1) {
            parts.unshift(ph.pop());
        }
        else {
            parts.unshift(undefined);
        }
        const pq = ph[0].split('?');
        if (pq.length > 1) {
            parts.unshift(pq.pop());
        }
        else {
            parts.unshift(undefined);
        }
        parts.unshift(pq[0]);
        // const parts: (string | boolean)[] = this.path.split(/[#?]/);
        // let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
        // let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
        // parts.unshift(hash < search);
        return parts;
    }
    pushState(data, title, path) {
        this.states.splice(this.index + 1);
        this.paths.splice(this.index + 1);
        this.states.push(data);
        this.paths.push(path);
        this.index++;
    }
    replaceState(data, title, path) {
        this.states[this.index] = data;
        this.paths[this.index] = path;
    }
    go(movement) {
        const newIndex = this.index + movement;
        if (newIndex >= 0 && newIndex < this.states.length) {
            this.index = newIndex;
            this.notifyChange();
        }
    }
    notifyChange() {
        if (this.changeCallback) {
            this.changeCallback(null).catch((error) => { throw error; });
        }
    }
}
exports.MockBrowserHistoryLocation = MockBrowserHistoryLocation;
class ChangeSet {
    constructor(index, flags, newValue, oldValue) {
        this.index = index;
        this.flags = flags;
        this._newValue = newValue;
        this._oldValue = oldValue;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = (void 0);
        this._oldValue = (void 0);
    }
}
exports.ChangeSet = ChangeSet;
class ProxyChangeSet {
    constructor(index, flags, key, newValue, oldValue) {
        this.index = index;
        this.flags = flags;
        this.key = key;
        this._newValue = newValue;
        this._oldValue = oldValue;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = (void 0);
        this._oldValue = (void 0);
    }
}
exports.ProxyChangeSet = ProxyChangeSet;
class CollectionChangeSet {
    constructor(index, flags, indexMap) {
        this.index = index;
        this.flags = flags;
        this._indexMap = indexMap;
    }
    get indexMap() {
        return this._indexMap;
    }
    dispose() {
        this._indexMap = (void 0);
    }
}
exports.CollectionChangeSet = CollectionChangeSet;
class SpySubscriber {
    constructor() {
        this._changes = void 0;
        this._proxyChanges = void 0;
        this._collectionChanges = void 0;
        this._callCount = 0;
    }
    get changes() {
        if (this._changes === void 0) {
            return kernel_1.emptyArray;
        }
        return this._changes;
    }
    get proxyChanges() {
        if (this._proxyChanges === void 0) {
            return kernel_1.emptyArray;
        }
        return this._proxyChanges;
    }
    get collectionChanges() {
        if (this._collectionChanges === void 0) {
            return kernel_1.emptyArray;
        }
        return this._collectionChanges;
    }
    get hasChanges() {
        return this._changes !== void 0;
    }
    get hasProxyChanges() {
        return this._proxyChanges !== void 0;
    }
    get hasCollectionChanges() {
        return this._collectionChanges !== void 0;
    }
    get callCount() {
        return this._callCount;
    }
    handleChange(newValue, oldValue, flags) {
        if (this._changes === void 0) {
            this._changes = [new ChangeSet(this._callCount++, flags, newValue, oldValue)];
        }
        else {
            this._changes.push(new ChangeSet(this._callCount++, flags, newValue, oldValue));
        }
    }
    handleProxyChange(key, newValue, oldValue, flags) {
        if (this._proxyChanges === void 0) {
            this._proxyChanges = [new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue)];
        }
        else {
            this._proxyChanges.push(new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue));
        }
    }
    handleCollectionChange(indexMap, flags) {
        if (this._collectionChanges === void 0) {
            this._collectionChanges = [new CollectionChangeSet(this._callCount++, flags, indexMap)];
        }
        else {
            this._collectionChanges.push(new CollectionChangeSet(this._callCount++, flags, indexMap));
        }
    }
    dispose() {
        if (this._changes !== void 0) {
            this._changes.forEach(c => c.dispose());
            this._changes = void 0;
        }
        if (this._proxyChanges !== void 0) {
            this._proxyChanges.forEach(c => c.dispose());
            this._proxyChanges = void 0;
        }
        if (this._collectionChanges !== void 0) {
            this._collectionChanges.forEach(c => c.dispose());
            this._collectionChanges = void 0;
        }
        this._callCount = 0;
    }
}
exports.SpySubscriber = SpySubscriber;
//# sourceMappingURL=mocks.js.map