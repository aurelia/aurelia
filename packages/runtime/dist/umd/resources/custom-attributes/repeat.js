(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../../dom", "../../lifecycle", "../../lifecycle-task", "../../observation/array-observer", "../../observation/binding-context", "../../observation/observer-locator", "../../templating/bindable", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("../../dom");
    const lifecycle_1 = require("../../lifecycle");
    const lifecycle_task_1 = require("../../lifecycle-task");
    const array_observer_1 = require("../../observation/array-observer");
    const binding_context_1 = require("../../observation/binding-context");
    const observer_locator_1 = require("../../observation/observer-locator");
    const bindable_1 = require("../../templating/bindable");
    const custom_attribute_1 = require("../custom-attribute");
    const isMountedOrAttached = 64 /* isMounted */ | 32 /* isAttached */;
    let Repeat = class Repeat {
        constructor(location, renderable, factory) {
            this.location = location;
            this.renderable = renderable;
            this.factory = factory;
            this.id = kernel_1.nextId('au$component');
            this.hasPendingInstanceMutation = false;
            this.observer = void 0;
            this.views = [];
            this.key = void 0;
            this.task = lifecycle_task_1.LifecycleTask.done;
            this.normalizedItems = void 0;
        }
        binding(flags) {
            this.checkCollectionObserver(flags);
            const bindings = this.renderable.bindings;
            const { length } = bindings;
            let binding;
            for (let i = 0; i < length; ++i) {
                binding = bindings[i];
                if (binding.target === this && binding.targetProperty === 'items') {
                    this.forOf = binding.sourceExpression;
                    break;
                }
            }
            this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null);
            this.normalizeToArray(flags);
            this.processViewsKeyed(void 0, flags);
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachViews(void 0, flags);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.attachViews, this, void 0, flags);
            }
        }
        detaching(flags) {
            if (this.task.done) {
                this.detachViewsByRange(0, this.views.length, flags);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.detachViewsByRange, this, 0, this.views.length, flags);
            }
        }
        unbinding(flags) {
            this.checkCollectionObserver(flags);
            if (this.task.done) {
                this.task = this.unbindAndRemoveViewsByRange(0, this.views.length, flags, false);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, this.views.length, flags, false);
            }
            return this.task;
        }
        // called by SetterObserver
        itemsChanged(flags) {
            flags |= this.$controller.flags;
            this.checkCollectionObserver(flags);
            flags |= 16 /* updateTargetInstance */;
            this.normalizeToArray(flags);
            this.processViewsKeyed(void 0, flags);
        }
        // called by a CollectionObserver
        handleCollectionChange(indexMap, flags) {
            flags |= this.$controller.flags;
            flags |= (960 /* fromFlush */ | 16 /* updateTargetInstance */);
            this.normalizeToArray(flags);
            this.processViewsKeyed(indexMap, flags);
        }
        processViewsKeyed(indexMap, flags) {
            const oldLength = this.views.length;
            if (indexMap === void 0) {
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    this.detachViewsByRange(0, oldLength, flags);
                    if (this.task.done) {
                        this.task = this.unbindAndRemoveViewsByRange(0, oldLength, flags, false);
                    }
                    else {
                        this.task = new lifecycle_task_1.ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, oldLength, flags, false);
                    }
                    if (this.task.done) {
                        this.task = this.createAndBindAllViews(flags);
                    }
                    else {
                        this.task = new lifecycle_task_1.ContinuationTask(this.task, this.createAndBindAllViews, this, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.attachViewsKeyed(flags);
                    }
                    else {
                        this.task = new lifecycle_task_1.ContinuationTask(this.task, this.attachViewsKeyed, this, flags);
                    }
                }
            }
            else {
                array_observer_1.applyMutationsToIndices(indexMap);
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    // first detach+unbind+(remove from array) the deleted view indices
                    if (indexMap.deletedItems.length > 0) {
                        indexMap.deletedItems.sort(kernel_1.compareNumber);
                        if (this.task.done) {
                            this.detachViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new lifecycle_task_1.ContinuationTask(this.task, this.detachViewsByKey, this, indexMap, flags);
                        }
                        if (this.task.done) {
                            this.task = this.unbindAndRemoveViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new lifecycle_task_1.ContinuationTask(this.task, this.unbindAndRemoveViewsByKey, this, indexMap, flags);
                        }
                    }
                    // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
                    if (this.task.done) {
                        this.task = this.createAndBindNewViewsByKey(indexMap, flags);
                    }
                    else {
                        this.task = new lifecycle_task_1.ContinuationTask(this.task, this.createAndBindNewViewsByKey, this, indexMap, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.sortViewsByKey(oldLength, indexMap, flags);
                    }
                    else {
                        this.task = new lifecycle_task_1.ContinuationTask(this.task, this.sortViewsByKey, this, oldLength, indexMap, flags);
                    }
                }
            }
        }
        // todo: subscribe to collection from inner expression
        checkCollectionObserver(flags) {
            const oldObserver = this.observer;
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                const newObserver = this.observer = observer_locator_1.getCollectionObserver(flags, this.$controller.lifecycle, this.items);
                if (oldObserver !== newObserver && oldObserver) {
                    oldObserver.unsubscribeFromCollection(this);
                }
                if (newObserver) {
                    newObserver.subscribeToCollection(this);
                }
            }
            else {
                if (oldObserver !== void 0) {
                    oldObserver.unsubscribeFromCollection(this);
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
        detachViewsByRange(iStart, iEnd, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByRange(iStart, iEnd, flags, adjustLength) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                task = view.unbind(flags);
                view.parent = void 0;
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            if (adjustLength) {
                this.views.length = iStart;
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return lifecycle_task_1.LifecycleTask.done;
            }
            return new lifecycle_task_1.AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        detachViewsByKey(indexMap, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            for (let i = 0; i < deletedLen; ++i) {
                view = views[deleted[i]];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByKey(indexMap, flags) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            let i = 0;
            for (; i < deletedLen; ++i) {
                view = views[deleted[i]];
                task = view.unbind(flags);
                view.parent = void 0;
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            i = 0;
            let j = 0;
            for (; i < deletedLen; ++i) {
                j = deleted[i] - i;
                this.views.splice(j, 1);
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return lifecycle_task_1.LifecycleTask.done;
            }
            return new lifecycle_task_1.AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        createAndBindAllViews(flags) {
            let tasks = void 0;
            let task;
            let view;
            let viewScope;
            const $controller = this.$controller;
            const lifecycle = $controller.lifecycle;
            const parentScope = $controller.scope;
            lifecycle.bound.begin();
            const part = $controller.part;
            const factory = this.factory;
            const local = this.local;
            const items = this.items;
            const newLen = this.forOf.count(flags, items);
            const views = this.views = Array(newLen);
            this.forOf.iterate(flags, items, (arr, i, item) => {
                view = views[i] = factory.create(flags);
                view.parent = $controller;
                viewScope = binding_context_1.Scope.fromParent(flags, parentScope, binding_context_1.BindingContext.create(flags, local, item));
                setContextualProperties(viewScope.overrideContext, i, newLen);
                task = view.bind(flags, viewScope, part);
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            });
            if (tasks === undefined) {
                lifecycle.bound.end(flags);
                return lifecycle_task_1.LifecycleTask.done;
            }
            return new lifecycle_task_1.AggregateContinuationTask(tasks, lifecycle.bound.end, lifecycle.bound, flags);
        }
        createAndBindNewViewsByKey(indexMap, flags) {
            let tasks = void 0;
            let task;
            let view;
            let viewScope;
            const factory = this.factory;
            const views = this.views;
            const local = this.local;
            const normalizedItems = this.normalizedItems;
            const $controller = this.$controller;
            const lifecycle = $controller.lifecycle;
            const parentScope = $controller.scope;
            lifecycle.bound.begin();
            const part = $controller.part;
            const mapLen = indexMap.length;
            for (let i = 0; i < mapLen; ++i) {
                if (indexMap[i] === -2) {
                    view = factory.create(flags);
                    // TODO: test with map/set/undefined/null, make sure we can use strong typing here as well, etc
                    view.parent = $controller;
                    viewScope = binding_context_1.Scope.fromParent(flags, parentScope, binding_context_1.BindingContext.create(flags, local, normalizedItems[i]));
                    setContextualProperties(viewScope.overrideContext, i, mapLen);
                    // update all the rest oc
                    task = view.bind(flags, viewScope, part);
                    views.splice(i, 0, view);
                    if (!task.done) {
                        if (tasks === undefined) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (views.length !== mapLen) {
                // TODO: create error code and use reporter with more informative message
                throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
            }
            if (tasks === undefined) {
                lifecycle.bound.end(flags);
                return lifecycle_task_1.LifecycleTask.done;
            }
            return new lifecycle_task_1.AggregateContinuationTask(tasks, lifecycle.bound.end, lifecycle.bound, flags);
        }
        attachViews(indexMap, flags) {
            let view;
            const views = this.views;
            const location = this.location;
            const lifecycle = this.$controller.lifecycle;
            lifecycle.attached.begin();
            if (indexMap === void 0) {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    view = views[i];
                    view.hold(location, 1 /* insertBefore */);
                    view.nodes.unlink();
                    view.attach(flags);
                }
            }
            else {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    if (indexMap[i] !== i) {
                        view = views[i];
                        view.hold(location, 1 /* insertBefore */);
                        view.nodes.unlink();
                        view.attach(flags);
                    }
                }
            }
            lifecycle.attached.end(flags);
        }
        attachViewsKeyed(flags) {
            let view;
            const { views, location } = this;
            this.$controller.lifecycle.attached.begin();
            for (let i = 0, ii = views.length; i < ii; ++i) {
                view = views[i];
                view.hold(location, 1 /* insertBefore */);
                view.nodes.unlink();
                view.attach(flags);
            }
            this.$controller.lifecycle.attached.end(flags);
        }
        sortViewsByKey(oldLength, indexMap, flags) {
            // TODO: integrate with tasks
            const location = this.location;
            const views = this.views;
            const newLen = indexMap.length;
            array_observer_1.synchronizeIndices(views, indexMap);
            // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
            // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
            const seq = longestIncreasingSubsequence(indexMap);
            const seqLen = seq.length;
            this.$controller.lifecycle.attached.begin();
            flags |= 33554432 /* reorderNodes */;
            let next;
            let j = seqLen - 1;
            let i = newLen - 1;
            let view;
            for (; i >= 0; --i) {
                view = views[i];
                if (indexMap[i] === -2) {
                    setContextualProperties(view.scope.overrideContext, i, newLen);
                    view.hold(location, 1 /* insertBefore */);
                    view.attach(flags);
                }
                else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                    setContextualProperties(view.scope.overrideContext, i, newLen);
                    view.attach(flags);
                }
                else {
                    if (oldLength !== newLen) {
                        setContextualProperties(view.scope.overrideContext, i, newLen);
                    }
                    --j;
                }
                next = views[i + 1];
                if (next !== void 0) {
                    view.nodes.link(next.nodes);
                }
                else {
                    view.nodes.link(location);
                }
            }
            this.$controller.lifecycle.attached.end(flags);
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], Repeat.prototype, "items", void 0);
    Repeat = tslib_1.__decorate([
        custom_attribute_1.templateController('repeat'),
        tslib_1.__param(0, dom_1.IRenderLocation),
        tslib_1.__param(1, lifecycle_1.IController),
        tslib_1.__param(2, lifecycle_1.IViewFactory)
    ], Repeat);
    exports.Repeat = Repeat;
    let prevIndices;
    let tailIndices;
    let maxLen = 0;
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
});
//# sourceMappingURL=repeat.js.map