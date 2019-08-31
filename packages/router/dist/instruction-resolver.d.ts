import { ViewportInstruction } from './viewport-instruction';
export interface IInstructionResolverOptions {
    separators?: IRouteSeparators;
}
export interface IRouteSeparators extends Partial<ISeparators> {
}
interface ISeparators {
    viewport: string;
    sibling: string;
    scope: string;
    scopeStart: string;
    scopeEnd: string;
    noScope: string;
    parameters: string;
    parametersEnd: string;
    parameter?: string;
    add: string;
    clear: string;
    action: string;
}
export declare class InstructionResolver {
    separators: ISeparators;
    activate(options?: IInstructionResolverOptions): void;
    readonly clearViewportInstruction: string;
    parseViewportInstructions(instructions: string): ViewportInstruction[];
    parseViewportInstruction(instruction: string): ViewportInstruction;
    stringifyViewportInstructions(instructions: ViewportInstruction[], excludeViewport?: boolean): string;
    stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport?: boolean): string;
    stringifyScopedViewportInstructions(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string;
    encodeViewportInstructions(instructions: ViewportInstruction[]): string;
    decodeViewportInstructions(instructions: string): ViewportInstruction[];
    buildScopedLink(scopeContext: string, href: string): string;
    shouldClearViewports(path: string): {
        clear: boolean;
        newPath: string;
    };
    mergeViewportInstructions(instructions: (string | ViewportInstruction)[]): ViewportInstruction[];
    removeStateDuplicates(states: string[]): string[];
    flattenViewportInstructions(instructions: ViewportInstruction[]): ViewportInstruction[];
    stateStringsToString(stateStrings: string[], clear?: boolean): string;
    private parseViewportInstructionsWorker;
    private findNextToken;
    private parseAViewportInstruction;
    private stringifyAViewportInstruction;
}
export {};
//# sourceMappingURL=instruction-resolver.d.ts.map