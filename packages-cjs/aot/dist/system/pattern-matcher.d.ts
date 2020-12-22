import { ILogger, IContainer } from '@aurelia/kernel';
import { IFile, $CompilerOptions } from './interfaces.js';
export declare class PatternMatcher {
    private readonly logger;
    readonly compilerOptions: $CompilerOptions;
    readonly basePath: string;
    readonly sources: readonly PatternSource[];
    readonly rootDir: string;
    private constructor();
    findMatch(files: readonly IFile[], specifier: string): IFile;
    static getOrCreate(compilerOptions: $CompilerOptions, container: IContainer): PatternMatcher | null;
}
declare class PatternSource {
    private readonly logger;
    readonly matcher: PatternMatcher;
    readonly pattern: string;
    readonly patternPath: string;
    readonly hasWildcard: boolean;
    readonly isWildcard: boolean;
    readonly targets: readonly PatternTarget[];
    constructor(logger: ILogger, matcher: PatternMatcher, pattern: string);
    findMatch(files: readonly IFile[], specifier: string): IFile | null;
    private findMatchCore;
}
declare class PatternTarget {
    private readonly logger;
    readonly source: PatternSource;
    readonly pattern: string;
    readonly patternPath: string;
    readonly hasWildcard: boolean;
    constructor(logger: ILogger, source: PatternSource, pattern: string);
    findMatch(files: readonly IFile[], specifier: string): IFile | null;
}
export {};
//# sourceMappingURL=pattern-matcher.d.ts.map