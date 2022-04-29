// A specific file for primitive of au slot to avoid circular dependencies
import { DI } from '@aurelia/kernel';
import { CustomElementDefinition } from './custom-element';

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections");

export interface IAuSlotsInfo extends AuSlotsInfo { }
export const IAuSlotsInfo = DI.createInterface<IAuSlotsInfo>('IAuSlotsInfo');
export class AuSlotsInfo {
  /**
   * @param {string[]} projectedSlots - Name of the slots to which content are projected.
   */
  public constructor(
    public readonly projectedSlots: string[],
  ) { }
}
