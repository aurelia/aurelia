import { DI, IContainer } from '@aurelia/kernel';
import { IHttpServer, RuntimeNodeConfiguration } from '@aurelia/http-server';
import { AuServerOptions } from './au-configuration-options';

export class DevServer {
  public constructor(
    @IContainer
    protected readonly container: IContainer
  ) { }

  public static create(container = DI.createContainer()): DevServer {
    return new DevServer(container);
  }

  public async run(option: AuServerOptions): Promise<void> {

    // wireup
    const container = this.container.createChild();
    container.register(RuntimeNodeConfiguration.create(option.toNodeHttpServerOptions()));

    // TODO compile/bundle
    // TODO inject the entry script to index.html template (from user-space)

    // start the http/file/websocket server
    const server = container.get(IHttpServer);
    await server.start();
  }
}
