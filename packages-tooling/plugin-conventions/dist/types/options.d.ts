export type ResourceType = 'customElement' | 'customAttribute' | 'valueConverter' | 'bindingBehavior' | 'bindingCommand' | 'templateController';
export interface INameConvention {
    name: string;
    type: ResourceType;
}
export interface IFileUnit {
    path: string;
    base?: string;
    contents: string;
    filePair?: string;
    readFile?(path: string): string;
}
export interface IOptionalPreprocessOptions {
    defaultShadowOptions?: {
        mode: 'open' | 'closed';
    };
    stringModuleWrap?: ((id: string) => string);
    cssExtensions?: string[];
    jsExtensions?: string[];
    templateExtensions?: string[];
    useProcessedFilePairFilename?: boolean;
    useCSSModule?: boolean;
    hmr?: boolean;
    enableConventions?: boolean;
    hmrModule?: string;
    /**
     * Used to transform a html module import specifier into something else if necessary
     * Example: changing import `./app.html` ->  `./app.$au.ts`:
     *
     * ```
     * {
     *   transformHtmlImportSpecifier: specifier => specifier.replace('.html', '.$au.ts')
     * }
     * ```
     */
    transformHtmlImportSpecifier?: (specifier: string) => string;
    /**
     * This gets the generated HMR code for the specified class
     *
     * @param viewModelClassName - The name of the class to generate HMR code for
     * @param moduleName - the name of the module that triggers the hot reload
     */
    getHmrCode?: (viewModelClassName: string, moduleName?: string) => string;
    /**
     * Enables the type checking for template.
     * The type-checking is still a work in progress, and hence is experimental.
     */
    experimentalTemplateTypeCheck?: boolean;
}
export interface IPreprocessOptions {
    defaultShadowOptions?: {
        mode: 'open' | 'closed';
    };
    stringModuleWrap?: ((id: string) => string);
    cssExtensions: string[];
    jsExtensions: string[];
    templateExtensions: string[];
    useProcessedFilePairFilename?: boolean;
    useCSSModule: boolean;
    hmr?: boolean;
    enableConventions?: boolean;
    hmrModule?: string;
    /**
     * Used to transform a html module import specifier into something else if necessary
     * Example: changing import `./app.html` ->  `./app.$au.ts`:
     *
     * ```
     * {
     *   transformHtmlImportSpecifier: specifier => specifier.replace('.html', '.$au.ts')
     * }
     * ```
     */
    transformHtmlImportSpecifier?: (specifier: string) => string;
    /**
     * This gets the generated HMR code for the specified class
     *
     * @param viewModelClassName - The name of the class to generate HMR code for
     * @param moduleName - the name of the module that triggers the hot reload
     */
    getHmrCode?: (viewModelClassName: string, moduleName?: string) => string;
    /**
     * Enables the type checking for template.
     * The type-checking is still a work in progress, and hence is experimental.
     */
    experimentalTemplateTypeCheck: boolean;
}
export declare const defaultCssExtensions: string[];
export declare const defaultJsExtensions: string[];
export declare const defaultTemplateExtensions: string[];
export declare function preprocessOptions(options?: IOptionalPreprocessOptions): IPreprocessOptions;
//# sourceMappingURL=options.d.ts.map