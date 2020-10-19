import {
  Constructable,
  DI,
  ResourceDefinition,
  IContainer,
  IResourceKind,
  Registration,
  Metadata,
  Protocol,
} from '@aurelia/kernel';

export type InstructionTypeName = string;

export const IInstruction = DI.createInterface<IInstruction>('IInstruction').noDefault();
export interface IInstruction {
  type: InstructionTypeName;
}

export class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly hasDefine: boolean;

  public readonly hasBeforeCompile: boolean;
  public readonly hasAfterCompile: boolean;
  public readonly hasAfterCompileChildren: boolean;

  public readonly hasBeforeBind: boolean;
  public readonly hasAfterBind: boolean;
  public readonly hasAfterAttach: boolean;
  public readonly hasAfterAttachChildren: boolean;

  public readonly hasBeforeDetach: boolean;
  public readonly hasBeforeUnbind: boolean;
  public readonly hasAfterUnbind: boolean;
  public readonly hasAfterUnbindChildren: boolean;

  public readonly hasDispose: boolean;
  public readonly hasAccept: boolean;

  public constructor(target: object) {
    this.hasDefine = 'define' in target;

    this.hasBeforeCompile = 'beforeCompile' in target;
    this.hasAfterCompile = 'afterCompile' in target;
    this.hasAfterCompileChildren = 'afterCompileChildren' in target;

    this.hasBeforeBind = 'beforeBind' in target;
    this.hasAfterBind = 'afterBind' in target;
    this.hasAfterAttach = 'afterAttach' in target;
    this.hasAfterAttachChildren = 'afterAttachChildren' in target;

    this.hasBeforeDetach = 'beforeDetach' in target;
    this.hasBeforeUnbind = 'beforeUnbind' in target;
    this.hasAfterUnbind = 'afterUnbind' in target;
    this.hasAfterUnbindChildren = 'afterUnbindChildren' in target;

    this.hasDispose = 'dispose' in target;
    this.hasAccept = 'accept' in target;
  }
}

export function alias(...aliases: readonly string[]) {
  return function (target: Constructable) {
    const key = Protocol.annotation.keyFor('aliases');
    const existing = Metadata.getOwn(key, target);
    if (existing === void 0) {
      Metadata.define(key, aliases, target);
    } else {
      existing.push(...aliases);
    }
  };
}

export function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer) {
  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
