import { LogLevel as $LogLevel } from '@aurelia/kernel';
import { EOL } from 'os';
import { resolve } from 'path';
import { IHttpServerOptions, LogLevel } from './interfaces';

const space = ' ';

export class HttpServerOptions implements IHttpServerOptions {
  public constructor(
    public root: string = './public/',
    public hostName: string = '0.0.0.0',
    public port: number = 8080,
    public useHttp2: boolean = false,
    public useHttps: boolean = false,
    public key: string | undefined = undefined,
    public cert: string | undefined = undefined,
    public logLevel: LogLevel = 'info',
    public responseCacheControl: string | undefined = 'max-age=3600',
  ) { }

  public applyConfig(config: Partial<IHttpServerOptions>) {
    // non-nested object-tree is expected.
    for (const [key, value] of Object.entries(config)) {
      (this as any)[key] = value;
    }
  }

  /** @internal */
  public validate(): void {
    const useHttp2 = this.useHttp2;
    const useHttps = this.useHttps;
    const key = this.key;
    const cert = this.cert;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if ((useHttp2 || useHttps) && !(key && cert)) { // boolean coercion is needed
      throw new Error(`key and cert are required for a HTTP/2 server`);
    }
  }

  public toString(indent = '') {
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

  public get level(): $LogLevel {
    const logLevel = this.logLevel;
    if (typeof logLevel === 'number') { return logLevel; }
    switch (logLevel) {
      case 'trace': return $LogLevel.trace;
      case 'debug': return $LogLevel.debug;
      case 'info': return $LogLevel.info;
      case 'warn': return $LogLevel.warn;
      case 'error': return $LogLevel.error;
      case 'fatal': return $LogLevel.fatal;
      case 'none': return $LogLevel.none;
    }
  }

  public applyOptionsFromCli(cwd: string, args: string[], argPrefix = '') {
    const unconsumedArgs: string[] = [];
    while (args.length > 0) {
      const key = args[0].trim().replace(/-/g, '');
      const value = args[1];
      switch (key) {
        case `${argPrefix}root`:
          this.root = resolve(cwd, value);
          break;
        case `${argPrefix}hostName`:
          this.hostName = value;
          break;
        case `${argPrefix}port`:
          this.port = Number(value);
          break;
        case `${argPrefix}key`:
          this.key = resolve(cwd, value);
          break;
        case `${argPrefix}cert`:
          this.cert = resolve(cwd, value);
          break;
        case `${argPrefix}useHttp2`:
          this.useHttp2 = value === 'true';
          break;
        case `${argPrefix}logLevel`:
          this.logLevel = value as unknown as LogLevel;
          break;
        case `${argPrefix}responseCacheControl`:
          this.responseCacheControl = value;
          break;
        default:
          unconsumedArgs.push(key, value);
          break;
      }
      args.splice(0, 2);
    }

    if (unconsumedArgs.length > 0) {
      console.warn(`Following arguments are not consumed ${unconsumedArgs.join(',')}`);
    }
  }
}
