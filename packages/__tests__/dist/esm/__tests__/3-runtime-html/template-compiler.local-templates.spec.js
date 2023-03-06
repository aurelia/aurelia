var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DefaultLogger, kebabCase, LoggerConfiguration } from '@aurelia/kernel';
import { Aurelia, bindable, customElement, CustomElement, HydrateElementInstruction } from '@aurelia/runtime-html';
import { assert, generateCartesianProduct, TestContext } from '@aurelia/testing';
export function createAttribute(name, value) {
    const attr = document.createAttribute(name);
    attr.value = value;
    return attr;
}
const elementInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
class ElementInfo {
    constructor(name, alias, containerless) {
        this.name = name;
        this.alias = alias;
        this.containerless = containerless;
        /**
         * A lookup of the bindables of this element, indexed by the (pre-processed)
         * attribute names as they would be found in parsed markup.
         */
        this.bindables = Object.create(null);
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = elementInfoLookup.get(def);
        if (rec === void 0) {
            elementInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
            const bindables = def.bindables;
            const defaultBindingMode = 2 /* BindingMode.toView */;
            let bindable;
            let prop;
            let attr;
            let mode;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                // explicitly provided attribute name has priority over the derived implicit attribute name
                if (bindable.attribute !== void 0) {
                    attr = bindable.attribute;
                }
                else {
                    // derive the attribute name from the resolved property name
                    attr = kebabCase(prop);
                }
                if (bindable.mode !== void 0 && bindable.mode !== 8 /* BindingMode.default */) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                info.bindables[attr] = new BindableInfo(prop, mode);
            }
        }
        return info;
    }
}
const attrInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
class AttrInfo {
    constructor(name, alias, isTemplateController, noMultiBindings) {
        this.name = name;
        this.alias = alias;
        this.isTemplateController = isTemplateController;
        this.noMultiBindings = noMultiBindings;
        /**
         * A lookup of the bindables of this attribute, indexed by the (pre-processed)
         * bindable names as they would be found in the attribute value.
         *
         * Only applicable to multi attribute bindings (semicolon-separated).
         */
        this.bindables = Object.create(null);
        /**
         * The single or first bindable of this attribute, or a default 'value'
         * bindable if no bindables were defined on the attribute.
         *
         * Only applicable to single attribute bindings (where the attribute value
         * contains no semicolons)
         */
        this.bindable = null;
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = attrInfoLookup.get(def);
        if (rec === void 0) {
            attrInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
            const bindables = def.bindables;
            const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== 8 /* BindingMode.default */
                ? def.defaultBindingMode
                : 2 /* BindingMode.toView */;
            let bindable;
            let prop;
            let mode;
            let hasPrimary = false;
            let isPrimary = false;
            let bindableInfo;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                if (bindable.mode !== void 0 && bindable.mode !== 8 /* BindingMode.default */) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                isPrimary = bindable.primary === true;
                bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                if (isPrimary) {
                    if (hasPrimary) {
                        throw new Error('primary already exists');
                    }
                    hasPrimary = true;
                    info.bindable = bindableInfo;
                }
                // set to first bindable by convention
                if (info.bindable === null) {
                    info.bindable = bindableInfo;
                }
            }
            // if no bindables are present, default to "value"
            if (info.bindable === null) {
                info.bindable = new BindableInfo('value', defaultBindingMode);
            }
        }
        return info;
    }
}
/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
class BindableInfo {
    constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName, 
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode) {
        this.propName = propName;
        this.mode = mode;
    }
}
class EventLog {
    constructor() {
        this.log = [];
    }
    handleEvent(event) {
        this.log.push(event);
    }
}
function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;
    container.register(LoggerConfiguration.create({ sinks: [EventLog] }));
    const sut = ctx.templateCompiler;
    return { ctx, container, sut };
}
class LocalTemplateTestData {
    constructor(template, expectedResources, templateFreq, expectedContent) {
        this.template = template;
        this.expectedResources = expectedResources;
        this.templateFreq = templateFreq;
        this.expectedContent = expectedContent;
        this.verifyDefinition = this.verifyDefinition.bind(this);
    }
    verifyDefinition(definition, container) {
        assert.equal(definition.template.querySelector('template[as-custom-element]'), null);
        for (const [name, info] of this.expectedResources) {
            assert.deepStrictEqual(ElementInfo.from(container.find(CustomElement, name), void 0), info, 'element info');
        }
        const ceInstructions = definition.instructions.flatMap((i) => i).filter((i) => i instanceof HydrateElementInstruction);
        for (const [template, freq] of this.templateFreq) {
            assert.strictEqual(ceInstructions.filter((i) => i.res === template).length, freq, 'HydrateElementInstruction.freq');
        }
    }
}
describe('3-runtime-html/template-compiler.local-templates.spec.ts', function () {
    describe('[UNIT]', function () {
        function* getLocalTemplateTestData() {
            yield new LocalTemplateTestData(`<template as-custom-element="foo-bar">static</template>
        <foo-bar></foo-bar>`, new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]), new Map([['foo-bar', 1]]), 'static');
            yield new LocalTemplateTestData(`<foo-bar></foo-bar>
        <template as-custom-element="foo-bar">static</template>`, new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]), new Map([['foo-bar', 1]]), 'static');
            yield new LocalTemplateTestData(`<foo-bar></foo-bar>
        <template as-custom-element="foo-bar">static</template>
        <foo-bar></foo-bar>`, new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]), new Map([['foo-bar', 2]]), 'static static');
            yield new LocalTemplateTestData(`<template as-custom-element="foo-bar">static foo-bar</template>
        <template as-custom-element="fiz-baz">static fiz-baz</template>
        <fiz-baz></fiz-baz>
        <foo-bar></foo-bar>`, new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)], ['fiz-baz', new ElementInfo('fiz-baz', void 0, false)]]), new Map([['foo-bar', 1], ['fiz-baz', 1]]), 'static fiz-baz static foo-bar');
            const bindingModeMap = new Map([
                ['oneTime', 1 /* BindingMode.oneTime */],
                ['toView', 2 /* BindingMode.toView */],
                ['fromView', 4 /* BindingMode.fromView */],
                ['twoWay', 6 /* BindingMode.twoWay */],
                ['default', 2 /* BindingMode.toView */],
            ]);
            for (const [bindingMode, props, attributeName] of generateCartesianProduct([
                [...bindingModeMap.keys(), void 0],
                [['prop'], ['prop', 'camelProp']],
                ['fiz-baz', undefined],
            ])) {
                const ei = new ElementInfo('foo-bar', void 0, false);
                const mode = bindingModeMap.get(bindingMode) ?? 2 /* BindingMode.toView */;
                let bindables = '';
                let templateBody = '';
                let attrExpr = '';
                let renderedContent = '';
                const value = "awesome possum";
                for (let i = 0, ii = props.length; i < ii; i++) {
                    const prop = props[i];
                    const bi = new BindableInfo(prop, mode);
                    const attr = kebabCase(attributeName !== void 0 ? `${attributeName}${i + 1}` : prop);
                    ei.bindables[attr] = bi;
                    bindables += `<bindable property='${prop}'${bindingMode !== void 0 ? ` mode="${bindingMode}"` : ''}${attributeName !== void 0 ? ` attribute="${attr}"` : ''}></bindable>`;
                    templateBody += ` \${${prop}}`;
                    const content = `${value}${i + 1}`;
                    attrExpr += ` ${attr}="${content}"`;
                    renderedContent += ` ${content}`;
                }
                yield new LocalTemplateTestData(`<template as-custom-element="foo-bar">
              ${bindables}
              ${templateBody}
            </template>
            <foo-bar ${attrExpr}></foo-bar>`, new Map([['foo-bar', ei]]), new Map([['foo-bar', 1]]), renderedContent.trim());
            }
        }
        for (const { template, verifyDefinition, expectedContent } of getLocalTemplateTestData()) {
            it(template, function () {
                const { container, sut } = createFixture();
                sut.resolveResources = false;
                const definition = sut.compile({ name: 'lorem-ipsum', template }, container, null);
                verifyDefinition(definition, container);
            });
            if (template.includes(`mode="fromView"`)) {
                continue;
            }
            it(`${template} - content`, async function () {
                const { ctx, container } = createFixture();
                const host = ctx.doc.createElement('div');
                ctx.doc.body.appendChild(host);
                const au = new Aurelia(container)
                    .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
                    }) });
                await au.start();
                assert.html.textContent(host, expectedContent);
                await au.stop();
                ctx.doc.body.removeChild(host);
                au.dispose();
            });
        }
        it('throws error if a root template is a local template', function () {
            const template = `<template as-custom-element="foo-bar">I have local root!</template>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The root cannot be a local template itself.');
        });
        it('throws error if the custom element has only local templates', function () {
            const template = `
      <template as-custom-element="foo-bar">Does this work?</template>
      <template as-custom-element="fiz-baz">Of course not!</template>
      `;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The custom element does not have any content other than local template(s).');
        });
        it('throws error if a local template is not under root', function () {
            const template = `<div><template as-custom-element="foo-bar">Can I hide here?</template></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Local templates needs to be defined directly under root.');
        });
        it('throws error if a local template does not have name', function () {
            const template = `<template as-custom-element="">foo-bar</template><div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The value of "as-custom-element" attribute cannot be empty for local template');
        });
        it('throws error if a duplicate local templates are found', function () {
            const template = `<template as-custom-element="foo-bar">foo-bar1</template><template as-custom-element="foo-bar">foo-bar2</template><div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Duplicate definition of the local template named foo-bar');
        });
        it('throws error if bindable is not under root', function () {
            const template = `<template as-custom-element="foo-bar">
        <div>
          <bindable property="prop"></bindable>
        </div>
      </template>
      <div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Bindable properties of local templates needs to be defined directly under root.');
        });
        it('throws error if bindable property is missing', function () {
            const template = `<template as-custom-element="foo-bar">
        <bindable attribute="prop"></bindable>
      </template>
      <div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The attribute \'property\' is missing in <bindable attribute="prop"></bindable>');
        });
        it('throws error if duplicate bindable properties are found', function () {
            const template = `<template as-custom-element="foo-bar">
        <bindable property="prop" attribute="bar"></bindable>
        <bindable property="prop" attribute="baz"></bindable>
      </template>
      <div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Bindable property and attribute needs to be unique; found property: prop, attribute: ');
        });
        it('throws error if duplicate bindable attributes are found', function () {
            const template = `<template as-custom-element="foo-bar">
        <bindable property="prop1" attribute="bar"></bindable>
        <bindable property="prop2" attribute="bar"></bindable>
      </template>
      <div></div>`;
            const { container, sut } = createFixture();
            assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Bindable property and attribute needs to be unique; found property: prop2, attribute: bar');
        });
        for (const attr of ['if.bind="true"', 'if.bind="false"', 'else', 'repeat.for="item of items"', 'with.bind="{a:1}"', 'switch.bind="cond"', 'case="case1"']) {
            it(`throws error if local-template surrogate has template controller - ${attr}`, function () {
                const template = `<template as-custom-element="foo-bar" ${attr}>
        <bindable property="prop1" attribute="bar"></bindable>
      </template>
      <foo-bar></foo-bar>`;
                const { ctx, container } = createFixture();
                assert.throws(() => new Aurelia(container)
                    .app({ host: ctx.doc.createElement('div'), component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
                    }) }), `Template controller ${attr.split('.')[0]} is invalid on surrogate`);
            });
        }
        it('warns if bindable element has more attributes other than the allowed', function () {
            const template = `<template as-custom-element="foo-bar">
        <bindable property="prop" unknown-attr who-cares="no one"></bindable>
      </template>
      <div></div>`;
            const { container, sut } = createFixture();
            sut.compile({ name: 'lorem-ipsum', template }, container, null);
            if (__DEV__) {
                const sinks = container.get(DefaultLogger).sinks;
                const eventLog = sinks.find((s) => s instanceof EventLog);
                assert.strictEqual(eventLog.log.length, 1, `eventLog.log.length`);
                const event = eventLog.log[0];
                assert.strictEqual(event.severity, 3 /* LogLevel.warn */);
                assert.includes(event.toString(), 'The attribute(s) unknown-attr, who-cares will be ignored for <bindable property="prop" unknown-attr="" who-cares="no one"></bindable>. Only property, attribute, mode are processed.');
            }
        });
    });
    it('works with if', async function () {
        const template = `<template as-custom-element="foo-bar">
      <bindable property='prop'></bindable>
      \${prop}
     </template>
     <foo-bar prop="awesome possum" if.bind="true"></foo-bar>
     <foo-bar prop="ignored" if.bind="false"></foo-bar>`;
        const expectedContent = "awesome possum";
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
            }) });
        await au.start();
        assert.html.textContent(host, expectedContent);
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with for', async function () {
        const template = `<template as-custom-element="foo-bar">
      <bindable property='prop'></bindable>
      \${prop}
     </template>
     <foo-bar repeat.for="i of 5" prop.bind="i"></foo-bar>`;
        const expectedContent = "0 1 2 3 4";
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
            }) });
        await au.start();
        assert.html.textContent(host, expectedContent);
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with nested templates - 1', async function () {
        let LevelOne = class LevelOne {
        };
        __decorate([
            bindable,
            __metadata("design:type", String)
        ], LevelOne.prototype, "prop", void 0);
        LevelOne = __decorate([
            customElement({ name: 'level-one', template: `<template as-custom-element="foo-bar"><bindable property='prop'></bindable>Level One \${prop}</template><foo-bar prop.bind="prop"></foo-bar>` })
        ], LevelOne);
        let LevelTwo = class LevelTwo {
        };
        __decorate([
            bindable,
            __metadata("design:type", String)
        ], LevelTwo.prototype, "prop", void 0);
        LevelTwo = __decorate([
            customElement({
                name: 'level-two', template: `
      <template as-custom-element="foo-bar">
        <bindable property='prop'></bindable>
        Level Two \${prop}
        <level-one prop="inter-dimensional portal"></level-one>
      </template>
      <foo-bar prop.bind="prop"></foo-bar>
      <level-one prop.bind="prop"></level-one>
      `
            })
        ], LevelTwo);
        const template = `<level-two prop="foo2"></level-two><level-one prop="foo1"></level-one>`;
        const expectedContent = "Level Two foo2 Level One inter-dimensional portal Level One foo2 Level One foo1";
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .register(LevelOne, LevelTwo)
            .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
            }) });
        await au.start();
        assert.html.textContent(host, expectedContent);
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with nested templates - 2', async function () {
        const template = `
      <template as-custom-element="el-one">
        <template as-custom-element="one-two">
          1
        </template>
        2
        <one-two></one-two>
      </template>
      <template as-custom-element="el-two">
        <template as-custom-element="two-two">
          3
        </template>
        4
        <two-two></two-two>
      </template>
      <el-two></el-two>
      <el-one></el-one>
      `;
        const expectedContent = "4 3 2 1";
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class {
            }) });
        await au.start();
        assert.html.textContent(host, expectedContent);
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with non-global dependencies in owning template', async function () {
        let MyCe = class MyCe {
        };
        MyCe = __decorate([
            customElement({ name: 'my-ce', template: 'my-ce-content' })
        ], MyCe);
        const template = `
      <my-ce></my-ce>
      <my-le></my-le>
      <template as-custom-element="my-le">
        my-le-content
        <my-ce></my-ce>
      </template>
      `;
        let App = class App {
        };
        App = __decorate([
            customElement({ name: 'my-app', template, dependencies: [MyCe] })
        ], App);
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: App });
        await au.start();
        assert.html.textContent(host, 'my-ce-content my-le-content my-ce-content');
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with non-global dependencies - template-controllers - if', async function () {
        let MyCe = class MyCe {
        };
        MyCe = __decorate([
            customElement({ name: 'my-ce', template: 'my-ce-content' })
        ], MyCe);
        const template = `
      <my-ce></my-ce>
      <my-le if.bind="true"></my-le>
      <template as-custom-element="my-le">
        my-le-content
        <my-ce></my-ce>
      </template>
      `;
        let App = class App {
        };
        App = __decorate([
            customElement({ name: 'my-app', template, dependencies: [MyCe] })
        ], App);
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: App });
        await au.start();
        assert.html.textContent(host, 'my-ce-content my-le-content my-ce-content');
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('works with non-global dependencies - nested-template-controllers - [repeat.for]>[if]', async function () {
        let MyCe = class MyCe {
        };
        MyCe = __decorate([
            customElement({ name: 'my-ce', template: 'my-ce-content' })
        ], MyCe);
        const template = `
      <my-ce></my-ce>
      <my-le repeat.for="prop of 5" if.bind="prop % 2 === 0" prop.bind></my-le>
      <template as-custom-element="my-le">
        <bindable property="prop"></bindable>
        \${prop}
        <my-ce></my-ce>
      </template>
      `;
        let App = class App {
        };
        App = __decorate([
            customElement({ name: 'my-app', template, dependencies: [MyCe] })
        ], App);
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: App });
        await au.start();
        assert.html.textContent(host, 'my-ce-content 0 my-ce-content 2 my-ce-content 4 my-ce-content');
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('recognizes owning element', async function () {
        const template = `
        my-app-content
        <my-le prop.bind></my-le>
        <template as-custom-element="my-le">
          <bindable property="prop"></bindable>
          my-le-content
          <my-app if.bind="prop"></my-app>
        </template>`;
        let App = class App {
            constructor() {
                this.prop = false;
            }
        };
        App = __decorate([
            customElement({ name: 'my-app', template })
        ], App);
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: App });
        await au.start();
        const vm = au.root.controller.viewModel;
        assert.html.textContent(host, 'my-app-content my-le-content');
        vm.prop = true;
        ctx.platform.domWriteQueue.flush();
        assert.html.textContent(host, 'my-app-content my-le-content my-app-content my-le-content');
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('all local elements recognize each other', async function () {
        const template = `
        my-app-content
        <my-le-1></my-le-1>
        <my-le-2></my-le-2>

        <template as-custom-element="my-le-1">
          my-le-1-content
          <my-le-2></my-le-2>
        </template>

        <template as-custom-element="my-le-2">
          my-le-2-content
          <my-le-3></my-le-3>
        </template>

        <template as-custom-element="my-le-3">
          my-le-3-content
        </template>`;
        let App = class App {
        };
        App = __decorate([
            customElement({ name: 'my-app', template })
        ], App);
        const { ctx, container } = createFixture();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container)
            .app({ host, component: App });
        await au.start();
        assert.html.textContent(host, 'my-app-content ' +
            'my-le-1-content my-le-2-content my-le-3-content ' +
            'my-le-2-content my-le-3-content');
        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
});
//# sourceMappingURL=template-compiler.local-templates.spec.js.map