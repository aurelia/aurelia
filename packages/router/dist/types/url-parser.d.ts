export declare class ParsedUrl {
    readonly path: string;
    readonly query: Readonly<URLSearchParams>;
    readonly fragment: string | null;
    private readonly id;
    private constructor();
    toString(): string;
}
export interface IUrlParser {
    parse(value: string): ParsedUrl;
    stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null, isRooted: boolean): string;
}
export declare const pathUrlParser: IUrlParser;
export declare const fragmentUrlParser: IUrlParser;
//# sourceMappingURL=url-parser.d.ts.map