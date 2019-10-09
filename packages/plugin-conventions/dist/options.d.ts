export declare type ResourceType = 'view' | 'customElement' | 'customAttribute' | 'valueConverter' | 'bindingBehavior' | 'bindingCommand' | 'templateController';
export interface INameConvention {
    name: string;
    type: ResourceType;
}
export interface IFileUnit {
    path: string;
    base?: string;
    contents: string;
    filePair?: string;
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
}
export declare const defaultCssExtensions: string[];
export declare const defaultJsExtensions: string[];
export declare const defaultTemplateExtensions: string[];
export declare function preprocessOptions(options?: IOptionalPreprocessOptions): IPreprocessOptions;
//# sourceMappingURL=options.d.ts.map