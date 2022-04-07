import { readFileSync } from 'fs';
import { Server, createServer, IncomingMessage, ServerResponse, RequestListener } from 'http';
import * as https from 'https';
import { Http2Server as $Http2Server, createSecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2';

import { ILogger, bound, all, IContainer } from '@aurelia/kernel';
import { IHttpServer, IHttpServerOptions, IRequestHandler, StartOutput, IHttp2FileServer } from './interfaces.js';
import { AddressInfo } from 'net';
import { HTTPStatusCode, readBuffer } from './http-utils.js';
import { HttpContext } from './http-context.js';

export class HttpServer implements IHttpServer {
  private server: Server | null = null;

  public constructor(
    @ILogger
    private readonly logger: ILogger,
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @IContainer
    private readonly container: IContainer,
    @all(IRequestHandler)
    private readonly handlers: readonly IRequestHandler[],
  ) {
    this.logger = logger.root.scopeTo('HttpServer');
  }

  public async start(): Promise<StartOutput> {
    this.logger.debug(`start()`);

    const { hostName, port, useHttps, key, cert } = this.opts;

    const server = this.server = (
      useHttps
        ? https.createServer({ key: readFileSync(key!), cert: readFileSync(cert!) }, this.handleRequest as RequestListener)
        : createServer(this.handleRequest as RequestListener)
    ).listen(port, hostName);
    await new Promise(resolve => server.on('listening', resolve));

    const { address, port: realPort } = this.server.address() as AddressInfo;
    this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);

    return new StartOutput(realPort);
  }

  public async stop(): Promise<void> {
    this.logger.debug(`stop()`);

    await new Promise(resolve => this.server!.close(resolve));
  }

  @bound
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    this.logger.debug(`handleRequest(url=${req.url})`);

    try {
      const buffer = await readBuffer(req);
      const context = new HttpContext(this.container, req, res, buffer);
      for (const handler of this.handlers) {
        // TODO: we need to identify here if the request is handled, if yes then break. Contextually, if the request is not handled by any handlers, we should panic, throw error and cause mayhem.
        // eslint-disable-next-line no-await-in-loop
        await handler.handleRequest(context);
      }
    } catch (err) {
      this.logger.error(`handleRequest Error: ${(err as Error).message}\n${(err as Error).stack}`);

      res.statusCode = HTTPStatusCode.InternalServerError;
      res.end();
    }
  }
}

export class Http2Server implements IHttpServer {
  private server: $Http2Server | null = null;

  public constructor(
    @ILogger
    private readonly logger: ILogger,
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @IContainer
    private readonly container: IContainer,
    @IHttp2FileServer
    private readonly http2FileServer: IHttp2FileServer,
  ) {
    this.logger = logger.root.scopeTo('Http2Server');
  }

  public async start(): Promise<StartOutput> {
    this.logger.debug(`start()`);

    const { hostName, port, cert, key } = this.opts;

    const server = this.server = createSecureServer(
      {
        key: readFileSync(key!),
        cert: readFileSync(cert!)
      },
      this.handleRequest // Do we need this at all?
    ).listen(port, hostName);
    await new Promise(resolve => server.on('listening', resolve));

    const { address, port: realPort } = server.address() as AddressInfo;
    this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);

    return new StartOutput(realPort);
  }

  public async stop(): Promise<void> {
    this.logger.debug(`stop()`);

    await new Promise(resolve => this.server!.close(resolve));
  }

  @bound
  private handleRequest(req: Http2ServerRequest, res: Http2ServerResponse): void {
    this.logger.info(`handleRequest(url=${req.url})`);

    try {
      // const buffer = await readBuffer(req); // TODO handle this later
      const context = new HttpContext(this.container, req, res, null!);
      this.http2FileServer.handleRequest(context);
    } catch (err) {
      this.logger.error(`handleRequest Error: ${(err as Error).message}\n${(err as Error).stack}`);

      res.statusCode = HTTPStatusCode.InternalServerError;
      res.end();
    }
  }
}
