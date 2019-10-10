import {
  AnySymbol as $AnySymbol,
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol as $CustomElementSymbol,
  ElementSymbol as $ElementSymbol,
  LetElementSymbol as $LetElementSymbol,
  NodeSymbol as $NodeSymbol,
  ParentNodeSymbol as $ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol as $PlainElementSymbol,
  ReplacePartSymbol as $ReplacePartSymbol,
  ResourceAttributeSymbol as $ResourceAttributeSymbol,
  SymbolWithBindings as $SymbolWithBindings,
  SymbolWithMarker as $SymbolWithMarker,
  SymbolWithTemplate as $SymbolWithTemplate,
  TemplateControllerSymbol as $TemplateControllerSymbol,
  TextSymbol as $TextSymbol,
} from '@aurelia/jit';

export type AnySymbol = $AnySymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type ElementSymbol = $ElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type NodeSymbol = $NodeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type ParentNodeSymbol = $ParentNodeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type ResourceAttributeSymbol = $ResourceAttributeSymbol<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type SymbolWithBindings = $SymbolWithBindings<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type SymbolWithMarker = $SymbolWithMarker<Text, HTMLTemplateElement | HTMLElement, Comment>;
export type SymbolWithTemplate = $SymbolWithTemplate<Text, HTMLTemplateElement | HTMLElement, Comment>;

/* eslint-disable @typescript-eslint/class-name-casing */
declare class $$CustomElementSymbol extends $CustomElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {}
declare class $$LetElementSymbol extends $LetElementSymbol<HTMLTemplateElement | HTMLElement, Comment> {}
declare class $$PlainElementSymbol extends $PlainElementSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {}
declare class $$ReplacePartSymbol extends $ReplacePartSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {}
declare class $$TemplateControllerSymbol extends $TemplateControllerSymbol<Text, HTMLTemplateElement | HTMLElement, Comment> {}
declare class $$TextSymbol extends $TextSymbol<Text, Comment> {}

export const CustomElementSymbol = $CustomElementSymbol as typeof $$CustomElementSymbol;
export const LetElementSymbol = $LetElementSymbol as typeof $$LetElementSymbol;
export const PlainElementSymbol = $PlainElementSymbol as typeof $$PlainElementSymbol;
export const ReplacePartSymbol = $ReplacePartSymbol as typeof $$ReplacePartSymbol;
export const TemplateControllerSymbol = $TemplateControllerSymbol as typeof $$TemplateControllerSymbol;
export const TextSymbol = $TextSymbol as typeof $$TextSymbol;

export interface CustomElementSymbol extends $$CustomElementSymbol {}
export interface LetElementSymbol extends $$LetElementSymbol {}
export interface PlainElementSymbol extends $$PlainElementSymbol {}
export interface ReplacePartSymbol extends $$ReplacePartSymbol {}
export interface TemplateControllerSymbol extends $$TemplateControllerSymbol {}
export interface TextSymbol extends $$TextSymbol {}

export {
  BindingSymbol,
  CustomAttributeSymbol,
  PlainAttributeSymbol,
};
