import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner } from './scope';
export declare class ViewportInstructionCollection extends Array<ViewportInstruction> {
    get empty(): boolean;
    get first(): ViewportInstruction;
    getDefaults(): ViewportInstructionCollection;
    getNonDefaults(): ViewportInstructionCollection;
    getScopeOwners(configuredRoutePath: string | null): IScopeOwner[];
    remove(instruction: ViewportInstruction): void;
}
//# sourceMappingURL=viewport-instruction-collection.d.ts.map