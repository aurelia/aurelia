export declare type InstructionTypeName = string;
export declare const IInstruction: import("@aurelia/kernel").InterfaceSymbol<IInstruction>;
export interface IInstruction {
    type: InstructionTypeName;
}
export declare class HooksDefinition {
    static readonly none: Readonly<HooksDefinition>;
    readonly hasDefine: boolean;
    readonly hasBeforeCompose: boolean;
    readonly hasBeforeComposeChildren: boolean;
    readonly hasAfterCompose: boolean;
    readonly hasBeforeBind: boolean;
    readonly hasAfterBind: boolean;
    readonly hasAfterAttach: boolean;
    readonly hasAfterAttachChildren: boolean;
    readonly hasBeforeDetach: boolean;
    readonly hasBeforeUnbind: boolean;
    readonly hasAfterUnbind: boolean;
    readonly hasAfterUnbindChildren: boolean;
    readonly hasDispose: boolean;
    readonly hasAccept: boolean;
    constructor(target: object);
}
//# sourceMappingURL=definitions.d.ts.map