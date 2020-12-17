import { DI } from './di';
import { emptyArray } from './platform';
import { Protocol } from './resource';
export const IModuleLoader = DI.createInterface(x => x.singleton(ModuleLoader));
function noTransform(m) {
    return m;
}
class ModuleTransformer {
    constructor($transform) {
        this.$transform = $transform;
        this.promiseCache = new Map();
        this.objectCache = new Map();
    }
    transform(objOrPromise) {
        if (objOrPromise instanceof Promise) {
            return this.transformPromise(objOrPromise);
        }
        else if (typeof objOrPromise === 'object' && objOrPromise !== null) {
            return this.transformObject(objOrPromise);
        }
        else {
            throw new Error(`Invalid input: ${String(objOrPromise)}. Expected Promise or Object.`);
        }
    }
    transformPromise(promise) {
        if (this.promiseCache.has(promise)) {
            return this.promiseCache.get(promise);
        }
        const ret = promise.then(obj => {
            return this.transformObject(obj);
        });
        this.promiseCache.set(promise, ret);
        void ret.then(value => {
            // make it synchronous for future requests
            this.promiseCache.set(promise, value);
        });
        return ret;
    }
    transformObject(obj) {
        if (this.objectCache.has(obj)) {
            return this.objectCache.get(obj);
        }
        const ret = this.$transform(this.analyze(obj));
        this.objectCache.set(obj, ret);
        if (ret instanceof Promise) {
            void ret.then(value => {
                // make it synchronous for future requests
                this.objectCache.set(obj, value);
            });
        }
        return ret;
    }
    analyze(m) {
        let value;
        let isRegistry;
        let isConstructable;
        let definitions;
        const items = [];
        for (const key in m) {
            switch (typeof (value = m[key])) {
                case 'object':
                    if (value === null) {
                        continue;
                    }
                    isRegistry = typeof value.register === 'function';
                    isConstructable = false;
                    definitions = emptyArray;
                    break;
                case 'function':
                    isRegistry = typeof value.register === 'function';
                    isConstructable = value.prototype !== void 0;
                    definitions = Protocol.resource.getAll(value);
                    break;
                default:
                    continue;
            }
            items.push(new ModuleItem(key, value, isRegistry, isConstructable, definitions));
        }
        return new AnalyzedModule(m, items);
    }
}
export class ModuleLoader {
    constructor() {
        this.transformers = new Map();
    }
    load(objOrPromise, transform = noTransform) {
        const transformers = this.transformers;
        let transformer = transformers.get(transform);
        if (transformer === void 0) {
            transformers.set(transform, transformer = new ModuleTransformer(transform));
        }
        return transformer.transform(objOrPromise);
    }
    dispose() {
        this.transformers.clear();
    }
}
export class AnalyzedModule {
    constructor(raw, items) {
        this.raw = raw;
        this.items = items;
    }
}
export class ModuleItem {
    constructor(key, value, isRegistry, isConstructable, definitions) {
        this.key = key;
        this.value = value;
        this.isRegistry = isRegistry;
        this.isConstructable = isConstructable;
        this.definitions = definitions;
    }
}
//# sourceMappingURL=module-loader.js.map