import { existsSync } from 'fs';
import { resolve } from 'path';
import { AuConfigurationOptions } from './au-configuration-options.js';
import { DevServer } from "./dev-server.js";
export { AuConfigurationOptions };

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
async function parseArgs(args: string[]): Promise<ParsedArgs> {
  const cmd = args[0];
  args = args.slice(1);

  const configuration: AuConfigurationOptions = new AuConfigurationOptions();
  if (args.length % 2 === 1) {
    // check for configuration file
    const configurationFile = resolve(cwd, args[0]);
    if (!existsSync(configurationFile)) {
      throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
    } else {
      const config = (await import(`file://${configurationFile}`)).default;
      configuration.applyConfig(config);
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
      configuration.server.applyOptionsFromCli(cwd, args, 'server.');
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
  const args = await parseArgs(process.argv.slice(2));
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
