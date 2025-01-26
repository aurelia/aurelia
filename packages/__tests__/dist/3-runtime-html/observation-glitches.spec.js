var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { DI, IPlatform, Registration } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { batch, DirtyChecker, IObserverLocator, observable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';
describe('3-runtime-html/observation-glitches.spec.ts', function () {
    describe('[UNIT] - objects only', function () {
        let locator;
        this.beforeEach(function () {
            locator = DI.createContainer()
                .register(DirtyChecker, Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)))
                .get(IObserverLocator);
        });
        it('handles glitches', function () {
            let i1 = 0;
            let i2 = 0;
            let i3 = 0;
            class NameTag {
                constructor() {
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    if (!this.firstName && !this.lastName) {
                        i1++;
                        return '(Anonymous)';
                    }
                    if (this.fullName.includes('Sync')) {
                        i2++;
                        return '[Banned]';
                    }
                    i3++;
                    return `[Badge] ${this.fullName}`;
                }
                get fullName() {
                    return `${this.firstName} ${this.lastName}`;
                }
            }
            const obj = new NameTag();
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({ handleChange: () => { } });
            assert.deepEqual([i1, i2, i3], [1, 0, 0]);
            obj.firstName = 'Sync';
            obj.lastName = 'Last';
            assert.strictEqual(obj.tag, '[Banned]');
            assert.deepEqual([i1, i2, i3], [1, 2, 0]);
            obj.firstName = '';
            // first name change ->
            // 1. tag() runs again
            // 2. fullname() runs again
            //  2.1 tag() runs again
            assert.deepEqual([i1, i2, i3], [1, 2, 2]);
        });
        it('handles nested dependencies glitches', function () {
            // in this test, fullName depends on firstName, but is not directly a dependency of tag
            // in other word, `fullName` is an indirect dependency of `tag`
            // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
            // it should still be able to get the notification
            //
            let i1 = 0;
            let i2 = 0;
            let i3 = 0;
            class NameTag {
                constructor() {
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    if (!this.firstName && !this.lastName) {
                        i1++;
                        return '(Anonymous)';
                    }
                    if (this.trimmed.includes('Sync')) {
                        i2++;
                        return '[Banned]';
                    }
                    i3++;
                    return `[Badge] ${this.trimmed}`;
                }
                get fullName() {
                    return `${this.firstName} ${this.lastName}`;
                }
                get trimmed() {
                    return this.fullName.slice(0, 10);
                }
            }
            const obj = new NameTag();
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({ handleChange: () => { } });
            assert.deepEqual([i1, i2, i3], [1, 0, 0]);
            obj.firstName = 'Sync';
            obj.lastName = 'Last';
            assert.strictEqual(obj.tag, '[Banned]');
            assert.deepEqual([i1, i2, i3], [1, 2, 0]);
            obj.firstName = '';
            // first name change ->
            // 1. tag() runs again
            // 2. fullname() runs again
            //  2.1 tag() runs again
            assert.deepEqual([i1, i2, i3], [1, 2, 2]);
        });
        it('handles many layers of nested dependencies glitches', function () {
            // in this test, fullName depends on firstName, but is not directly a dependency of tag
            // in other word, `fullName` is an indirect dependency of `tag`
            // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
            // it should still be able to get the notification
            //
            let i1 = 0;
            let i2 = 0;
            let i3 = 0;
            class NameTag {
                constructor() {
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    if (!this.firstName && !this.lastName) {
                        i1++;
                        return '(Anonymous)';
                    }
                    if (this.trimmed.includes('Sync')) {
                        i2++;
                        return '[Banned]';
                    }
                    i3++;
                    return `[Badge] ${this.trimmed}`;
                }
                get fullName() {
                    return `${this.firstName} ${this.lastName}`;
                }
                get trimmed() {
                    return this.trimmed1;
                }
                get trimmed1() {
                    return this.trimmed2.slice(0, 10);
                }
                get trimmed2() {
                    return this.trimmed3.slice(0, 10);
                }
                get trimmed3() {
                    return this.fullName.slice(0, 10);
                }
            }
            const obj = new NameTag();
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({ handleChange: () => { } });
            assert.deepEqual([i1, i2, i3], [1, 0, 0]);
            obj.firstName = 'Sync';
            obj.lastName = 'Last';
            assert.strictEqual(obj.tag, '[Banned]');
            assert.deepEqual([i1, i2, i3], [1, 2, 0]);
            obj.firstName = '';
            // first name change ->
            // 1. tag() runs again
            // 2. fullname() runs again
            //  2.1 tag() runs again
            assert.deepEqual([i1, i2, i3], [1, 2, 2]);
        });
        it('handles @observable decorator glitches', function () {
            let i1 = 0;
            let i2 = 0;
            let i3 = 0;
            let NameTag = (() => {
                var _a;
                let _firstName_decorators;
                let _firstName_initializers = [];
                let _firstName_extraInitializers = [];
                let _lastName_decorators;
                let _lastName_initializers = [];
                let _lastName_extraInitializers = [];
                return _a = class NameTag {
                        get tag() {
                            if (!this.firstName && !this.lastName) {
                                i1++;
                                return '(Anonymous)';
                            }
                            if (this.fullName.includes('Sync')) {
                                i2++;
                                return '[Banned]';
                            }
                            i3++;
                            return `[Badge] ${this.fullName}`;
                        }
                        get fullName() {
                            return `${this.firstName} ${this.lastName}`;
                        }
                        constructor() {
                            this.firstName = __runInitializers(this, _firstName_initializers, '');
                            this.lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, ''));
                            __runInitializers(this, _lastName_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _firstName_decorators = [observable];
                        _lastName_decorators = [observable];
                        __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
                        __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const obj = new NameTag();
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({ handleChange: () => { } });
            assert.deepEqual([i1, i2, i3], [1, 0, 0]);
            obj.firstName = 'Sync';
            obj.lastName = 'Last';
            assert.strictEqual(obj.tag, '[Banned]');
            assert.deepEqual([i1, i2, i3], [1, 2, 0]);
            obj.firstName = '';
            // first name change ->
            // 1. tag() runs again
            // 2. fullname() runs again
            //  2.1 tag() runs again
            assert.deepEqual([i1, i2, i3], [1, 2, 2]);
        });
        it('handles array index related glitches', function () {
            class NameTag {
                constructor(tags = []) {
                    this.tags = tags;
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    return this.tags[0] === 'a' ? `[Badge] ${this.tags.join(',')}` : '[a]';
                }
            }
            const tags = [];
            const changeSnapshots = [];
            locator.getArrayObserver(tags).subscribe({
                handleCollectionChange(collection) {
                    changeSnapshots.push([collection.length, obj.tag]);
                }
            });
            const obj = new NameTag(tags);
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({
                handleChange: () => {
                    // only for triggering observation
                }
            });
            tags.push('a');
            assert.deepEqual(changeSnapshots, [
                [1, '[Badge] a']
            ]);
        });
        it('handles array length related glitches', function () {
            class NameTag {
                constructor(tags = []) {
                    this.tags = tags;
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    return this.tags.length > 0 ? `[Badge] ${this.tags.join(',')}` : '[a]';
                }
            }
            const tags = [];
            const changeSnapshots = [];
            locator.getArrayObserver(tags).subscribe({
                handleCollectionChange(collection) {
                    changeSnapshots.push([collection.length, obj.tag]);
                }
            });
            const obj = new NameTag(tags);
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({
                handleChange: () => {
                    // only for triggering observation
                }
            });
            tags.push('a');
            assert.deepEqual(changeSnapshots, [
                [1, '[Badge] a']
            ]);
        });
        it('handles map size related glitches', function () {
            class NameTag {
                constructor(tags) {
                    this.tags = tags;
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
                }
            }
            const tags = new Map();
            const changeSnapshots = [];
            locator.getMapObserver(tags).subscribe({
                handleCollectionChange(collection) {
                    changeSnapshots.push([collection.size, obj.tag]);
                }
            });
            const obj = new NameTag(tags);
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({
                handleChange: () => {
                    // only for triggering observation
                }
            });
            tags.set('a', 'b');
            assert.deepEqual(changeSnapshots, [
                [1, '[Badge] b']
            ]);
        });
        it('handles set size related glitches', function () {
            class NameTag {
                constructor(tags) {
                    this.tags = tags;
                    this.firstName = '';
                    this.lastName = '';
                }
                get tag() {
                    return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
                }
            }
            const tags = new Set();
            const changeSnapshots = [];
            locator.getSetObserver(tags).subscribe({
                handleCollectionChange(collection) {
                    changeSnapshots.push([collection.size, obj.tag]);
                }
            });
            const obj = new NameTag(tags);
            const tagObserver = locator.getObserver(obj, 'tag');
            tagObserver.subscribe({
                handleChange: () => {
                    // only for triggering observation
                }
            });
            tags.add('a');
            assert.deepEqual(changeSnapshots, [
                [1, '[Badge] a']
            ]);
        });
        // eslint-disable-next-line mocha/no-skipped-tests
        it.skip('handles glitches in circular dependencies', function () { });
        describe('with batch()', function () {
            it('handles glitches', function () {
                let i1 = 0;
                let i2 = 0;
                let i3 = 0;
                class NameTag {
                    constructor() {
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        if (!this.firstName && !this.lastName) {
                            i1++;
                            return '(Anonymous)';
                        }
                        if (this.fullName.includes('Sync')) {
                            i2++;
                            return '[Banned]';
                        }
                        i3++;
                        return `[Badge] ${this.fullName}`;
                    }
                    get fullName() {
                        return `${this.firstName} ${this.lastName}`;
                    }
                }
                const obj = new NameTag();
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({ handleChange: () => { } });
                assert.deepEqual([i1, i2, i3], [1, 0, 0]);
                batch(() => {
                    obj.firstName = 'Sync';
                    obj.lastName = 'Last';
                });
                assert.strictEqual(obj.tag, '[Banned]');
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 0]);
                batch(() => {
                    obj.firstName = '';
                });
                // shouldn't go to 2 because fullName should no longer have 'Sync' in it
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 2]);
            });
            it('handles nested dependencies glitches', function () {
                // in this test, fullName depends on firstName, but is not directly a dependency of tag
                // in other word, `fullName` is an indirect dependency of `tag`
                // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
                // it should still be able to get the notification
                //
                let i1 = 0;
                let i2 = 0;
                let i3 = 0;
                class NameTag {
                    constructor() {
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        if (!this.firstName && !this.lastName) {
                            i1++;
                            return '(Anonymous)';
                        }
                        if (this.trimmed.includes('Sync')) {
                            i2++;
                            return '[Banned]';
                        }
                        i3++;
                        return `[Badge] ${this.trimmed}`;
                    }
                    get fullName() {
                        return `${this.firstName} ${this.lastName}`;
                    }
                    get trimmed() {
                        return this.fullName.slice(0, 10);
                    }
                }
                const obj = new NameTag();
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({ handleChange: () => { } });
                assert.deepEqual([i1, i2, i3], [1, 0, 0]);
                batch(() => {
                    obj.firstName = 'Sync';
                    obj.lastName = 'Last';
                });
                assert.strictEqual(obj.tag, '[Banned]');
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 0]);
                batch(() => {
                    obj.firstName = '';
                });
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 2]);
            });
            it('handles many layers of nested dependencies glitches', function () {
                // in this test, fullName depends on firstName, but is not directly a dependency of tag
                // in other word, `fullName` is an indirect dependency of `tag`
                // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
                // it should still be able to get the notification
                //
                let i1 = 0;
                let i2 = 0;
                let i3 = 0;
                class NameTag {
                    constructor() {
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        if (!this.firstName && !this.lastName) {
                            i1++;
                            return '(Anonymous)';
                        }
                        if (this.trimmed.includes('Sync')) {
                            i2++;
                            return '[Banned]';
                        }
                        i3++;
                        return `[Badge] ${this.trimmed}`;
                    }
                    get fullName() {
                        return `${this.firstName} ${this.lastName}`;
                    }
                    get trimmed() {
                        return this.trimmed1;
                    }
                    get trimmed1() {
                        return this.trimmed2.slice(0, 10);
                    }
                    get trimmed2() {
                        return this.trimmed3.slice(0, 10);
                    }
                    get trimmed3() {
                        return this.fullName.slice(0, 10);
                    }
                }
                const obj = new NameTag();
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({ handleChange: () => { } });
                assert.deepEqual([i1, i2, i3], [1, 0, 0]);
                batch(() => {
                    obj.firstName = 'Sync';
                    obj.lastName = 'Last';
                });
                assert.strictEqual(obj.tag, '[Banned]');
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 0]);
                batch(() => {
                    obj.firstName = '';
                });
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 2]);
            });
            it('handles @observable decorator glitches', function () {
                let i1 = 0;
                let i2 = 0;
                let i3 = 0;
                let NameTag = (() => {
                    var _a;
                    let _firstName_decorators;
                    let _firstName_initializers = [];
                    let _firstName_extraInitializers = [];
                    let _lastName_decorators;
                    let _lastName_initializers = [];
                    let _lastName_extraInitializers = [];
                    return _a = class NameTag {
                            get tag() {
                                if (!this.firstName && !this.lastName) {
                                    i1++;
                                    return '(Anonymous)';
                                }
                                if (this.fullName.includes('Sync')) {
                                    i2++;
                                    return '[Banned]';
                                }
                                i3++;
                                return `[Badge] ${this.fullName}`;
                            }
                            get fullName() {
                                return `${this.firstName} ${this.lastName}`;
                            }
                            constructor() {
                                this.firstName = __runInitializers(this, _firstName_initializers, '');
                                this.lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, ''));
                                __runInitializers(this, _lastName_extraInitializers);
                            }
                        },
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _firstName_decorators = [observable];
                            _lastName_decorators = [observable];
                            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
                            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
                            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })(),
                        _a;
                })();
                const obj = new NameTag();
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({ handleChange: () => { } });
                assert.deepEqual([i1, i2, i3], [1, 0, 0]);
                batch(() => {
                    obj.firstName = 'Sync';
                    obj.lastName = 'Last';
                });
                assert.strictEqual(obj.tag, '[Banned]');
                // first name change ->
                // 1. tag() runs again
                // 2. fullname() runs again
                //  2.1 tag() runs again
                assert.deepEqual([i1, i2, i3], [1, 2, 0]);
                batch(() => {
                    obj.firstName = '';
                });
                assert.deepEqual([i1, i2, i3], [1, 2, 2]);
            });
            it('handles array index related glitches', function () {
                class NameTag {
                    constructor(tags = []) {
                        this.tags = tags;
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        return this.tags[0] === 'a' ? `[Badge] ${this.tags.join(',')}` : '[a]';
                    }
                }
                const tags = [];
                const changeSnapshots = [];
                locator.getArrayObserver(tags).subscribe({
                    handleCollectionChange(collection) {
                        changeSnapshots.push([collection.length, obj.tag]);
                    }
                });
                const obj = new NameTag(tags);
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({
                    handleChange: () => {
                        // only for triggering observation
                    }
                });
                batch(() => {
                    tags.push('a');
                });
                assert.deepEqual(changeSnapshots, [
                    [1, '[Badge] a']
                ]);
            });
            it('handles array length related glitches', function () {
                class NameTag {
                    constructor(tags = []) {
                        this.tags = tags;
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        return this.tags.length > 0 ? `[Badge] ${this.tags.join(',')}` : '[a]';
                    }
                }
                const tags = [];
                const changeSnapshots = [];
                locator.getArrayObserver(tags).subscribe({
                    handleCollectionChange(collection) {
                        changeSnapshots.push([collection.length, obj.tag]);
                    }
                });
                const obj = new NameTag(tags);
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({
                    handleChange: () => {
                        // only for triggering observation
                    }
                });
                tags.push('a');
                assert.deepEqual(changeSnapshots, [
                    [1, '[Badge] a']
                ]);
            });
            it('handles map size related glitches', function () {
                class NameTag {
                    constructor(tags) {
                        this.tags = tags;
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
                    }
                }
                const tags = new Map();
                const changeSnapshots = [];
                locator.getMapObserver(tags).subscribe({
                    handleCollectionChange(collection) {
                        changeSnapshots.push([collection.size, obj.tag]);
                    }
                });
                const obj = new NameTag(tags);
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({
                    handleChange: () => {
                        // only for triggering observation
                    }
                });
                tags.set('a', 'b');
                assert.deepEqual(changeSnapshots, [
                    [1, '[Badge] b']
                ]);
            });
            it('handles set size related glitches', function () {
                class NameTag {
                    constructor(tags) {
                        this.tags = tags;
                        this.firstName = '';
                        this.lastName = '';
                    }
                    get tag() {
                        return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
                    }
                }
                const tags = new Set();
                const changeSnapshots = [];
                locator.getSetObserver(tags).subscribe({
                    handleCollectionChange(collection) {
                        changeSnapshots.push([collection.size, obj.tag]);
                    }
                });
                const obj = new NameTag(tags);
                const tagObserver = locator.getObserver(obj, 'tag');
                tagObserver.subscribe({
                    handleChange: () => {
                        // only for triggering observation
                    }
                });
                tags.add('a');
                assert.deepEqual(changeSnapshots, [
                    [1, '[Badge] a']
                ]);
            });
        });
    });
    describe('app based', function () {
        // is there a way to express glitches in app that is different with the above unit tests?
    });
});
//# sourceMappingURL=observation-glitches.spec.js.map