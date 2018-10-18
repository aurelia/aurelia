import { INode, INodeSequence } from '../dom';
import { TemplatePartDefinitions } from './instructions';
import { IRenderContext } from './render-context';
import { IRenderable } from './renderable';
export interface ITemplate {
    readonly renderContext: IRenderContext;
    createFor(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): INodeSequence;
}
//# sourceMappingURL=template.d.ts.map