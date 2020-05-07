import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { IDevServerConfig, DevServer } from "./dev-server";

interface DevCommandArgs extends IDevServerConfig {
  cmd: 'dev';
}
type ParsedArgs = DevCommandArgs;

// TODO gather this from config file from user-space
const keyMap = {
  entryfile: 'entryFile',
  scratchdir: 'scratchDir',
  usehttp2: 'useHttp2',
  keypath: 'keyPath',
  certpath: 'certPath',
} as const;

function parseArgs(args: readonly string[]): ParsedArgs {
  const cmd = args[0];
  args = args.slice(1);

  if (args.length % 2 === 1) {
    throw new Error(`Uneven amount of args: ${args}. Args must come in pairs of --key value`);
  }

  switch (cmd) {
    case 'dev': {
      const parsed = {
        cmd,
        entryFile: '',
        scratchDir: '',
        keyPath: '',
        certPath: '',
        useHttp2: false
      };
      for (let i = 0, ii = args.length; i < ii; i += 2) {
        let key = args[i].trim().replace(/-/g, '').toLowerCase();
        if (!(key in keyMap)) {
          throw new Error(`Unknown key: ${key}. Possible keys are: ${Object.keys(keyMap)}`);
        }

        key = keyMap[key as keyof typeof keyMap];
        switch (key) {
          case 'entryFile':
            parsed.entryFile = resolve(process.cwd(), args[i + 1]);
            break;
          case 'scratchDir':
            parsed.scratchDir = resolve(process.cwd(), args[i + 1]);
            break;
          case 'keyPath':
            parsed.keyPath = resolve(process.cwd(), args[i + 1]);
            break;
          case 'certPath':
            parsed.certPath = resolve(process.cwd(), args[i + 1]);
            break;
          case 'useHttp2':
            parsed.useHttp2 = args[i + 1] === 'true';
            break;
        }
      }

      return parsed;
    }
  }

  throw new Error(`Unknown command: ${cmd}`);
}

(async function () {
  DebugConfiguration.register();

  const args = parseArgs(process.argv.slice(2));
  switch (args.cmd) {
    case 'dev': {
      const server = DevServer.create();
      await server.run(args);
      break;
    }
  }

})().catch(err => {
  console.error(err);
  process.exit(1);
});
