import { existsSync } from 'fs';
import { resolve } from 'path';
import { HttpServerOptions } from './server-options';
import { DI } from '@aurelia/kernel';
import { HttpServerConfiguration } from './configuration';
import { IHttpServer } from './interfaces';

const cwd = process.cwd();
async function parseArgs(args: string[]): Promise<null | HttpServerOptions> {
  const cmd = args[0];
  if (cmd === 'help') { return null; }

  const configuration: HttpServerOptions = new HttpServerOptions();
  if (args.length % 2 === 1) {
    // check for configuration file
    const configurationFile = resolve(cwd, args[0]);
    if (!existsSync(configurationFile)) {
      throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
    } else {
      let config;
      try {
        config = (await import(`${configurationFile}`)).default;
      } catch {
        try {
          config = (await import(`file://${configurationFile}`)).default;
        } catch {
          try {
            config = (await import(`file:///${configurationFile}`)).default;
          } catch {/*  */}
        }
      }
      if (config === void 0) {
        throw new Error('Unable to load configuration');
      }
      configuration.applyConfig(config);
      args = args.slice(1);
    }
  }

  configuration.applyOptionsFromCli(cwd, args);
  return configuration;
}

(async function () {
  const parsed = await parseArgs(process.argv.slice(2));
  if (parsed === null) {
    console.log(new HttpServerOptions().toString());
  } else {
    const container = DI.createContainer();
    container.register(HttpServerConfiguration.create(parsed));
    const server = container.get(IHttpServer);
    await server.start();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
