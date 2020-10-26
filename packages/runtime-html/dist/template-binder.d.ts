import { IExpressionParser } from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
import { IPlatform } from './platform';
import { ResourceModel } from './resource-model';
import { PlainElementSymbol } from './semantic-model';
/**
 * TemplateBinder. Todo: describe goal of this class
 */
export declare class TemplateBinder {
    readonly platform: IPlatform;
    readonly resources: ResourceModel;
    readonly attrParser: IAttributeParser;
    readonly exprParser: IExpressionParser;
    readonly attrSyntaxTransformer: IAttrSyntaxTransformer;
    constructor(platform: IPlatform, resources: ResourceModel, attrParser: IAttributeParser, exprParser: IExpressionParser, attrSyntaxTransformer: IAttrSyntaxTransformer);
    bind(node: HTMLElement): PlainElementSymbol;
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