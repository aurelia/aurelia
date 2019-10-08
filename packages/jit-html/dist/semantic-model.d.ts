import { AnySymbol as $AnySymbol, BindingSymbol, CustomAttributeSymbol, CustomElementSymbol as $CustomElementSymbol, ElementSymbol as $ElementSymbol, LetElementSymbol as $LetElementSymbol, NodeSymbol as $NodeSymbol, ParentNodeSymbol as $ParentNodeSymbol, PlainAttributeSymbol, PlainElementSymbol as $PlainElementSymbol, ReplacePartSymbol as $ReplacePartSymbol, ResourceAttributeSymbol as $ResourceAttributeSymbol, SymbolWithBindings as $SymbolWithBindings, SymbolWithMarker as $SymbolWithMarker, SymbolWithTemplate as $SymbolWithTemplate, TemplateControllerSymbol as $TemplateControllerSymbol, TextSymbol as $TextSymbol } from '@aurelia/jit';
export declare type AnySymbol = $AnySymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type ElementSymbol = $ElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type NodeSymbol = $NodeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type ParentNodeSymbol = $ParentNodeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type ResourceAttributeSymbol = $ResourceAttributeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type SymbolWithBindings = $SymbolWithBindings<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type SymbolWithMarker = $SymbolWithMarker<Text, HTMLTemplateElement | HTMLElement, Comment>;
export declare type SymbolWithTemplate = $SymbolWithTemplate<Text, HTMLTemplateElement | HTMLElement, Comment>;
declare class $$CustomElementSymbol extends $CustomElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {
}
declare class $$LetElementSymbol extends $LetElementSymbol<HTMLTemplateElement | HTMLElement, Comment> {
}
declare class $$PlainElementSymbol extends $PlainElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {
}
declare class $$ReplacePartSymbol extends $ReplacePartSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {
}
declare class $$TemplateControllerSymbol extends $TemplateControllerSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {
}
declare class $$TextSymbol extends $TextSymbol<Text, Comment> {
}
export declare const CustomElementSymbol: typeof $$CustomElementSymbol;
export declare const LetElementSymbol: typeof $$LetElementSymbol;
export declare const PlainElementSymbol: typeof $$PlainElementSymbol;
export declare const ReplacePartSymbol: typeof $$ReplacePartSymbol;
export declare const TemplateControllerSymbol: typeof $$TemplateControllerSymbol;
export declare const TextSymbol: typeof $$TextSymbol;
export interface CustomElementSymbol extends $$CustomElementSymbol {
}
export interface LetElementSymbol extends $$LetElementSymbol {
}
export interface PlainElementSymbol extends $$PlainElementSymbol {
}
export interface ReplacePartSymbol extends $$ReplacePartSymbol {
}
export interface TemplateControllerSymbol extends $$TemplateControllerSymbol {
}
export interface TextSymbol extends $$TextSymbol {
}
export { BindingSymbol, CustomAttributeSymbol, PlainAttributeSymbol, };
//# sourceMappingURL=semantic-model.d.ts.map