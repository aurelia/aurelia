/* eslint-disable prefer-template */
import { HttpServerOptions } from '@aurelia/http-server';

const space = ' ';
export class AuConfigurationOptions {
  public constructor(
    public server: HttpServerOptions = new HttpServerOptions()
  ) { }

  /** @internal */
  public applyConfig(config: Partial<AuConfigurationOptions>) {
    const server = config.server;
    if (server !== void 0 && server !== null) {
      this.server.applyConfig(server);
    }
  }

  /** @internal */
  public toString() {
    const indent = space.repeat(2);
    return 'au server'
      + `${indent}Starts the dev server`
      + this.server.toString(indent.repeat(2));
  }
}
