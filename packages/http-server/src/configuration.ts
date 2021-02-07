import { ColorOptions, ConsoleSink, IContainer, IPlatform, LoggerConfiguration, Platform, Registration } from '@aurelia/kernel';
import { Http2Server, HttpServer } from './http-server.js';
import { IHttp2FileServer, IHttpServer, IHttpServerOptions, IRequestHandler } from './interfaces.js';
import { FileServer, Http2FileServer } from './request-handlers/file-server.js';
import { PushStateHandler } from './request-handlers/push-state-handler.js';
import { HttpServerOptions } from './server-options.js';

const opts: HttpServerOptions = new HttpServerOptions();

export const HttpServerConfiguration = {
  create(customization: Partial<IHttpServerOptions>) {
    opts.applyConfig(customization);
    opts.validate();
    return {
      register(container: IContainer): IContainer {
        container.register(
          Registration.instance(IHttpServerOptions, opts),
          Registration.singleton(IRequestHandler, PushStateHandler),
          Registration.singleton(IRequestHandler, FileServer),
          Registration.singleton(IHttp2FileServer, Http2FileServer),
          LoggerConfiguration.create({ sinks: [ConsoleSink], level: opts.level, colorOptions: ColorOptions.colors }),
          Registration.instance(IPlatform, new Platform(globalThis)),
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
