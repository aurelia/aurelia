/**
 * Calculates a path relative to a file.
 *
 * @param name - The relative path.
 * @param file - The file path.
 * @returns The calculated path.
 */
export declare function relativeToFile(name: string, file: string): string;
/**
 * Joins two paths.
 *
 * @param path1 - The first path.
 * @param path2 - The second path.
 * @returns The joined path.
 */
export declare function join(path1: string, path2: string): string;
declare type Scalar = null | undefined | boolean | number | string;
export interface IQueryParams {
    [key: string]: Scalar | this | (string | string[] | this)[];
}
/**
 * Generate a query string from an object.
 *
 * @param params - Object containing the keys and values to be used.
 * @param traditional - Boolean Use the old URI template standard (RFC6570)
 * @returns The generated query string, excluding leading '?'.
 */
export declare function buildQueryString(params?: IQueryParams, traditional?: boolean): string;
/**
 * Parse a query string into a queryParams object.
 *
 * @param queryString - The query string to parse.
 * @returns Object with keys and values mapped from the query string.
 */
export declare function parseQueryString(queryString: string): IQueryParams;
export {};
//# sourceMappingURL=path.d.ts.map