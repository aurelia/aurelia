import { CustomElementDefinition } from './custom-element.js';
export declare type IProjections = Record<string, CustomElementDefinition>;
export declare const IProjections: import("@aurelia/kernel").InterfaceSymbol<Record<string, CustomElementDefinition<import("@aurelia/kernel").Constructable<{}>>>>;
export interface IAuSlotsInfo extends AuSlotsInfo {
}
export declare const IAuSlotsInfo: import("@aurelia/kernel").InterfaceSymbol<IAuSlotsInfo>;
export declare class AuSlotsInfo {
    readonly projectedSlots: string[];
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots: string[]);
}
//# sourceMappingURL=slot-injectables.d.ts.map