import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Http2ServerRequest, IncomingHttpHeaders as IncomingHttp2Headers, constants } from 'http2';

export enum HTTPStatusCode {
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
  GatewayTimeout = 504,
}

export type ContentType =
  /* unknown    */   ''
  /* json       */ | 'application/json; charset=utf-8'
  /* javascript */ | 'application/javascript; charset=utf-8'
  /* plain      */ | 'text/plain; charset=utf-8'
  /* html       */ | 'text/html; charset=utf-8'
  /* css        */ | 'text/css; charset=utf-8'
  ;

export type ContentEncoding = 'identity' | 'br' | 'gzip' | 'compress';
  // | 'deflate' // Need to deal with this later. No known fixed file extension for deflate

export class HTTPError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message?: string) {
    super(message);

    this.statusCode = statusCode;
  }
}

export async function readBuffer(req: IncomingMessage | Http2ServerRequest): Promise<Buffer> {
  let totalLength: number = 0;
  const chunks: Buffer[] = [];

  req.on('data', function (chunk: Buffer) {
    chunks.push(chunk);
    totalLength += chunk.length;
  });

  return new Promise(function (resolve, reject) {
    req.on('end', function () {
      const buffer = Buffer.concat(chunks, totalLength);

      resolve(buffer);
    });

    req.on('error', reject);
  });
}

export function getContentType(path: string): ContentType {
  const i = path.lastIndexOf('.');
  if (i >= 0) {
    switch (path.slice(i)) {
      case '.js': return 'application/javascript; charset=utf-8';
      case '.css': return 'text/css; charset=utf-8';
      case '.json': return 'application/json; charset=utf-8';
      case '.html': return 'text/html; charset=utf-8';
    }
  }

  return 'text/plain; charset=utf-8';
}

export function getContentEncoding(path: string): ContentEncoding {
  const i = path.lastIndexOf('.');
  if (i >= 0) {
    switch (path.slice(i)) {
      case '.br': return 'br';
      case '.gz': return 'gzip';
      case '.lzw': return 'compress';
    }
  }

  return 'identity';
}

export type Headers = IncomingHttpHeaders | IncomingHttp2Headers;

const wildcardHeaderValue = {
  [constants.HTTP2_HEADER_ACCEPT_ENCODING]: '*',
  [constants.HTTP2_HEADER_ACCEPT]: '*/*',
  [constants.HTTP2_HEADER_ACCEPT_CHARSET]: '*',
  [constants.HTTP2_HEADER_ACCEPT_LANGUAGE]: '*',
};

export class QualifiedHeaderValues {

  public readonly headerName: string;
  public readonly mostPrioritized: { name: string; q: number } | undefined;
  private readonly parsedMap: Map<string, number>;

  public constructor(
    headerName: string,
    headers: Headers
  ) {
    this.headerName = headerName.toLowerCase();
    const rawValue: string = (headers[headerName] ?? headers[this.headerName]) as string;
    headerName = this.headerName;
    const parsedMap = this.parsedMap = new Map<string, number>();
    if (rawValue === void 0) {
      const wildcardValue = wildcardHeaderValue[headerName];
      if (wildcardValue !== void 0) {
        parsedMap.set(wildcardValue, 1);
      }
      return;
    }

    // TODO handle the partial values such as `text/html;q=0.8,text/*;q=0.8,*/*;q=0.8`, `*`, or `*;q=0.8`
    /**
     * Example:
     * Header-Name: value1
     * Header-Name: value1, value2, value3
     * Header-Name: value1, value2;q=[0-1], value3;q=[0-1]
     */

    for (const item of rawValue.split(',')) {
      // TODO validate the `value` against a set of acceptable values.
      const [value, ...rest] = item.trim().split(';');
      let qValue = 1;
      const q = rest.find((x) => x.startsWith('q='));
      if (q !== void 0) {
        const rawQValue = q.substring(2);
        qValue = Number(rawQValue);
        if (Number.isNaN(qValue) || qValue < 0 || qValue > 1) {
          throw new Error(`Invalid qValue ${rawQValue} for ${value} in ${headerName} header; raw values: ${rawValue}`);
        }
      }
      parsedMap.set(value, qValue);
      if (this.mostPrioritized === void 0 || this.mostPrioritized.q < qValue) {
        this.mostPrioritized = { name: value, q: qValue };
      }
    }
  }

  public isAccepted(value: string) {
    const qValue = this.parsedMap.get(value);
    if (qValue !== void 0) {
      return qValue !== 0;
    }
    return this.parsedMap.has(wildcardHeaderValue[this.headerName]);
  }

  public getQValueFor(value: string) {
    const qValue = this.parsedMap.get(value);
    return qValue ?? 0;
  }
}
