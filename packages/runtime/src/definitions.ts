import { DI, Immutable, IRegistry, Omit, PLATFORM } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { DelegationStrategy } from './binding/event-manager';
import { INode, IShadowRootInit } from './dom.interfaces';
import { IResourceDefinition, ResourceDescription, ResourcePartDescription } from './resource';
import { CustomElementConstructor, ICustomElement } from './templating/custom-element';
import { ICustomElementHost } from './templating/lifecycle-render';

/** @internal */
export const customElementName = 'custom-element';
/** @internal */
export function customElementKey(name: string): string {
  return `${customElementName}:${name}`;
}
/** @internal */
export function customElementBehavior(node: ICustomElementHost): ICustomElement | null {
  return node.$customElement === undefined ? null : node.$customElement;
}

/** @internal */
export const customAttributeName = 'custom-attribute';
/** @internal */
export function customAttributeKey(name: string): string {
  return `${customAttributeName}:${name}`;
}

export type BindableSource = Omit<IBindableDescription, 'property'>;

export interface IBindableDescription {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
}

export const enum TargetedInstructionType {
  textBinding = 'a',
  interpolation = 'b',
  propertyBinding = 'c',
  iteratorBinding = 'd',
  listenerBinding = 'e',
  callBinding = 'f',
  refBinding = 'g',
  stylePropertyBinding = 'h',
  setProperty = 'i',
  setAttribute = 'j',
  hydrateElement = 'k',
  hydrateAttribute = 'l',
  hydrateTemplateController = 'm',
  hydrateLetElement = 'n',
  letBinding = 'o'
}

const instructionTypeValues = 'abcdefghijklmno';

export interface IBuildInstruction {
  required: boolean;
  compiler?: string;
}

export interface ITemplateDefinition extends IResourceDefinition {
  cache?: '*' | number;
  template?: unknown;
  instructions?: TargetedInstruction[][];
  dependencies?: IRegistry[];
  build?: IBuildInstruction;
  surrogates?: TargetedInstruction[];
  bindables?: Record<string, IBindableDescription>;
  containerless?: boolean;
  shadowOptions?: IShadowRootInit;
  hasSlots?: boolean;
}

export type TemplateDefinition = ResourceDescription<ITemplateDefinition>;

export type TemplatePartDefinitions = Record<string, ResourcePartDescription<ITemplateDefinition>>;
export type BindableDefinitions = Record<string, Immutable<IBindableDescription>>;

export interface IAttributeDefinition extends IResourceDefinition {
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
  hasDynamicOptions?: boolean;
  bindables?: Record<string, IBindableDescription>;
}

export type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;

export const ITargetedInstruction = DI.createInterface<ITargetedInstruction>();
export interface ITargetedInstruction {
  type: TargetedInstructionType;
}

export type NodeInstruction =
  ITextBindingInstruction |
  IHydrateElementInstruction |
  IHydrateTemplateController |
  IHydrateLetElementInstruction;

export type AttributeInstruction =
  IInterpolationInstruction |
  IPropertyBindingInstruction |
  IIteratorBindingInstruction |
  IListenerBindingInstruction |
  ICallBindingInstruction |
  IRefBindingInstruction |
  IStylePropertyBindingInstruction |
  ISetPropertyInstruction |
  ISetAttributeInstruction |
  ILetBindingInstruction |
  IHydrateAttributeInstruction;

export type TargetedInstruction = NodeInstruction | AttributeInstruction;

// TODO: further improve specificity and integrate with the definitions;
export type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];

export function isTargetedInstruction(value: unknown): value is TargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
}

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.textBinding;
  from: string | Interpolation;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  from: string | Interpolation;
  to: string;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  from: string | Interpolation;
  to: string;
}

export interface IPropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.propertyBinding;
  mode: BindingMode;
  from: string | IsBindingBehavior;
  to: string;
  oneTime?: boolean;
}

export interface IIteratorBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.iteratorBinding;
  from: string | ForOfStatement;
  to: string;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.listenerBinding;
  from: string | IsBindingBehavior;
  to: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface ICallBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.callBinding;
  from: string | IsBindingBehavior;
  to: string;
}

export interface IRefBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.refBinding;
  from: string | IsBindingBehavior;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.stylePropertyBinding;
  from: string | IsBindingBehavior;
  to: string;
}

export interface ISetPropertyInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setProperty;
  value: unknown;
  to: string;
}

export interface ISetAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setAttribute;
  value: string;
  to: string;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: string;
  instructions: TargetedInstruction[];
  parts?: Record<string, ITemplateDefinition>;
}

export interface IHydrateAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateAttribute;
  res: string;
  instructions: TargetedInstruction[];
}

export interface IHydrateTemplateController extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateTemplateController;
  res: string;
  instructions: TargetedInstruction[];
  def: ITemplateDefinition;
  link?: boolean;
}

export interface IHydrateLetElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateLetElement;
  instructions: ILetBindingInstruction[];
  toViewModel: boolean;
}

export interface ILetBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.letBinding;
  from: string | IsBindingBehavior | Interpolation;
  to: string;
}

/** @internal */
export const buildRequired: IBuildInstruction = Object.freeze({
  required: true,
  compiler: 'default'
});

const buildNotRequired: IBuildInstruction = Object.freeze({
  required: false,
  compiler: 'default'
});

