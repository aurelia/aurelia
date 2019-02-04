import {
  Constructable,
  DI,
  Immutable,
  IRegistry,
  IResourceDefinition,
  Omit,
  PLATFORM,
  ResourceDescription,
  ResourcePartDescription,
  Writable
} from '@aurelia/kernel';
import { IForOfStatement, IInterpolationExpression, IsBindingBehavior } from './ast';
import { BindingMode, BindingStrategy, ensureValidStrategy } from './flags';
import { CustomElementHost, ICustomElement } from './resources/custom-element';
import { Bindable } from './templating/bindable';

/** @internal */
export const customElementName = 'custom-element';
/** @internal */
export function customElementKey(name: string): string {
  return `${customElementName}:${name}`;
}
/** @internal */
export function customElementBehavior(node: unknown): ICustomElement | null {
  return (node as CustomElementHost).$customElement === undefined ? null : (node as CustomElementHost).$customElement;
}

/** @internal */
export const customAttributeName = 'custom-attribute';
/** @internal */
export function customAttributeKey(name: string): string {
  return `${customAttributeName}:${name}`;
}

export type IElementHydrationOptions = { parts?: Record<string, TemplateDefinition> };

export type BindableSource = Omit<IBindableDescription, 'property'>;

export interface IBindableDescription {
  primaryProperty?: boolean;
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
}

/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Renderer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export const enum TargetedInstructionType {
  hydrateElement = 'ra',
  hydrateAttribute = 'rb',
  hydrateTemplateController = 'rc',
  hydrateLetElement = 'rd',
  setProperty = 're',
  interpolation = 'rf',
  propertyBinding = 'rg',
  callBinding = 'rh',
  letBinding = 'ri',
  refBinding = 'rj',
  iteratorBinding = 'rk',
}

export interface IBuildInstruction {
  required: boolean;
  compiler?: string;
}

export interface ITemplateDefinition extends IResourceDefinition {
  cache?: '*' | number;
  template?: unknown;
  instructions?: ITargetedInstruction[][];
  dependencies?: IRegistry[];
  build?: IBuildInstruction;
  surrogates?: ITargetedInstruction[];
  bindables?: Record<string, IBindableDescription> | string[];
  containerless?: boolean;
  shadowOptions?: { mode: 'open' | 'closed' };
  hasSlots?: boolean;
  strategy?: BindingStrategy;
}

export type TemplateDefinition = ResourceDescription<ITemplateDefinition>;

export type TemplatePartDefinitions = Record<string, ResourcePartDescription<ITemplateDefinition>>;
export type BindableDefinitions = Record<string, Immutable<IBindableDescription>>;

export interface IAttributeDefinition extends IResourceDefinition {
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
  hasDynamicOptions?: boolean;
  bindables?: Record<string, IBindableDescription> | string[];
  strategy?: BindingStrategy;
}

export type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;

export type InstructionTypeName = string;

export const ITargetedInstruction = DI.createInterface<ITargetedInstruction>('createInterface').noDefault();
export interface ITargetedInstruction {
  type: InstructionTypeName;
}

export type NodeInstruction =
  IHydrateElementInstruction |
  IHydrateTemplateController |
  IHydrateLetElementInstruction;

export type AttributeInstruction =
  IInterpolationInstruction |
  IPropertyBindingInstruction |
  IIteratorBindingInstruction |
  ICallBindingInstruction |
  IRefBindingInstruction |
  ISetPropertyInstruction |
  ILetBindingInstruction |
  IHydrateAttributeInstruction;

export type TargetedInstruction = NodeInstruction | AttributeInstruction;

// TODO: further improve specificity and integrate with the definitions;
export type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];

export function isTargetedInstruction(value: unknown): value is TargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  from: string | IInterpolationExpression;
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
  from: string | IForOfStatement;
  to: string;
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

export interface ISetPropertyInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setProperty;
  value: unknown;
  to: string;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: string;
  instructions: ITargetedInstruction[];
  parts?: Record<string, ITemplateDefinition>;
}

export interface IHydrateAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateAttribute;
  res: string;
  instructions: ITargetedInstruction[];
}

export interface IHydrateTemplateController extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateTemplateController;
  res: string;
  instructions: ITargetedInstruction[];
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
  from: string | IsBindingBehavior | IInterpolationExpression;
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
  public strategy: ITemplateDefinition['strategy'];

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
    this.strategy = BindingStrategy.getterSetter;
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

export type CustomElementConstructor = Constructable & {
  containerless?: TemplateDefinition['containerless'];
  shadowOptions?: TemplateDefinition['shadowOptions'];
  bindables?: TemplateDefinition['bindables'];
};

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
  instructions?: ReadonlyArray<ReadonlyArray<ITargetedInstruction>> | null,
  dependencies?: ReadonlyArray<unknown> | null,
  surrogates?: ReadonlyArray<ITargetedInstruction> | null,
  containerless?: boolean | null,
  shadowOptions?: { mode: 'open' | 'closed' } | null,
  hasSlots?: boolean | null,
  strategy?: BindingStrategy | null): TemplateDefinition;
// tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
export function buildTemplateDefinition(
  ctor: CustomElementConstructor | null,
  nameOrDef: string | Immutable<ITemplateDefinition> | null,
  template?: unknown | null,
  cache?: number | '*' | null,
  build?: IBuildInstruction | boolean | null,
  bindables?: Record<string, IBindableDescription> | null,
  instructions?: ReadonlyArray<ReadonlyArray<ITargetedInstruction>> | null,
  dependencies?: ReadonlyArray<IRegistry> | null,
  surrogates?: ReadonlyArray<ITargetedInstruction> | null,
  containerless?: boolean | null,
  shadowOptions?: { mode: 'open' | 'closed' } | null,
  hasSlots?: boolean | null,
  strategy?: BindingStrategy | null): TemplateDefinition {

  const def = new DefaultTemplateDefinition();

  // all cases fall through intentionally
  const argLen = arguments.length;
  switch (argLen) {
    case 13: if (strategy !== null) def.strategy = ensureValidStrategy(strategy);
    case 12: if (hasSlots !== null) def.hasSlots = hasSlots;
    case 11: if (shadowOptions !== null) def.shadowOptions = shadowOptions;
    case 10: if (containerless !== null) def.containerless = containerless;
    case 9: if (surrogates !== null) def.surrogates = PLATFORM.toArray(surrogates);
    case 8: if (dependencies !== null) def.dependencies = PLATFORM.toArray(dependencies);
    case 7: if (instructions !== null) def.instructions = PLATFORM.toArray(instructions) as ITargetedInstruction[][];
    case 6: if (bindables !== null) def.bindables = { ...bindables };
    case 5: if (build !== null) def.build = build === true ? buildRequired : build === false ? buildNotRequired : { ...build };
    case 4: if (cache !== null) def.cache = cache;
    case 3: if (template !== null) def.template = template;
    case 2:
      if (ctor !== null) {
        if (ctor['bindables']) {
          def.bindables = Bindable.for(ctor as unknown as {}).get();
        }
        if (ctor['containerless']) {
          def.containerless = ctor.containerless;
        }
        if (ctor['shadowOptions']) {
          def.shadowOptions = ctor.shadowOptions as unknown as { mode: 'open' | 'closed' };
        }
      }
      if (typeof nameOrDef === 'string') {
        if (nameOrDef.length > 0) {
          def.name = nameOrDef;
        }
      } else if (nameOrDef !== null) {
        def.strategy = ensureValidStrategy(nameOrDef.strategy);
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
            def.bindables = Bindable.for(nameOrDef as unknown as {}).get();
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
