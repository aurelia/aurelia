/// <reference types="node" />
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Http2ServerRequest, IncomingHttpHeaders as IncomingHttp2Headers } from 'http2';
export declare const enum HTTPStatusCode {
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
export declare const enum ContentType {
    unknown = "",
    json = "application/json; charset=utf-8",
    javascript = "application/javascript; charset=utf-8",
    plain = "text/plain; charset=utf-8",
    html = "text/html; charset=utf-8",
    css = "text/css; charset=utf-8"
}
export declare const enum ContentEncoding {
    identity = "identity",
    br = "br",
    gzip = "gzip",
    compress = "compress"
}
export declare class HTTPError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message?: string);
}
export declare function readBuffer(req: IncomingMessage | Http2ServerRequest): Promise<Buffer>;
export declare function getContentType(path: string): ContentType;
export declare function getContentEncoding(path: string): ContentEncoding;
export declare type Headers = IncomingHttpHeaders | IncomingHttp2Headers;
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