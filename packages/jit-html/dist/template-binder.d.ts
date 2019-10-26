import { IAttributeParser, ResourceModel } from '@aurelia/jit';
import { IDOM, IExpressionParser } from '@aurelia/runtime';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
import { PlainElementSymbol } from './semantic-model';
/**
 * TemplateBinder. Todo: describe goal of this class
 */
export declare class TemplateBinder {
    readonly dom: IDOM;
    readonly resources: ResourceModel;
    readonly attrParser: IAttributeParser;
    readonly exprParser: IExpressionParser;
    readonly attrSyntaxTransformer: IAttrSyntaxTransformer;
    constructor(dom: IDOM, resources: ResourceModel, attrParser: IAttributeParser, exprParser: IExpressionParser, attrSyntaxTransformer: IAttrSyntaxTransformer);
    bind(node: HTMLTemplateElement): PlainElementSymbol;
    private bindManifest;
    private bindLetElement;
    private bindAttributes;
    private ensureAttributeOrder;
    private bindChildNodes;
    private bindText;
    private declareTemplateController;
    private bindCustomAttribute;
    private bindMultiAttribute;
    private bindPlainAttribute;
}
//# sourceMappingURL=template-binder.d.ts.map