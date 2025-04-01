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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { customElement, FragmentNodeSequence, isRenderLocation, refs } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/dom.spec.ts', function () {
    this.beforeEach(function () {
        refs.hideProp = false;
    });
    describe('refs', function () {
        it('does not set $aurelia on host if refs.hideProp is true', function () {
            refs.hideProp = true;
            const { appHost } = createFixture('', class {
            });
            assert.strictEqual(appHost['$aurelia'], undefined);
        });
        it('does not set $au on host if refs.hideProp is true', function () {
            refs.hideProp = true;
            const { assertText, appHost } = createFixture('<el>', class {
            }, [(() => {
                    let _classDecorators = [customElement({ name: 'el', template: 'ell' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var class_1 = (_classThis = class {
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_1 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_1 = _classThis;
                })()]);
            assertText('ell');
            assert.strictEqual(appHost.querySelector('el')['$au'], undefined);
        });
    });
    const ctx = TestContext.create();
    let sut;
    const widthArr = [1, 2, 3];
    const depthArr = [0, 1, 2, 3];
    describe('[UNIT] findTargets', function () {
        it(`should return all elements at all depths`, function () {
            const node = ctx.doc.createElement('div');
            node.innerHTML = `
      <template>
        <div>
          <div>
            <au-m></au-m><!--au-start--><!--au-end-->
          </div>
        </div>
        <p>hey</p><au-m></au-m><el></el>
      </template>`;
            const fragment = node.firstElementChild.content;
            sut = new FragmentNodeSequence(ctx.platform, fragment);
            const actual = sut.findTargets();
            assert.strictEqual(isRenderLocation(actual[0]), true);
            assert.strictEqual(actual[1], fragment.querySelector('el'));
        });
    });
    describe('[UNIT] insertBefore', function () {
        for (const width of widthArr) {
            for (const depth of depthArr.filter(d => d > 0)) {
                it(`should insert the view before the refNode under the parent of the refNode (depth=${depth},width=${width})`, function () {
                    const node = ctx.doc.createElement('div');
                    const fragment = createFragment(ctx, node, 0, depth, width);
                    sut = new FragmentNodeSequence(ctx.platform, fragment);
                    const parent = ctx.doc.createElement('div');
                    const ref1 = ctx.doc.createElement('div');
                    const ref2 = ctx.doc.createElement('div');
                    parent.appendChild(ref1);
                    parent.appendChild(ref2);
                    sut.insertBefore(ref2);
                    assert.strictEqual(parent.childNodes.length, width + 2, `parent.childNodes.length`);
                    assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
                    assert.strictEqual(parent.childNodes.item(0) === ref1, true, `parent.childNodes.item(0) === ref1`);
                    let i = 0;
                    while (i < width) {
                        assert.strictEqual(parent.childNodes.item(i + 1) === sut.childNodes[i], true, `parent.childNodes.item(i + 1) === sut.childNodes[i]`);
                        i++;
                    }
                    assert.strictEqual(parent.childNodes.item(width + 1) === ref2, true, `parent.childNodes.item(width + 1) === ref2`);
                    assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
                });
            }
        }
    });
    describe('appendTo', function () {
        for (const width of widthArr) {
            for (const depth of depthArr.filter(d => d > 0)) {
                it(`should append the view to the parent (depth=${depth},width=${width})`, function () {
                    const node = ctx.doc.createElement('div');
                    const fragment = createFragment(ctx, node, 0, depth, width);
                    sut = new FragmentNodeSequence(ctx.platform, fragment);
                    const parent = ctx.doc.createElement('div');
                    sut.appendTo(parent);
                    assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
                    assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
                    let i = 0;
                    while (i < width) {
                        assert.strictEqual(parent.childNodes.item(i) === sut.childNodes[i], true, `parent.childNodes.item(i) === sut.childNodes[i]`);
                        i++;
                    }
                });
            }
        }
    });
    // eslint-disable-next-line mocha/no-skipped-tests
    describe.skip('remove', function () {
        for (const width of widthArr) {
            for (const depth of depthArr.filter(d => d > 0)) {
                it(`should put the view back into the fragment (depth=${depth},width=${width})`, function () {
                    const node = ctx.doc.createElement('div');
                    const fragment = createFragment(ctx, node, 0, depth, width);
                    sut = new FragmentNodeSequence(ctx.platform, fragment);
                    const parent = ctx.doc.createElement('div');
                    assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
                    assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
                    parent.appendChild(fragment);
                    assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
                    assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
                    sut.remove();
                    assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
                    assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
                });
            }
        }
    });
});
function createFragment(ctx, node, level, depth, width) {
    const root = ctx.doc.createDocumentFragment();
    appendTree(root, node, level, depth, width);
    return root;
}
function appendTree(root, node, level, depth, width) {
    if (level < depth) {
        const children = appendChildren(root, node, width);
        for (const child of children) {
            appendTree(child, node, level + 1, depth, width);
        }
    }
}
function appendChildren(parent, child, count) {
    const children = new Array(count);
    let i = 0;
    while (i < count) {
        const el = child.cloneNode(true);
        parent.appendChild(el);
        children[i] = el;
        i++;
    }
    return children;
}
//# sourceMappingURL=dom.spec.js.map