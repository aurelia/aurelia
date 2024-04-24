import { Constructable, IContainer, IPlatform, Key } from '@aurelia/kernel';
import { createInterface } from './utilities';
import { AttrSyntax } from './attribute-pattern';
import { IInstruction } from './instructions';

export interface IElementComponentDefinition<TBindables extends string = string> {
  name: string;
  type: 'custom-element';
  template?: string | Node | null;
  dependencies?: readonly Key[];
  instructions?: readonly IInstruction[][];
  surrogates?: readonly IInstruction[];
  needsCompile?: boolean;
  containerless?: boolean;
  /**
   * Indicates whether there's a <slot> element in the template of this element
   */
  hasSlots?: boolean;
  shadowOptions?: { mode: 'open' | 'closed' } | null;
  capture?: boolean | ((attrName: string) => boolean);
  enhance?: boolean;
  processContent?: ProcessContentHook | null;
  bindables?: (TBindables | IComponentBindablePropDefinition)[] | Record<TBindables, Omit<IComponentBindablePropDefinition, 'name'> | true>;
  Type?: Constructable;
}

export type ProcessContentHook = <T extends Constructable>(this: T | undefined, node: HTMLElement, platform: IDomPlatform, data: Record<PropertyKey, unknown>) => boolean | void;

export interface IAttributeComponentDefinition<TBindables extends string = string> {
  name: string;
  type: 'custom-attribute';
  noMultiBindings?: boolean;
  isTemplateController?: boolean;
  aliases?: readonly string[];
  defaultBindingMode?: string | number;
  bindables?: (TBindables | IComponentBindablePropDefinition)[] | Record<TBindables, Omit<IComponentBindablePropDefinition, 'name'> | true> | null;
}

export interface IComponentBindablePropDefinition {
  name: string;
  attribute?: string;
  primary?: boolean;
  mode?: string | number;
  set?: (v: any) => any;
}

export type ICompiledElementComponentDefinition = IElementComponentDefinition & {
  instructions: IInstruction[][];
  surrogates: IInstruction[][];
  template: HTMLElement | null;
};

export const ITemplateCompiler = createInterface<ITemplateCompiler>('ITemplateCompiler');
export interface ITemplateCompiler {
  /**
   * Indicates whether this compiler should compile template in debug mode
   *
   * For the default compiler, this means all expressions are kept as is on the template
   */
  debug: boolean;
  /**
   * Experimental API, for optimization.
   *
   * `true` to create CustomElement/CustomAttribute instructions
   * with resolved resources constructor during compilation, instead of name
   */
  resolveResources: boolean;

  compile(
    partialDefinition: IElementComponentDefinition,
    context: IContainer,
  ): ICompiledElementComponentDefinition;

  /**
   * Compile a list of captured attributes as if they are declared in a template
   *
   * @param requestor - the context definition where the attributes is compiled
   * @param attrSyntaxes - the attributes captured
   * @param container - the container containing information for the compilation
   * @param host - the host element where the attributes are spreaded on
   */
  compileSpread<T extends IElementComponentDefinition>(
    requestor: T,
    attrSyntaxes: AttrSyntax[],
    container: IContainer,
    target: Element,
    /**
     * An associated custom element definition for the target host element
     * Sometimes spread compilation may occur without the container having all necessary information
     * about the targeted element that is receiving the spread
     *
     * Caller of this method may want to provide this information dynamically instead
     */
    targetDef?: T,
  ): IInstruction[];
}

export interface IDomPlatform extends IPlatform {
  document: Document;
}
