import { ComponentParameters, ComponentAppellation, ViewportHandle } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';
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
    parameterSeparator: string;
    parameterKeySeparator: string;
    parameter?: string;
    add: string;
    clear: string;
    action: string;
}
export interface IComponentParameter {
    key?: string | undefined;
    value: unknown;
}
export declare class InstructionResolver {
    separators: ISeparators;
    activate(options?: IInstructionResolverOptions): void;
    get clearViewportInstruction(): string;
    get addViewportInstruction(): string;
    isClearViewportInstruction(instruction: string | ViewportInstruction): boolean;
    isAddViewportInstruction(instruction: string | ViewportInstruction): boolean;
    isClearViewportScopeInstruction(instruction: string | ViewportInstruction): boolean;
    isClearAllViewportsInstruction(instruction: string | ViewportInstruction): boolean;
    isAddAllViewportsInstruction(instruction: string | ViewportInstruction): boolean;
    createViewportInstruction(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null): ViewportInstruction;
    parseViewportInstructions(instructions: string): ViewportInstruction[];
    parseViewportInstruction(instruction: string): ViewportInstruction;
    stringifyViewportInstructions(instructions: ViewportInstruction[], excludeViewport?: boolean, viewportContext?: boolean): string;
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
export {};
//# sourceMappingURL=instruction-resolver.d.ts.map