export interface IParsedQuery {
    parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>);
    list: string[];
}
export interface IMergedParameters {
    namedParameters: Record<string, string>;
    parameterList: string[];
    merged: string[] | Record<string, string>;
}
export declare function parseQuery(query: string | null | undefined): IParsedQuery;
export declare function mergeParameters(parameters: string, query: string | null | undefined, specifiedParameters: string[] | null | undefined): IMergedParameters;
//# sourceMappingURL=parser.d.ts.map