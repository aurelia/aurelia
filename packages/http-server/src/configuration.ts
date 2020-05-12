import { ColorOptions, IContainer, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { Http2Server, HttpServer } from './http-server';
import { IHttp2FileServer, IHttpServer, IHttpServerOptions, IRequestHandler } from './interfaces';
import { FileServer, Http2FileServer } from './request-handlers/file-server';
import { HttpServerOptions } from './server-options';

const opts: HttpServerOptions = new HttpServerOptions();

export const RuntimeNodeConfiguration = {
  create(customization: Partial<IHttpServerOptions>) {
    opts.applyConfig(customization);
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
