import { CustomElementHost, ICustomElement, IDOM, IElementProjector, IProjectorLocator, TemplateDefinition } from '@aurelia/runtime';
export declare class HTMLProjectorLocator implements IProjectorLocator<Node> {
    getElementProjector(dom: IDOM<Node>, $component: ICustomElement<Node>, host: CustomElementHost<HTMLElement>, def: TemplateDefinition): IElementProjector<Node>;
}
//# sourceMappingURL=projectors.d.ts.map