// Note: this is a little perf thing; having one predefined class with the properties always
// assigned in the same order ensures the browser can keep reusing the same generated hidden
// class
class DefaultTemplateDefinition implements Required<ITemplateDefinition> {
  public name: ITemplateDefinition['name'];
  public cache: ITemplateDefinition['cache'];
  public template: ITemplateDefinition['template'];
  public instructions: ITemplateDefinition['instructions'];
  public dependencies: ITemplateDefinition['dependencies'];
  public build: ITemplateDefinition['build'];
  public surrogates: ITemplateDefinition['surrogates'];
  public bindables: ITemplateDefinition['bindables'];
  public containerless: ITemplateDefinition['containerless'];
  public shadowOptions: ITemplateDefinition['shadowOptions'];
  public hasSlots: ITemplateDefinition['hasSlots'];

  constructor() {
    this.name = 'unnamed';
    this.template = null;
    this.cache = 0;
    this.build = buildNotRequired;
    this.bindables = PLATFORM.emptyObject;
    this.instructions = PLATFORM.emptyArray as this['instructions'];
    this.dependencies = PLATFORM.emptyArray as this['dependencies'];
    this.surrogates = PLATFORM.emptyArray as this['surrogates'];
    this.containerless = false;
    this.shadowOptions = null;
    this.hasSlots = false;
  }
}

const templateDefinitionAssignables = [
  'name',
  'template',
  'cache',
  'build',
  'containerless',
  'shadowOptions',
  'hasSlots'
];

const templateDefinitionArrays = [
  'instructions',
  'dependencies',
  'surrogates'
];

export function buildTemplateDefinition(
  ctor: CustomElementConstructor,
  name: string): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: null,
  def: Immutable<ITemplateDefinition>): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: CustomElementConstructor | null,
  nameOrDef: string | Immutable<ITemplateDefinition>): TemplateDefinition;
// tslint:disable-next-line:parameters-max-number
export function buildTemplateDefinition(
  ctor: CustomElementConstructor | null,
  name: string | null,
  template: unknown,
  cache?: number | '*' | null,
  build?: IBuildInstruction | boolean | null,
  bindables?: Record<string, IBindableDescription> | null,
  instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null,
  dependencies?: ReadonlyArray<unknown> | null,
  surrogates?: ReadonlyArray<TargetedInstruction> | null,
  containerless?: boolean | null,
  shadowOptions?: { mode: 'open' | 'closed' } | null,
  hasSlots?: boolean | null): TemplateDefinition;
  // tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
export function buildTemplateDefinition(
  ctor: CustomElementConstructor | null,
  nameOrDef: string | Immutable<ITemplateDefinition> | null,
  template?: unknown | null,
  cache?: number | '*' | null,
  build?: IBuildInstruction | boolean | null,
  bindables?: Record<string, IBindableDescription> | null,
  instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null,
  dependencies?: ReadonlyArray<IRegistry> | null,
  surrogates?: ReadonlyArray<TargetedInstruction> | null,
  containerless?: boolean | null,
  shadowOptions?: { mode: 'open' | 'closed' } | null,
  hasSlots?: boolean | null): TemplateDefinition {

  const def = new DefaultTemplateDefinition();

  // all cases fall through intentionally
  const argLen = arguments.length;
  switch (argLen) {
    case 12: if (hasSlots !== null) def.hasSlots = hasSlots;
    case 11: if (shadowOptions !== null) def.shadowOptions = shadowOptions;
    case 10: if (containerless !== null) def.containerless = containerless;
    case 9: if (surrogates !== null) def.surrogates = PLATFORM.toArray(surrogates);
    case 8: if (dependencies !== null) def.dependencies = PLATFORM.toArray(dependencies);
    case 7: if (instructions !== null) def.instructions = PLATFORM.toArray(instructions) as TargetedInstruction[][];
    case 6: if (bindables !== null) def.bindables = { ...bindables };
    case 5: if (build !== null) def.build = build === true ? buildRequired : build === false ? buildNotRequired : { ...build };
    case 4: if (cache !== null) def.cache = cache;
    case 3: if (template !== null) def.template = template;
    case 2:
      if (ctor !== null) {
        if (ctor['bindables']) {
          def.bindables = { ...ctor.bindables };
        }
        if (ctor['containerless']) {
          def.containerless = ctor.containerless;
        }
        if (ctor['shadowOptions']) {
          def.shadowOptions = ctor.shadowOptions;
        }
      }
      if (typeof nameOrDef === 'string') {
        if (nameOrDef.length > 0) {
          def.name = nameOrDef;
        }
      } else if (nameOrDef !== null) {
        templateDefinitionAssignables.forEach(prop => {
          if (nameOrDef[prop]) {
            def[prop] = nameOrDef[prop];
          }
        });
        templateDefinitionArrays.forEach(prop => {
          if (nameOrDef[prop]) {
            def[prop] = PLATFORM.toArray(nameOrDef[prop]);
          }
        });
        if (nameOrDef['bindables']) {
          if (def.bindables === PLATFORM.emptyObject) {
            def.bindables = { ...nameOrDef.bindables };
          } else {
            Object.assign(def.bindables, nameOrDef.bindables);
          }
        }
      }
  }

  // special handling for invocations that quack like a @customElement decorator
  if (argLen === 2 && ctor !== null && (typeof nameOrDef === 'string' || !('build' in nameOrDef))) {
    def.build = buildRequired;
  }

  return def;
}
