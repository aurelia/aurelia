import { type CompilerOptions } from "typescript";
export declare const assetsTypeFile = "assets-modules.d.ts";
export declare const assetTypes = "\ndeclare module '*.html' {\nexport const name: string;\nexport const template: string;\nexport default template;\nexport const dependencies: string[];\nexport const containerless: boolean | undefined;\nexport const shadowOptions: { mode: 'open' | 'closed'} | undefined;\n}\n\ndeclare module '*.css'\n";
export declare const options: CompilerOptions;
export declare function $basename(path: string): string;
export type $Module = Record<string, string>;
export declare function compileProcessedCode(entryPoint: string, modules?: $Module): string[];
export declare function createMarkupReader(fileName: string, content: string): (path: string) => string;
export declare function assertSuccess(entry: string, code: string, additionalModules?: $Module): void;
export declare function assertFailure(entry: string, code: string, expectedErrors: RegExp[], additionalModules?: $Module, isPartial?: boolean): void;
export declare function prop(name: string, type: string, isTs: boolean, accessModifier?: 'public' | 'protected' | 'private'): string;
//# sourceMappingURL=_shared.d.ts.map