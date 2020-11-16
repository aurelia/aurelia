import { ComponentParameters, ComponentAppellation, ViewportHandle } from './interfaces.js';
import { ViewportInstruction } from './viewport-instruction.js';
import { Scope } from './scope.js';
import { IRouteSeparators, ISeparators } from './router-options.js';
export interface IInstructionResolverOptions {
    separators?: IRouteSeparators;
}
export interface IComponentParameter {
    key?: string | undefined;
    value: unknown;
}
export declare class InstructionResolver {
    separators: ISeparators;
    start(options?: IInstructionResolverOptions): void;
    get clearViewportInstruction(): string;
    get addViewportInstruction(): string;
    isClearViewportInstruction(instruction: string | ViewportInstruction): boolean;
    isAddViewportInstruction(instruction: string | ViewportInstruction): boolean;
    isClearViewportScopeInstruction(instruction: string | ViewportInstruction): boolean;
    isClearAllViewportsInstruction(instruction: string | ViewportInstruction): boolean;
    isAddAllViewportsInstruction(instruction: string | ViewportInstruction): boolean;
    createViewportInstruction(component: ComponentAppellation | Promise<ComponentAppellation>, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null): ViewportInstruction | Promise<ViewportInstruction>;
    parseViewportInstructions(instructions: string): ViewportInstruction[];
    parseViewportInstruction(instruction: string): ViewportInstruction;
    stringifyViewportInstructions(instructions: ViewportInstruction[] | string, excludeViewport?: boolean, viewportContext?: boolean): string;
    stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport?: boolean, viewportContext?: boolean): string;
    stringifyScopedViewportInstructions(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string;
    encodeViewportInstructions(instructions: ViewportInstruction[]): string;
    decodeViewportInstructions(instructions: string): ViewportInstruction[];
    buildScopedLink(scopeContext: string, href: string): string;
    shouldClearViewports(path: string): {
        clearViewports: boolean;
        newPath: string;
    };
    mergeViewportInstructions(instructions: (string | ViewportInstruction)[]): ViewportInstruction[];
    flattenViewportInstructions(instructions: ViewportInstruction[]): ViewportInstruction[];
    cloneViewportInstructions(instructions: ViewportInstruction[], keepInstances?: boolean, context?: boolean): ViewportInstruction[];
    parseComponentParameters(parameters: ComponentParameters | null, uriComponent?: boolean): IComponentParameter[];
    stringifyComponentParameters(parameters: IComponentParameter[], uriComponent?: boolean): string;
    matchScope(instructions: ViewportInstruction[], scope: Scope): ViewportInstruction[];
    matchChildren(instructions: ViewportInstruction[], active: ViewportInstruction[]): boolean;
    private parseViewportInstructionsWorker;
    private findNextToken;
    private parseAViewportInstruction;
    private stringifyAViewportInstruction;
}
//# sourceMappingURL=instruction-resolver.d.ts.map