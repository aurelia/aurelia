import { INodeSequence } from './dom';
import { ICustomElementController } from './lifecycle';
import { CustomElementDefinition, CustomElementHost } from './resources/custom-element';
export declare const IProjectorLocator: import("@aurelia/kernel").InterfaceSymbol<IProjectorLocator>;
export interface IProjectorLocator extends ProjectorLocator {
}
export declare class ProjectorLocator {
    getElementProjector($component: ICustomElementController, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): ElementProjector;
}
export declare type ElementProjector = ShadowDOMProjector | ContainerlessProjector | HostProjector;
export declare class ShadowDOMProjector {
    private $controller;
    host: CustomElementHost<HTMLElement>;
    shadowRoot: CustomElementHost<ShadowRoot>;
    constructor($controller: ICustomElementController, host: CustomElementHost<HTMLElement>, definition: CustomElementDefinition);
    get children(): ArrayLike<ChildNode>;
    subscribeToChildrenChange(callback: () => void, options?: MutationObserverInit): void;
    provideEncapsulationSource(): CustomElementHost<ShadowRoot>;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
export declare class ContainerlessProjector {
    host: CustomElementHost;
    private readonly childNodes;
    constructor($controller: ICustomElementController, host: Node);
    get children(): ArrayLike<ChildNode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(): Node;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
export declare class HostProjector {
    host: CustomElementHost;
    private readonly enhance;
    constructor($controller: ICustomElementController, host: CustomElementHost, enhance: boolean);
    get children(): ArrayLike<ChildNode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(): Node;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
//# sourceMappingURL=projectors.d.ts.map