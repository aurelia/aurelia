export interface IParsedQuery {
    parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>);
    list: string[];
}
export interface IMergedParameters {
    parameters: Record<string, string>;
    list: string[];
    merged: string[] | Record<string, string>;
}
export declare function parseQuery(query: string): IParsedQuery;
export declare function mergeParameters(parameters: string, query: string, specifiedParameters: string[]): IMergedParameters;
//# sourceMappingURL=parser.d.ts.map