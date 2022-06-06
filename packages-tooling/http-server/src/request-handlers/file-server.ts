import { statSync, openSync, readdirSync } from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerHttp2Stream, constants, Http2ServerRequest, Http2ServerResponse, OutgoingHttpHeaders } from 'http2';
import { join, resolve, relative, extname } from 'path';
import { ILogger } from '@aurelia/kernel';
import { IRequestHandler, IHttpServerOptions, IHttp2FileServer } from '../interfaces';
import { IHttpContext, HttpContextState } from '../http-context';
import { getContentType, HTTPStatusCode, getContentEncoding, ContentEncoding } from '../http-utils';
import { readFile, isReadable, exists } from '../file-utils';

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_CONTENT_LENGTH,
  HTTP2_HEADER_LAST_MODIFIED,
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_ACCEPT_ENCODING,
  HTTP2_HEADER_CONTENT_ENCODING,
  HTTP2_HEADER_CACHE_CONTROL
} = constants;

const contentEncodingExtensionMap = {
  br: '.br',
  gzip: '.gz',
  compress: '.lzw'
};
const compressedFileExtensions: Set<string> = new Set(Object.values(contentEncodingExtensionMap));

export class FileServer implements IRequestHandler {
  private readonly root: string;
  private readonly cacheControlDirective: string;

  public constructor(
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @ILogger
    private readonly logger: ILogger,
  ) {
    this.cacheControlDirective = this.opts.responseCacheControl ?? 'max-age=3600';
    this.logger = logger.root.scopeTo('FileServer');

    this.root = resolve(opts.root);

    this.logger.debug(`Now serving files from: "${this.root}"`);
  }

  public async handleRequest(context: IHttpContext): Promise<void> {
    const request = context.request;
    const response = context.response;

    if (!(request instanceof IncomingMessage && response instanceof ServerResponse)) { return; }
    const parsedUrl = context.requestUrl;
    const path = join(this.root, parsedUrl.path!);

    if (await isReadable(path)) {
      this.logger.debug(`Serving file "${path}"`);

      const contentType = getContentType(path);
      const clientEncoding = determineContentEncoding(context);

      let contentEncoding: ContentEncoding = (void 0)!;
      let content: any = (void 0)!;
      if (
        clientEncoding === 'br'
        || clientEncoding === 'gzip'
        || clientEncoding === 'compress'
      ) {
        const compressedFile = `${path}${contentEncodingExtensionMap[clientEncoding]}`;
        if (await exists(compressedFile)) {
          content = await readFile(compressedFile);
          contentEncoding = getContentEncoding(compressedFile);
        }
      }
      // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
      if (contentEncoding === void 0 || content === void 0) {
        content = await readFile(path);
        contentEncoding = getContentEncoding(path);
      }

      response.writeHead(HTTPStatusCode.OK, {
        'Content-Type': contentType,
        'Content-Encoding': contentEncoding,
        'Cache-Control': this.cacheControlDirective
      });

      await new Promise<void>(function (resolve) {
        response.end(content, resolve);
      });

    } else {
      this.logger.debug(`File "${path}" could not be found`);

      response.writeHead(HTTPStatusCode.NotFound);

      await new Promise(function (resolve) {
        response.end(resolve);
      });
    }

    context.state = HttpContextState.end;
  }

}

/**
 * File server with HTTP/2 push support
 */
export class Http2FileServer implements IHttp2FileServer {

  private readonly cacheControlDirective: string;
  private readonly root: string;
  private readonly filePushMap: Map<string, PushInfo> = new Map<string, PushInfo>();

  public constructor(
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @ILogger
    private readonly logger: ILogger,
  ) {
    this.cacheControlDirective = this.opts.responseCacheControl ?? 'max-age=3600';
    this.logger = logger.root.scopeTo('Http2FileServer');

    this.root = resolve(opts.root);
    this.prepare();
    this.logger.debug(`Now serving files from: "${this.root}"`);
  }

  public handleRequest(context: IHttpContext): void {
    const request = context.request;
    const response = context.response;

    if (!(request instanceof Http2ServerRequest && response instanceof Http2ServerResponse)) { return; }
    const parsedUrl = context.requestUrl;
    const parsedPath = parsedUrl.path!;
    const path = join(this.root, parsedPath);

    const contentEncoding = determineContentEncoding(context);
    const file = this.getPushInfo(parsedPath, contentEncoding);

    if (file !== void 0) {
      this.logger.debug(`Serving file "${path}"`);

      const stream = response.stream;
      // TODO make this configurable
      if (parsedPath === '/index.html') {
        this.pushAll(stream, contentEncoding);
      }

      stream.respondWithFD(file.fd, file.headers);

    } else {
      this.logger.debug(`File "${path}" could not be found`);
      response.writeHead(HTTPStatusCode.NotFound);
      response.end();
    }

    context.state = HttpContextState.end;
  }

  private pushAll(stream: ServerHttp2Stream, contentEncoding: string) {
    for (const path of this.filePushMap.keys()) {
      if (!path.endsWith('index.html') && !compressedFileExtensions.has(extname(path))) {
        this.push(stream, path, this.getPushInfo(path, contentEncoding)!);
      }
    }
  }

  private push(stream: ServerHttp2Stream, filePath: string, { fd, headers }: PushInfo) {
    const pushHeaders = { [HTTP2_HEADER_PATH]: filePath };

    stream.pushStream(pushHeaders, (_err, pushStream) => {
      // TODO handle error
      this.logger.debug(`pushing ${filePath}`);
      pushStream.respondWithFD(fd, headers);
    });
  }

  private prepare(root = this.opts.root) {
    const cacheControlDirective = this.cacheControlDirective;
    for (const item of readdirSync(root)) {
      const path = join(root, item);
      const stats = statSync(path);
      if (stats.isFile()) {
        this.filePushMap.set(`/${relative(this.root, path)}`, PushInfo.create(path, cacheControlDirective));
      } else {
        this.prepare(path);
      }
    }
  }

  private getPushInfo(path: string, contentEncoding: string) {
    if (
      contentEncoding === 'br'
      || contentEncoding === 'gzip'
      || contentEncoding === 'compress'
    ) {
      const info = this.filePushMap.get(`${path}${contentEncodingExtensionMap[contentEncoding]}`);
      if (info !== void 0) { return info; }
    }
    // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
    return this.filePushMap.get(path);
  }
}

class PushInfo {
  public static create(path: string, cacheControlDirective: string) {
    const stat = statSync(path);
    return new PushInfo(
      openSync(path, 'r'),
      {
        [HTTP2_HEADER_CONTENT_LENGTH]: stat.size,
        [HTTP2_HEADER_LAST_MODIFIED]: stat.mtime.toUTCString(),
        [HTTP2_HEADER_CONTENT_TYPE]: getContentType(path),
        [HTTP2_HEADER_CONTENT_ENCODING]: getContentEncoding(path),
        [HTTP2_HEADER_CACHE_CONTROL]: cacheControlDirective
      }
    );
  }
  public constructor(
    public fd: number,
    public headers: OutgoingHttpHeaders,
  ) { }
}

function determineContentEncoding(context: IHttpContext) {
  const clientEncoding = context.getQualifiedRequestHeaderFor(HTTP2_HEADER_ACCEPT_ENCODING);

  // if brotli compression is supported return `br`
  if (clientEncoding.isAccepted('br')) {
    return 'br';
  }
  // else return the highest prioritized content
  return clientEncoding.mostPrioritized?.name ?? 'identity';
}
