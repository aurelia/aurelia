import { DI } from '@aurelia/kernel';

export type InstructionTypeName = string;

export const IInstruction = DI.createInterface<IInstruction>('IInstruction').noDefault();
export interface IInstruction {
  type: InstructionTypeName;
}

export class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly hasDefine: boolean;

  public readonly hasBeforeCompose: boolean;
  public readonly hasBeforeComposeChildren: boolean;
  public readonly hasAfterCompose: boolean;

  public readonly hasBeforeBind: boolean;
  public readonly hasAfterBind: boolean;
  public readonly hasAfterAttach: boolean;
  public readonly hasAfterAttachChildren: boolean;

  public readonly hasBeforeDetach: boolean;
  public readonly hasBeforeUnbind: boolean;

  public readonly hasDispose: boolean;
  public readonly hasAccept: boolean;

  public constructor(target: object) {
    this.hasDefine = 'define' in target;

    this.hasBeforeCompose = 'beforeCompose' in target;
    this.hasBeforeComposeChildren = 'beforeComposeChildren' in target;
    this.hasAfterCompose = 'afterCompose' in target;

    this.hasBeforeBind = 'beforeBind' in target;
    this.hasAfterBind = 'afterBind' in target;
    this.hasAfterAttach = 'afterAttach' in target;
    this.hasAfterAttachChildren = 'afterAttachChildren' in target;

    this.hasBeforeDetach = 'beforeDetach' in target;
    this.hasBeforeUnbind = 'beforeUnbind' in target;

    this.hasDispose = 'dispose' in target;
    this.hasAccept = 'accept' in target;
  }
}
