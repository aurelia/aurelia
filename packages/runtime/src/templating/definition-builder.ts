import { Immutable, PLATFORM } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindableDescription } from './bindable';
import { ICustomElementType } from './custom-element';
import { IBuildInstruction, ITemplateDefinition, TargetedInstruction, TemplateDefinition } from './instructions';

/*@internal*/
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
    this.instructions = <this['instructions']>PLATFORM.emptyArray;
    this.dependencies = <this['dependencies']>PLATFORM.emptyArray;
    this.surrogates = <this['surrogates']>PLATFORM.emptyArray;
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
  ctor: ICustomElementType,
  name: string): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: null,
  def: Immutable<ITemplateDefinition>): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: ICustomElementType | null,
  nameOrDef: string | Immutable<ITemplateDefinition>): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: ICustomElementType | null,
  name: string | null,
  template: string | INode,
  cache?: number | '*' | null,
  build?: IBuildInstruction | boolean | null,
  bindables?: Record<string, IBindableDescription> | null,
  instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null,
  dependencies?: ReadonlyArray<unknown> | null,
  surrogates?: ReadonlyArray<TargetedInstruction> | null,
  containerless?: boolean | null,
  shadowOptions?: { mode: 'open' | 'closed' } | null,
  hasSlots?: boolean | null): TemplateDefinition;
export function buildTemplateDefinition(
  ctor: ICustomElementType | null,
  nameOrDef: string | Immutable<ITemplateDefinition> | null,
  template?: string | INode | null,
  cache?: number | '*' | null,
  build?: IBuildInstruction | boolean | null,
  bindables?: Record<string, IBindableDescription> | null,
  instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null,
  dependencies?: ReadonlyArray<unknown> | null,
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
    case 7: if (instructions !== null) def.instructions = <TargetedInstruction[][]>PLATFORM.toArray(instructions);
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
  if (argLen === 2 && ctor !== null) {
    if (typeof nameOrDef === 'string' || !('build' in nameOrDef)) {
      def.build = buildRequired;
    }
  }

  return def;
}
