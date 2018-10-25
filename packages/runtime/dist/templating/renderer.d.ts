import { Immutable } from '@aurelia/kernel';
import { IHydrateElementInstruction, TemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode } from '../dom';
import { ICustomElement } from './custom-element';
import { IRenderable } from './rendering-engine';
export interface IRenderer {
    render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
    hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void;
}
//# sourceMappingURL=renderer.d.ts.map