/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Http2ServerRequest, IncomingHttpHeaders as IncomingHttp2Headers } from 'http2';
export declare enum HTTPStatusCode {
    SwitchingProtocols = 101,
    OK = 200,
    Accepted = 202,
    NoContent = 204,
    Found = 302,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    InternalServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504
}
export type ContentType = '' | 'application/json; charset=utf-8' | 'application/javascript; charset=utf-8' | 'text/plain; charset=utf-8' | 'text/html; charset=utf-8' | 'text/css; charset=utf-8';
export type ContentEncoding = 'identity' | 'br' | 'gzip' | 'compress';
export declare class HTTPError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message?: string);
}
export declare function readBuffer(req: IncomingMessage | Http2ServerRequest): Promise<Buffer>;
export declare function getContentType(path: string): ContentType;
export declare function getContentEncoding(path: string): ContentEncoding;
export type Headers = IncomingHttpHeaders | IncomingHttp2Headers;
export declare class QualifiedHeaderValues {
    readonly headerName: string;
    readonly mostPrioritized: {
        name: string;
        q: number;
    } | undefined;
    private readonly parsedMap;
    constructor(headerName: string, headers: Headers);
    isAccepted(value: string): boolean;
    getQValueFor(value: string): number;
}
//# sourceMappingURL=http-utils.d.ts.map