import { DebugConfiguration } from '@aurelia/debug';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { AuConfigurationOptions, LogLevel } from './au-configuration-options';
import { DevServer } from "./dev-server";
export { AuConfigurationOptions, LogLevel };

type AuCommands = 'help' | 'dev';

class ParsedArgs {
  public constructor(
    public cmd: AuCommands,
    public configuration: AuConfigurationOptions,
    public unknownCommand: string | undefined = undefined,
    public unconsumedArgs: string[] = [],
  ) { }
}

const cwd = process.cwd();
function parseArgs(args: string[]): ParsedArgs {
  const cmd = args[0];
  args = args.slice(1);

  const configuration: AuConfigurationOptions = new AuConfigurationOptions();
  if (args.length % 2 === 1) {
    // check for configuration file
    const configurationFile = resolve(cwd, args[0]);
    if (!existsSync(configurationFile)) {
      throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
      configuration.applyConfig(require(configurationFile));
      args = args.slice(1);
    }
  }

  let parsed: ParsedArgs;
  switch (cmd) {
    case 'help':
      parsed = new ParsedArgs(cmd, new AuConfigurationOptions());
      break;
    case 'dev': {
      parsed = new ParsedArgs(cmd, configuration);
      const server = configuration.server;
      while (args.length > 0) {
        const key = args[0].trim().replace(/-/g, '');
        const value = args[1];
        switch (key) {
          case 'server.root':
            server.root = resolve(cwd, value);
            break;
          case 'server.hostName':
            server.hostName = value;
            break;
          case 'server.port':
            server.port = Number(value);
            break;
          case 'server.key':
            server.key = resolve(cwd, value);
            break;
          case 'server.cert':
            server.cert = resolve(cwd, value);
            break;
          case 'server.useHttp2':
            server.useHttp2 = value === 'true';
            break;
          case 'server.logLevel':
            server.logLevel = value as unknown as LogLevel;
            break;
          case 'server.responseCacheControl':
            server.responseCacheControl = value;
            break;
          default:
            parsed.unconsumedArgs.push(key, value);
            break;
        }
        args.splice(0, 2);
      }
      break;
    }
    default:
      parsed = new ParsedArgs('help', new AuConfigurationOptions(), cmd);
      break;
  }

  const unconsumed = parsed.unconsumedArgs;
  if (unconsumed.length > 0) {
    console.warn(`Following arguments are not consumed ${unconsumed.join(',')}`);
  }
  return parsed;
}

(async function () {
  DebugConfiguration.register();

  const args = parseArgs(process.argv.slice(2));
  switch (args.cmd) {
    case 'dev': {
      const server = DevServer.create();
      await server.run(args.configuration.server);
      break;
    }
    case 'help': {
      const unknownCommand = args.unknownCommand;
      if (unknownCommand !== void 0) {
        console.error(`Unknown command: ${unknownCommand}; Refer the valid options below.`);
      }
      console.log(args.configuration.toString());
      break;
    }
  }

})().catch(err => {
  console.error(err);
  process.exit(1);
});
