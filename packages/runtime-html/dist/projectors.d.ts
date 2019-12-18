import { IContainer, IResolver } from '@aurelia/kernel';
import { CustomElementHost, IDOM, IElementProjector, IProjectorLocator, CustomElementDefinition, ICustomElementController } from '@aurelia/runtime';
export declare class HTMLProjectorLocator implements IProjectorLocator<Node> {
    static register(container: IContainer): IResolver<IProjectorLocator<Node>>;
    getElementProjector(dom: IDOM<Node>, $component: ICustomElementController<Node>, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): IElementProjector<Node>;
}
//# sourceMappingURL=projectors.d.ts.map