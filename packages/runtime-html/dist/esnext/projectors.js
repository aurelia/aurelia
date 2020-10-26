import { emptyArray, toArray, Metadata, DI } from '@aurelia/kernel';
import { convertToRenderLocation } from './dom';
import { CustomElement } from './resources/custom-element';
import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';
const defaultShadowOptions = {
    mode: 'open'
};
export const IProjectorLocator = DI.createInterface('IProjectorLocator').withDefault(x => x.singleton(ProjectorLocator));
export class ProjectorLocator {
    getElementProjector($component, host, def) {
        if (def.shadowOptions || def.hasSlots) {
            if (def.containerless) {
                throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
            }
            return new ShadowDOMProjector($component, host, def);
        }
        if (def.containerless) {
            return new ContainerlessProjector($component, host);
        }
        return new HostProjector($component, host, def.enhance);
    }
}
const childObserverOptions = { childList: true };
export class ShadowDOMProjector {
    constructor(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly
    $controller, host, definition) {
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
        const obs = new this.host.ownerDocument.defaultView.MutationObserver(callback);
        obs.observe(this.host, options);
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
export class ContainerlessProjector {
    constructor($controller, host) {
        if (host.childNodes.length) {
            this.childNodes = toArray(host.childNodes);
        }
        else {
            this.childNodes = emptyArray;
        }
        this.host = convertToRenderLocation(host);
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
export class HostProjector {
    constructor($controller, host, enhance) {
        this.host = host;
        this.enhance = enhance;
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
        nodes.appendTo(this.host, this.enhance);
    }
    take(nodes) {
        nodes.remove();
        nodes.unlink();
    }
}
//# sourceMappingURL=projectors.js.map