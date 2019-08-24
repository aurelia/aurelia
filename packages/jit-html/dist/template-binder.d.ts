import { IAttributeParser, PlainElementSymbol, ResourceModel } from '@aurelia/jit';
import { IDOM, IExpressionParser } from '@aurelia/runtime';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
/**
 * TemplateBinder. Todo: describe goal of this class
 */
export declare class TemplateBinder {
    dom: IDOM;
    resources: ResourceModel;
    attrParser: IAttributeParser;
    exprParser: IExpressionParser;
    attrSyntaxTransformer: IAttrSyntaxTransformer;
    private surrogate;
    private manifest;
    private manifestRoot;
    private parentManifestRoot;
    private partName;
    constructor(dom: IDOM, resources: ResourceModel, attrParser: IAttributeParser, exprParser: IExpressionParser, attrSyntaxModifier: IAttrSyntaxTransformer);
    bind(node: HTMLTemplateElement): PlainElementSymbol;
    private bindManifest;
    private bindLetElement;
    private bindAttributes;
    private bindChildNodes;
    private bindText;
    private declareTemplateController;
    private bindCustomAttribute;
    private bindMultiAttribute;
    private bindPlainAttribute;
    private declareReplacePart;
}
//# sourceMappingURL=template-binder.d.ts.map