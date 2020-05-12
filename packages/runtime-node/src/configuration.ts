import { Registration, IContainer, LogLevel, LoggerConfiguration, ColorOptions } from '@aurelia/kernel';
import { IHttpServer, IHttpServerOptions, IRequestHandler, IHttp2FileServer } from './interfaces';
import { HttpServer, Http2Server } from './http-server';
import { FileServer, Http2FileServer } from './request-handlers/file-server';

const defaultOpts: IHttpServerOptions = {
  hostName: '0.0.0.0',
  port: 8080,
  root: './',
  level: LogLevel.info,
  useHttp2: false,
  useHttps: false,
  responseCacheControl: 'max-age=3600'
};

export const RuntimeNodeConfiguration = {
  create(opts: Partial<IHttpServerOptions>) {
    opts = { ...defaultOpts, ...opts };
    return {
      register(container: IContainer): IContainer {
        container.register(
          Registration.instance(IHttpServerOptions, opts),
          Registration.singleton(IRequestHandler, FileServer),
          Registration.singleton(IHttp2FileServer, Http2FileServer),
          LoggerConfiguration.create(console, opts.level, ColorOptions.colors)
        );

        if (opts.useHttp2) {
          container.register(Registration.singleton(IHttpServer, Http2Server));
        } else {
          container.register(Registration.singleton(IHttpServer, HttpServer));
        }

        return container;
      },
    };
  }
};
