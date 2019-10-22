import { IContainer, IResolver } from '@aurelia/kernel';
import { CustomElementHost, IController, IDOM, IElementProjector, IProjectorLocator, CustomElementDefinition } from '@aurelia/runtime';
export declare class HTMLProjectorLocator implements IProjectorLocator<Node> {
    static register(container: IContainer): IResolver<IProjectorLocator>;
    getElementProjector(dom: IDOM<Node>, $component: IController<Node>, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): IElementProjector<Node>;
}
//# sourceMappingURL=projectors.d.ts.map