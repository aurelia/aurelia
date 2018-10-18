import { IExpressionParser, IResourceDescriptions, ITemplateCompiler, ITemplateDefinition, TemplateDefinition, ViewCompileFlags } from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { IElementParser } from './element-parser';
export declare class TemplateCompiler implements ITemplateCompiler {
    exprParser: IExpressionParser;
    elParser: IElementParser;
    attrParser: IAttributeParser;
    readonly name: string;
    constructor(exprParser: IExpressionParser, elParser: IElementParser, attrParser: IAttributeParser);
    compile(definition: ITemplateDefinition, resources: IResourceDescriptions, flags?: ViewCompileFlags): TemplateDefinition;
    private compileNode;
    private compileSurrogate;
    private compileElementNode;
    private compileCustomElement;
    private compileCustomAttribute;
    private compileLetElement;
    private compileAttribute;
}
//# sourceMappingURL=template-compiler.d.ts.map