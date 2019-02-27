export interface ITemplateImport {
    plugin: string | null;
    extension: string | null;
    basename: string;
    path: string;
}
export interface ITemplateDescription {
    template: string;
    imports: ITemplateImport[];
}
export declare function processImports(toProcess: ITemplateImport[], relativeTo: string): string[];
export declare function kebabCase(name: string): string;
export declare function escape(content: string): string;
export declare function createTemplateDescription(template: string): ITemplateDescription;
export declare function parseImport(value: string): ITemplateImport;
export declare function relativeToFile(name: string, file?: string): string;
export declare function loadFromFile(url: string, callback: (content: string) => void, errback?: (error: Error) => void): void;
//# sourceMappingURL=processing.d.ts.map