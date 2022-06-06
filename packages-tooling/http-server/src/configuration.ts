import { Platform } from '@aurelia/platform';
import { ColorOptions, ConsoleSink, IContainer, IPlatform, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { Http2Server, HttpServer } from './http-server';
import { IHttp2FileServer, IHttpServer, IHttpServerOptions, IRequestHandler } from './interfaces';
import { FileServer, Http2FileServer } from './request-handlers/file-server';
import { PushStateHandler } from './request-handlers/push-state-handler';
import { HttpServerOptions } from './server-options';

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
