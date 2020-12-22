import { IContainer } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { IAttributeParser } from './resources/attribute-pattern.js';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer.js';
import { IPlatform } from './platform.js';
import { PlainElementSymbol } from './semantic-model.js';
/**
 * TemplateBinder. Todo: describe goal of this class
 */
export declare class TemplateBinder {
    readonly platform: IPlatform;
    readonly container: IContainer;
    readonly attrParser: IAttributeParser;
    readonly exprParser: IExpressionParser;
    readonly attrSyntaxTransformer: IAttrSyntaxTransformer;
    constructor(platform: IPlatform, container: IContainer, attrParser: IAttributeParser, exprParser: IExpressionParser, attrSyntaxTransformer: IAttrSyntaxTransformer);
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
    private readonly commandLookup;
    /**
     * Retrieve a binding command resource.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    private getBindingCommand;
}
//# sourceMappingURL=template-binder.d.ts.map