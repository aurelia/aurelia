import { ViewportInstruction } from './viewport-instruction';
export interface IInstructionResolverOptions {
    separators?: IRouteSeparators;
}
export interface IRouteSeparators {
    viewport: string;
    sibling: string;
    scope: string;
    ownsScope: string;
    parameters: string;
    parameter: string;
    add: string;
    clear: string;
    action: string;
}
export declare class InstructionResolver {
    separators: IRouteSeparators;
    activate(options?: IInstructionResolverOptions): void;
    readonly clearViewportInstruction: string;
    parseViewportInstructions(instructions: string): ViewportInstruction[];
    parseViewportInstruction(instruction: string): ViewportInstruction;
    stringifyViewportInstructions(instructions: ViewportInstruction[]): string;
    stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport?: boolean): string;
    parseScopedViewportInstruction(instruction: string): ViewportInstruction[];
    stringifyScopedViewportInstruction(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string;
    buildScopedLink(scopeContext: string, href: string): string;
    shouldClearViewports(path: string): {
        clearViewports: boolean;
        newPath: string;
    };
    removeStateDuplicates(states: string[]): string[];
    stateStringsToString(stateStrings: string[], clear?: boolean): string;
    private parseAViewportInstruction;
    private stringifyAViewportInstruction;
}
//# sourceMappingURL=instruction-resolver.d.ts.map