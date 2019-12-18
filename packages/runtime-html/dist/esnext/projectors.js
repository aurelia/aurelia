import { PLATFORM, Registration, Reporter, toArray, Metadata } from '@aurelia/kernel';
import { IProjectorLocator, CustomElement, } from '@aurelia/runtime';
import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';
const defaultShadowOptions = {
    mode: 'open'
};
export class HTMLProjectorLocator {
    static register(container) {
        return Registration.singleton(IProjectorLocator, this).register(container);
    }
    getElementProjector(dom, $component, host, def) {
        if (def.shadowOptions || def.hasSlots) {
            if (def.containerless) {
                throw Reporter.error(21);
            }
            return new ShadowDOMProjector(dom, $component, host, def);
        }
        if (def.containerless) {
            return new ContainerlessProjector(dom, $component, host);
        }
        return new HostProjector($component, host);
    }
}
const childObserverOptions = { childList: true };
/** @internal */
export class ShadowDOMProjector {
    constructor(dom, 
    // eslint-disable-next-line @typescript-eslint/prefer-readonly
    $controller, host, definition) {
        this.dom = dom;
        this.$controller = $controller;
        this.host = host;
        let shadowOptions;
        if (definition.shadowOptions instanceof Object &&
            'mode' in definition.shadowOptions) {
            shadowOptions = definition.shadowOptions;
        }
        else {
            shadowOptions = defaultShadowOptions;
        }
        this.shadowRoot = host.attachShadow(shadowOptions);
        Metadata.define(CustomElement.name, $controller, this.host);
        Metadata.define(CustomElement.name, $controller, this.shadowRoot);
    }
    get children() {
        return this.host.childNodes;
    }
    subscribeToChildrenChange(callback, options = childObserverOptions) {
        // TODO: add a way to dispose/disconnect
        this.dom.createNodeObserver(this.host, callback, options);
    }
    provideEncapsulationSource() {
        return this.shadowRoot;
    }
    project(nodes) {
        const context = this.$controller.context;
        const styles = context.has(IShadowDOMStyles, false)
            ? context.get(IShadowDOMStyles)
            : context.get(IShadowDOMGlobalStyles);
        styles.applyTo(this.shadowRoot);
        nodes.appendTo(this.shadowRoot);
    }
    take(nodes) {
        nodes.remove();
        nodes.unlink();
    }
}
/** @internal */
export class ContainerlessProjector {
    constructor(dom, $controller, host) {
        if (host.childNodes.length) {
            this.childNodes = toArray(host.childNodes);
        }
        else {
            this.childNodes = PLATFORM.emptyArray;
        }
        this.host = dom.convertToRenderLocation(host);
        Metadata.define(CustomElement.name, $controller, this.host);
    }
    get children() {
        return this.childNodes;
    }
    subscribeToChildrenChange(callback) {
        // TODO: turn this into an error
        // Containerless does not have a container node to observe children on.
    }
    provideEncapsulationSource() {
        return this.host.getRootNode();
    }
    project(nodes) {
        nodes.insertBefore(this.host);
    }
    take(nodes) {
        nodes.remove();
        nodes.unlink();
    }
}
/** @internal */
export class HostProjector {
    constructor($controller, host) {
        this.host = host;
        Metadata.define(CustomElement.name, $controller, host);
    }
    get children() {
        return this.host.childNodes;
    }
    subscribeToChildrenChange(callback) {
        // Do nothing since this scenario will never have children.
    }
    provideEncapsulationSource() {
        return this.host.getRootNode();
    }
    project(nodes) {
        nodes.appendTo(this.host);
    }
    take(nodes) {
        nodes.remove();
        nodes.unlink();
    }
}
//# sourceMappingURL=projectors.js.map