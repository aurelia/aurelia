import { IContainer, IResolver } from '@aurelia/kernel';
import { CustomElementHost, ICustomElement, IDOM, IElementProjector, IProjectorLocator, TemplateDefinition } from '@aurelia/runtime';
export declare class HTMLProjectorLocator implements IProjectorLocator<Node> {
    static register(container: IContainer): IResolver<IProjectorLocator>;
    getElementProjector(dom: IDOM<Node>, $component: ICustomElement<Node>, host: CustomElementHost<HTMLElement>, def: TemplateDefinition): IElementProjector<Node>;
}
//# sourceMappingURL=projectors.d.ts.map