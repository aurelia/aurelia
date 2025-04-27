import { DI, resolve, IContainer, InstanceProvider } from '@aurelia/kernel';
import { IPlatform, IRendering, CustomElementDefinition, CustomElement, INode, Controller } from '@aurelia/runtime-html';

const IWcElementRegistry = /*@__PURE__*/ DI.createInterface(x => x.singleton(WcCustomElementRegistry));
/**
 * A default implementation of `IWcElementRegistry` interface.
 */
class WcCustomElementRegistry {
    constructor() {
        /** @internal */
        this.ctn = resolve(IContainer);
        /** @internal */
        this.p = resolve(IPlatform);
        /** @internal */
        this.r = resolve(IRendering);
    }
    define(name, def, options) {
        if (!name.includes('-')) {
            throw createError('Invalid web-components custom element name. It must include a "-"');
        }
        let elDef;
        if (def == null) {
            throw createError('Invalid custom element definition');
        }
        switch (typeof def) {
            case 'function':
                elDef = CustomElement.isType(def)
                    ? CustomElement.getDefinition(def)
                    : CustomElementDefinition.create(CustomElement.generateName(), def);
                break;
            default:
                elDef = CustomElementDefinition.getOrCreate(def);
                break;
        }
        if (elDef.containerless) {
            throw createError('Containerless custom element is not supported. Consider using buitl-in extends instead');
        }
        const BaseClass = options?.extends
            ? this.p.document.createElement(options.extends).constructor
            : this.p.HTMLElement;
        const container = this.ctn;
        const rendering = this.r;
        const bindables = elDef.bindables;
        const p = this.p;
        class CustomElementClass extends BaseClass {
            auInit() {
                if (this.auInited) {
                    return;
                }
                this.auInited = true;
                const childCtn = container.createChild();
                registerResolver(childCtn, p.HTMLElement, registerResolver(childCtn, p.Element, registerResolver(childCtn, INode, new InstanceProvider('ElementProvider', this))));
                const compiledDef = rendering.compile(elDef, childCtn);
                const viewModel = childCtn.invoke(compiledDef.Type);
                this.auCtrl = Controller.$el(childCtn, viewModel, this, null, compiledDef);
            }
            connectedCallback() {
                this.auInit();
                // eslint-disable-next-line
                this.auCtrl.activate(this.auCtrl, null);
            }
            disconnectedCallback() {
                // eslint-disable-next-line
                this.auCtrl.deactivate(this.auCtrl, null);
            }
            adoptedCallback() {
                this.auInit();
            }
            attributeChangedCallback(name, oldValue, newValue) {
                this.auInit();
                this.auCtrl.viewModel[name] = newValue;
            }
        }
        CustomElementClass.observedAttributes = Object.keys(bindables);
        for (const bindableProp in bindables) {
            Object.defineProperty(CustomElementClass.prototype, bindableProp, {
                configurable: true,
                enumerable: false,
                get() {
                    return this['auCtrl'].viewModel[bindableProp];
                },
                set(v) {
                    if (!this['auInited']) {
                        this['auInit']();
                    }
                    this['auCtrl'].viewModel[bindableProp] = v;
                }
            });
        }
        this.p.customElements.define(name, CustomElementClass, options);
        return CustomElementClass;
    }
}
const registerResolver = (ctn, key, resolver) => ctn.registerResolver(key, resolver);
const createError = (message) => new Error(message);

export { IWcElementRegistry, WcCustomElementRegistry };
//# sourceMappingURL=index.dev.mjs.map
