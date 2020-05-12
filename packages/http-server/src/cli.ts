import { DebugConfiguration } from '@aurelia/debug';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { HttpServerOptions } from './server-options';
import { DI } from '@aurelia/kernel';
import { RuntimeNodeConfiguration } from './configuration';
import { IHttpServer } from './interfaces';

const cwd = process.cwd();
function parseArgs(args: string[]): null | HttpServerOptions {
  const cmd = args[0];
  if (cmd === 'help') { return null; }

  const configuration: HttpServerOptions = new HttpServerOptions();
  if (args.length % 2 === 1) {
    // check for configuration file
    const configurationFile = resolve(cwd, args[0]);
    if (!existsSync(configurationFile)) {
      throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
      const config = require(configurationFile);
      configuration.applyConfig(config);
      args = args.slice(1);
    }
  }

  configuration.applyOptionsFromCli(cwd, args);
  return configuration;
}

(async function () {
  DebugConfiguration.register();

  const parsed = parseArgs(process.argv.slice(2));
  if (parsed === null) {
    console.log(new HttpServerOptions().toString());
  } else {
    const container = DI.createContainer();
    container.register(RuntimeNodeConfiguration.create(parsed));
    const server = container.get(IHttpServer);
    await server.start();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
