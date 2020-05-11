/* eslint-disable prefer-template */
import { LogLevel as $LogLevel } from '@aurelia/kernel';
import { IHttpServerOptions, normalizePath } from '@aurelia/runtime-node';
import { EOL } from 'os';

const space = ' ';
export class AuConfigurationOptions {
  public constructor(
    public server: AuServerOptions = new AuServerOptions()
  ) { }

  /** @internal */
  public applyConfig(config: Partial<AuConfigurationOptions>) {
    const server = config.server;
    if(server !== void 0 && server !== null){
      this.server.applyConfig(server);
    }
  }

  /** @internal */
  public toString() {
    const indent = space.repeat(2);
    return `au server`
      + `${indent}Starts the dev server`
      + this.server.toString(indent.repeat(2));
  }
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none';

// This can actually be merged with IHttpServerOptions completely.
// However, keeping these 2 separate offers bit more flexibility to CLI.
// Merging the two is probably more appropriate.
export class AuServerOptions implements Omit<IHttpServerOptions, 'level'> {
  public constructor(
    public root: string = './public/',
    public hostName: string = '0.0.0.0',
    public port: number = 8080,
    public useHttp2: boolean = false,
    public useHttps: boolean = false,
    public key: string | undefined = undefined,
    public cert: string | undefined = undefined,
    public logLevel: LogLevel = 'info',
    public responseCacheControl: string | undefined = 'no-store',
  ) { }

  /** @internal */
  public applyConfig(config: Partial<AuServerOptions>) {
    // non-nested object-tree is expected.
    for (const [key, value] of Object.entries(config)) {
      (this as any)[key] = value;
    }
  }

  /** @internal */
  public toNodeHttpServerOptions(): IHttpServerOptions {
    const useHttp2 = this.useHttp2;
    const useHttps = this.useHttps;
    const key = this.key;
    const cert = this.cert;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if ((useHttp2 || useHttps) && !(key && cert)) { // boolean coercion is needed
      throw new Error(`key and cert are required for a HTTP/2 server`);
    }

    return {
      root: this.root,
      hostName: this.hostName,
      port: this.port,
      level: this.serverLogLevel,
      useHttp2,
      useHttps: useHttp2 || useHttps,
      key: key ? normalizePath(key) : void 0,
      cert: cert ? normalizePath(cert) : void 0,
    };
  }

  /** @internal */
  public toString(indent = space.repeat(2)) {
    const l2Indent = `${indent}${space.repeat(2)}`;
    return `${indent}root${EOL}`
      + `${l2Indent}Description: The HTTP or HTTP/2 server serves the files from this directory${EOL}`
      + `${l2Indent}Value: ${this.root}${EOL}`
      + `${indent}hostName${EOL}`
      + `${l2Indent}Description: The host-name to be used${EOL}`
      + `${l2Indent}Value: ${this.hostName}${EOL}`
      + `${indent}port${EOL}`
      + `${l2Indent}Description: The port to be used${EOL}`
      + `${l2Indent}Value: ${this.port}${EOL}`
      + `${indent}useHttp2${EOL}`
      + `${l2Indent}Description: Whether to use HTTP/2 or not${EOL}`
      + `${l2Indent}Value: ${this.useHttp2}${EOL}`
      + `${indent}useHttps${EOL}`
      + `${l2Indent}Description: Whether to use SSL or not${EOL}`
      + `${l2Indent}Value: ${this.useHttps}${EOL}`
      + `${indent}key${EOL}`
      + `${l2Indent}Description: Optional path to the key file; required for https:// and HTTP/2${EOL}`
      + `${l2Indent}Value: ${this.key}${EOL}`
      + `${indent}cert${EOL}`
      + `${l2Indent}Description: Optional path to the certificate file; required for https:// and HTTP/2${EOL}`
      + `${l2Indent}Value: ${this.cert}${EOL}`
      + `${indent}logLevel${EOL}`
      + `${l2Indent}Description: Log level used by the HTTP server${EOL}`
      + `${l2Indent}Value: ${this.logLevel}${EOL}`
      ;
  }

  private get serverLogLevel(): $LogLevel {
    switch (this.logLevel) {
      case 'trace': return $LogLevel.trace;
      case 'debug': return $LogLevel.debug;
      case 'info': return $LogLevel.info;
      case 'warn': return $LogLevel.warn;
      case 'error': return $LogLevel.error;
      case 'fatal': return $LogLevel.fatal;
      case 'none': return $LogLevel.none;
    }
  }
}
