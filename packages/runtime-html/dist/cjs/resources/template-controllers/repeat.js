"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.longestIncreasingSubsequence = exports.Repeat = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const dom_js_1 = require("../../dom.js");
const view_js_1 = require("../../templating/view.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
const controller_js_1 = require("../../templating/controller.js");
const bindable_js_1 = require("../../bindable.js");
function dispose(disposable) {
    disposable.dispose();
}
let Repeat = class Repeat {
    constructor(location, parent, factory) {
        this.location = location;
        this.parent = parent;
        this.factory = factory;
        this.id = kernel_1.nextId('au$component');
        this.hasPendingInstanceMutation = false;
        this.observer = void 0;
        this.views = [];
        this.key = void 0;
        this.normalizedItems = void 0;
    }
    binding(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        const bindings = this.parent.bindings;
        let binding = (void 0);
        for (let i = 0, ii = bindings.length; i < ii; ++i) {
            binding = bindings[i];
            if (binding.target === this && binding.targetProperty === 'items') {
                this.forOf = binding.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null, binding.locator, null);
    }
    attaching(initiator, parent, flags) {
        this.normalizeToArray(flags);
        return this.activateAllViews(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        return this.deactivateAllViews(initiator, flags);
    }
    // called by SetterObserver
    itemsChanged(flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this.checkCollectionObserver(flags);
        flags |= 8 /* updateTarget */;
        this.normalizeToArray(flags);
        const ret = kernel_1.onResolve(this.deactivateAllViews(null, flags), () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this.activateAllViews(null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    // called by a CollectionObserver
    handleCollectionChange(indexMap, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        flags |= 8 /* updateTarget */;
        this.normalizeToArray(flags);
        if (indexMap === void 0) {
            const ret = kernel_1.onResolve(this.deactivateAllViews(null, flags), () => {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                return this.activateAllViews(null, flags);
            });
            if (ret instanceof Promise) {
                ret.catch(err => { throw err; });
            }
        }
        else {
            const oldLength = this.views.length;
            runtime_1.applyMutationsToIndices(indexMap);
            // first detach+unbind+(remove from array) the deleted view indices
            if (indexMap.deletedItems.length > 0) {
                indexMap.deletedItems.sort(kernel_1.compareNumber);
                const ret = kernel_1.onResolve(this.deactivateAndRemoveViewsByKey(indexMap, flags), () => {
                    // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                    return this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
                });
                if (ret instanceof Promise) {
                    ret.catch(err => { throw err; });
                }
            }
            else {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
            }
        }
    }
    // todo: subscribe to collection from inner expression
    checkCollectionObserver(flags) {
        const oldObserver = this.observer;
        if ((flags & 64 /* fromUnbind */)) {
            if (oldObserver !== void 0) {
                oldObserver.unsubscribe(this);
            }
        }
        else if (this.$controller.isActive) {
            const newObserver = this.observer = runtime_1.getCollectionObserver(this.items);
            if (oldObserver !== newObserver && oldObserver) {
                oldObserver.unsubscribe(this);
            }
            if (newObserver) {
                newObserver.subscribe(this);
            }
        }
    }
    normalizeToArray(flags) {
        const items = this.items;
        if (items instanceof Array) {
            this.normalizedItems = items;
            return;
        }
        const forOf = this.forOf;
        if (forOf === void 0) {
            return;
        }
        const normalizedItems = [];
        this.forOf.iterate(flags, items, (arr, index, item) => {
            normalizedItems[index] = item;
        });
        this.normalizedItems = normalizedItems;
    }
    activateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, location, items } = this;
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = this.forOf.count(flags, items);
        const views = this.views = Array(newLen);
        this.forOf.iterate(flags, items, (arr, i, item) => {
            view = views[i] = factory.create(flags).setLocation(location);
            view.nodes.unlink();
            viewScope = runtime_1.Scope.fromParent(parentScope, runtime_1.BindingContext.create(local, item));
            setContextualProperties(viewScope.overrideContext, i, newLen);
            ret = view.activate(initiator ?? view, $controller, flags, viewScope, hostScope);
            if (ret instanceof Promise) {
                (promises ?? (promises = [])).push(ret);
            }
        });
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    deactivateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { views, $controller } = this;
        for (let i = 0, ii = views.length; i < ii; ++i) {
            view = views[i];
            view.release();
            ret = view.deactivate(initiator ?? view, $controller, flags);
            if (ret instanceof Promise) {
                (promises ?? (promises = [])).push(ret);
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    deactivateAndRemoveViewsByKey(indexMap, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { $controller, views } = this;
        const deleted = indexMap.deletedItems;
        const deletedLen = deleted.length;
        let i = 0;
        for (; i < deletedLen; ++i) {
            view = views[deleted[i]];
            view.release();
            ret = view.deactivate(view, $controller, flags);
            if (ret instanceof Promise) {
                (promises ?? (promises = [])).push(ret);
            }
        }
        i = 0;
        let j = 0;
        for (; i < deletedLen; ++i) {
            j = deleted[i] - i;
            views.splice(j, 1);
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    createAndActivateAndSortViewsByKey(oldLength, indexMap, flags) {
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, normalizedItems, location, views } = this;
        const mapLen = indexMap.length;
        for (let i = 0; i < mapLen; ++i) {
            if (indexMap[i] === -2) {
                view = factory.create(flags);
                views.splice(i, 0, view);
            }
        }
        if (views.length !== mapLen) {
            // TODO: create error code and use reporter with more informative message
            throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
        }
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = indexMap.length;
        runtime_1.synchronizeIndices(views, indexMap);
        // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
        // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
        const seq = longestIncreasingSubsequence(indexMap);
        const seqLen = seq.length;
        let next;
        let j = seqLen - 1;
        let i = newLen - 1;
        for (; i >= 0; --i) {
            view = views[i];
            next = views[i + 1];
            view.nodes.link(next?.nodes ?? location);
            if (indexMap[i] === -2) {
                viewScope = runtime_1.Scope.fromParent(parentScope, runtime_1.BindingContext.create(local, normalizedItems[i]));
                setContextualProperties(viewScope.overrideContext, i, newLen);
                view.setLocation(location);
                ret = view.activate(view, $controller, flags, viewScope, hostScope);
                if (ret instanceof Promise) {
                    (promises ?? (promises = [])).push(ret);
                }
            }
            else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                setContextualProperties(view.scope.overrideContext, i, newLen);
                view.nodes.insertBefore(view.location);
            }
            else {
                if (oldLength !== newLen) {
                    setContextualProperties(view.scope.overrideContext, i, newLen);
                }
                --j;
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    dispose() {
        this.views.forEach(dispose);
        this.views = (void 0);
    }
    accept(visitor) {
        const { views } = this;
        if (views !== void 0) {
            for (let i = 0, ii = views.length; i < ii; ++i) {
                if (views[i].accept(visitor) === true) {
                    return true;
                }
            }
        }
    }
};
__decorate([
    bindable_js_1.bindable
], Repeat.prototype, "items", void 0);
Repeat = __decorate([
    custom_attribute_js_1.templateController('repeat'),
    __param(0, dom_js_1.IRenderLocation),
    __param(1, controller_js_1.IController),
    __param(2, view_js_1.IViewFactory)
], Repeat);
exports.Repeat = Repeat;
let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);
// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
function longestIncreasingSubsequence(indexMap) {
    const len = indexMap.length;
    if (len > maxLen) {
        maxLen = len;
        prevIndices = new Int32Array(len);
        tailIndices = new Int32Array(len);
    }
    let cursor = 0;
    let cur = 0;
    let prev = 0;
    let i = 0;
    let j = 0;
    let low = 0;
    let high = 0;
    let mid = 0;
    for (; i < len; i++) {
        cur = indexMap[i];
        if (cur !== -2) {
            j = prevIndices[cursor];
            prev = indexMap[j];
            if (prev !== -2 && prev < cur) {
                tailIndices[i] = j;
                prevIndices[++cursor] = i;
                continue;
            }
            low = 0;
            high = cursor;
            while (low < high) {
                mid = (low + high) >> 1;
                prev = indexMap[prevIndices[mid]];
                if (prev !== -2 && prev < cur) {
                    low = mid + 1;
                }
                else {
                    high = mid;
                }
            }
            prev = indexMap[prevIndices[low]];
            if (cur < prev || prev === -2) {
                if (low > 0) {
                    tailIndices[i] = prevIndices[low - 1];
                }
                prevIndices[low] = i;
            }
        }
    }
    i = ++cursor;
    const result = new Int32Array(i);
    cur = prevIndices[cursor - 1];
    while (cursor-- > 0) {
        result[cursor] = cur;
        cur = tailIndices[cur];
    }
    while (i-- > 0)
        prevIndices[i] = 0;
    return result;
}
exports.longestIncreasingSubsequence = longestIncreasingSubsequence;
function setContextualProperties(oc, index, length) {
    const isFirst = index === 0;
    const isLast = index === length - 1;
    const isEven = index % 2 === 0;
    oc.$index = index;
    oc.$first = isFirst;
    oc.$last = isLast;
    oc.$middle = !isFirst && !isLast;
    oc.$even = isEven;
    oc.$odd = !isEven;
    oc.$length = length;
}
//# sourceMappingURL=repeat.js.map