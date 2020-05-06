import { IncomingMessage, ServerResponse } from "http";
import { ServerHttp2Stream, constants, Http2ServerRequest, Http2ServerResponse, OutgoingHttpHeaders } from 'http2';
import * as url from 'url';
import { join, resolve, relative } from 'path';

import { ILogger } from '@aurelia/kernel';

import { IRequestHandler, IHttpServerOptions, IFileSystem, Encoding, IHttp2FileServer } from '../interfaces';
import { IHttpContext, HttpContextState } from '../http-context';
import { getContentType, HTTPStatusCode } from '../http-utils';

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_CONTENT_LENGTH,
  HTTP2_HEADER_LAST_MODIFIED,
  HTTP2_HEADER_CONTENT_TYPE,
} = constants;

export class FileServer implements IRequestHandler {
  private readonly root: string;

  public constructor(
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @ILogger
    private readonly logger: ILogger,
    @IFileSystem
    private readonly fs: IFileSystem,
  ) {
    this.logger = logger.root.scopeTo('FileServer');

    this.root = resolve(opts.root);

    this.logger.debug(`Now serving files from: "${this.root}"`);
  }

  public async handleRequest(context: IHttpContext): Promise<void> {
    const request = context.request;
    const response = context.response;

    if (!(request instanceof IncomingMessage && response instanceof ServerResponse)) { return; }
    const parsedUrl = url.parse(request.url!);
    const path = join(this.root, parsedUrl.path!);

    if (await this.fs.isReadable(path)) {
      this.logger.debug(`Serving file "${path}"`);

      const content = await this.fs.readFile(path, Encoding.utf8);
      const contentType = getContentType(path);

      response.writeHead(HTTPStatusCode.OK, {
        'Content-Type': contentType,
      });

      await new Promise(function (resolve) {
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

  private readonly root: string;
  private readonly filePushMap: Map<string, PushInfo> = new Map<string, PushInfo>();

  public constructor(
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @ILogger
    private readonly logger: ILogger,
    @IFileSystem
    private readonly fs: IFileSystem,
  ) {
    this.logger = logger.root.scopeTo('FileServer');

    this.root = resolve(opts.root);
    this.prepare();
    this.logger.debug(`Now serving files from: "${this.root}"`);
  }

  public handleRequest(context: IHttpContext): void {
    const request = context.request;
    const response = context.response;

    if (!(request instanceof Http2ServerRequest && response instanceof Http2ServerResponse)) { return; }
    const parsedUrl = url.parse(request.url!);
    const parsedPath = parsedUrl.path!;
    const path = join(this.root, parsedPath);

    const file = this.filePushMap.get(parsedPath);

    if (file !== void 0) {
      this.logger.debug(`Serving file "${path}"`);

      const stream = response.stream;
      // TODO make this configurable
      if (parsedPath === '/index.html') {
        this.pushAll(stream);
      }

      stream.respondWithFD(file.fd, file.headers);

    } else {
      this.logger.debug(`File "${path}" could not be found`);
      response.writeHead(HTTPStatusCode.NotFound);
      response.end();
    }

    context.state = HttpContextState.end;
  }

  private getFile(path: string) {
    const fs = this.fs;
    const stat = fs.statSync(path);
    return new PushInfo(
      fs.openSync(path, 'r'),
      {
        [HTTP2_HEADER_CONTENT_LENGTH]: stat.size,
        [HTTP2_HEADER_LAST_MODIFIED]: stat.mtime.toUTCString(),
        [HTTP2_HEADER_CONTENT_TYPE]: getContentType(path)
      }
    );
  }

  private pushAll(stream: ServerHttp2Stream) {
    for (const [path, info] of this.filePushMap) {
      if (!path.endsWith('index.html')) {
        this.push(stream, path, info);
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
    for (const item of this.fs.readdirSync(root)) {
      const path = join(root, item);
      const stats = this.fs.statSync(path);
      if (stats.isFile()) {
        this.filePushMap.set(`/${relative(this.root, path)}`, this.getFile(path));
      } else {
        this.prepare(path);
      }
    }
  }
}

class PushInfo {
  public constructor(
    public fd: number,
    public headers: OutgoingHttpHeaders,
  ) { }
}
