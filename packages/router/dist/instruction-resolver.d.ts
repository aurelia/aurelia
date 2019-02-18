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
    add: string;
    clear: string;
    action: string;
}
export declare class InstructionResolver {
    separators: IRouteSeparators;
    activate(options?: IInstructionResolverOptions): void;
    readonly clearViewportInstruction: string;
    parseViewportInstruction(instruction: string): ViewportInstruction;
    stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport?: boolean): string;
    parseScopedViewportInstruction(instruction: string): ViewportInstruction[];
    stringifyScopedViewportInstruction(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string;
    buildScopedLink(scopeContext: string, href: string): string;
    shouldClearViewports(path: string): {
        clearViewports: boolean;
        newPath: string;
    };
    findViews(path: string): Record<string, string>;
    viewportInstructionsToString(instructions: ViewportInstruction[]): string;
    viewportInstructionsFromString(instructionsString: string): ViewportInstruction[];
    removeStateDuplicates(states: string[]): string[];
    stateStringsToString(stateStrings: string[], clear?: boolean): string;
}
//# sourceMappingURL=instruction-resolver.d.ts.map