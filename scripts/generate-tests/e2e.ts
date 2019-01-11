import { writeFile } from 'fs';
import { join } from 'path';
import { createLogger } from '../logger';
import project from '../project';

const log = createLogger('generate-e2e');

const cases = project.test.wdio.cases;
type $channel = keyof typeof cases;
type $app = keyof typeof cases[$channel];

async function emit(path: string, content: string) {
  return new Promise((resolve, reject) => {
    writeFile(path, content, { encoding: 'utf8' }, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

const defaults = {
  'package.json': {
    'dependencies': {
      'local': {
        '@aurelia/debug': 'file:../../../../../packages/debug',
        '@aurelia/jit-html': 'file:../../../../../packages/jit-html',
        '@aurelia/jit-html-browser': 'file:../../../../../packages/jit-html-browser',
        '@aurelia/jit': 'file:../../../../../packages/jit',
        '@aurelia/kernel': 'file:../../../../../packages/kernel',
        '@aurelia/runtime-html': 'file:../../../../../packages/runtime-html',
        '@aurelia/runtime-html-browser': 'file:../../../../../packages/runtime-html-browser',
        '@aurelia/runtime': 'file:../../../../../packages/runtime'
      },
      'dev': {
        '@aurelia/debug': 'dev',
        '@aurelia/jit-html': 'dev',
        '@aurelia/jit-html-browser': 'dev',
        '@aurelia/jit': 'dev',
        '@aurelia/kernel': 'dev',
        '@aurelia/runtime-html': 'dev',
        '@aurelia/runtime-html-browser': 'dev',
        '@aurelia/runtime': 'dev'
      },
      'latest': {
        '@aurelia/debug': 'latest',
        '@aurelia/jit-html': 'latest',
        '@aurelia/jit-html-browser': 'latest',
        '@aurelia/jit': 'latest',
        '@aurelia/kernel': 'latest',
        '@aurelia/runtime-html': 'latest',
        '@aurelia/runtime-html-browser': 'latest',
        '@aurelia/runtime': 'latest'
      }
    }
  },
  '.README.md': {
    'instructions': `
## Getting started

To install and run the app (in watch mode):

\`\`\`bash
npm install
npm run watch
\`\`\`

To install and run the app (in "prod" mode):

\`\`\`bash
npm install
npm run build
npm run serve
\`\`\`
`
  },
  'src': {
    'app.html': {
      'content': `<template>
  <div>\${message}</div>
</template>
`
    },
    'app.ts': {
      'content': `import { customElement } from '@aurelia/runtime';
import template from './app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
`
    },
    'html.d.ts': {
      'content': `declare module '*.html' {
  const value: string;
  export default value;
}
`
    },
    'startup.ts': {
      'content': `import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
`
    }
  },
  'tsconfig.json': {
    'content': `{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "lib": ["esnext", "dom"],
    "module": "esnext",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "target": "es2018"
  },
  "include": ["src"]
}
`
  }
};

const settings = {
  'jit-aurelia-cli-ts': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'au run --watch',
          'build': 'rimraf scripts && au build',
          'serve': 'http-server -c-1 -p 9000 .'
        }
      },
      'dependencies': {
        ...defaults['package.json'].dependencies,
        'all': {
          'requirejs': 'latest',
          'text': 'github:requirejs/text#latest'
        }
      },
      'devDependencies': {
        'all': {
          '@types/node': 'latest',
          'aurelia-cli': 'latest',
          'browser-sync': 'latest',
          'connect-history-api-fallback': 'latest',
          'debounce': 'latest',
          'event-stream': 'latest',
          'gulp-changed-in-place': 'latest',
          'gulp-notify': 'latest',
          'gulp-plumber': 'latest',
          'gulp-sourcemaps': 'latest',
          'gulp-typescript': 'latest',
          'gulp-watch': 'latest',
          'gulp': 'latest',
          'http-server': 'latest',
          'minimatch': 'latest',
          'rimraf': 'latest',
          'typescript': 'latest'
        }
      }
    },
    'README.md': {
      ...defaults['.README.md']
    },
    'src': {
      ...defaults.src,
      'app.ts': {
        'content': `import { customElement } from '@aurelia/runtime';
import * as template from 'text!./app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
`
      },
      'html.d.ts': {
        'content': `declare module '*.html' {
  const value: string;
  export = value;
}
`
      }
    }
  },
  'jit-browserify-ts': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'gulp',
          'build': 'rimraf dist && gulp build',
          'serve': 'http-server -c-1 -p 9000 .'
        }
      },
      'dependencies': {
        ...defaults['package.json'].dependencies,
        'all': {}
      },
      'devDependencies': {
        'all': {
          '@types/node': 'latest',
          'browser-sync': 'latest',
          'browserify': 'latest',
          'gulp': '^3.9.1',
          'http-server': 'latest',
          'rimraf': 'latest',
          'stringify': 'latest',
          'tsify': 'latest',
          'typescript': 'latest',
          'vinyl-source-stream': 'latest',
          'watchify': 'latest'
        }
      }
    },
    'README.md': {
      ...defaults['.README.md']
    },
    'src': {
      ...defaults.src,
      'app.ts': {
        'content': `import { customElement } from '@aurelia/runtime';
import * as template from './app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
`
      },
      'html.d.ts': {
        'content': `declare module '*.html' {
  const value: string;
  export = value;
}
`
      }
    }
  },
  'jit-fuse-box-ts': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'node fuse dev',
          'build': 'rimraf dist && node fuse prod',
          'serve': 'http-server -c-1 -p 9000 dist'
        }
      },
      'dependencies': {
        ...defaults['package.json'].dependencies,
        'all': {}
      },
      'devDependencies': {
        'all': {
          '@types/node': 'latest',
          'http-server': 'latest',
          'rimraf': 'latest',
          'typescript': 'latest',
          'fuse-box': 'latest',
          'uglify-es': 'latest',
          'uglify-js': 'latest'
        }
      }
    },
    'README.md': {
      ...defaults['.README.md']
    },
    'src': {
      ...defaults.src
    }
  },
  'jit-iife-inline': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'http-server -c-1 -p 9000 .',
          'build': 'echo \"Nothing to build!\"',
          'serve': 'http-server -c-1 -p 9000 .'
        },
        'local': {
          'build': 'copyfiles -u 7 ../../../../../packages/jit-html-browser/dist/index.iife.full.js .'
        }
      },
      'dependencies': {
        'all': {}
      },
      'devDependencies': {
        'all': {
          'http-server': 'latest'
        },
        'local': {
          'copyfiles': 'latest'
        }
      }
    },
    'README.md': {
      'instructions': `
## Getting started

Simply open index.html in your browser!

Alternatively:

\`\`\`bash
npm install
npm run serve
\`\`\`
`
    },
    'src': {}
  },
  'jit-parcel-ts': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'parcel index.html -p 9000 --open',
          'build': 'rimraf dist && parcel build index.html',
          'serve': 'http-server -c-1 -p 9000 dist'
        },
        'local': {
          'prebuild': 'rimraf *.tgz && npm run copypackages && npm run renamepackages && npm run installpackages',
          'copypackages': 'copyfiles -u 7 ../../../../../packages/*/*.tgz .',
          'renamepackages': 'rname -r \"(?<name>[a-z\\-]+)(?<version>-\\d.\\d.\\d)\" --noindex aurelia*.tgz \"{{name}}\"',
          'installpackages': 'npm i --save ./aurelia-kernel.tgz ./aurelia-runtime.tgz ./aurelia-runtime-html.tgz ./aurelia-runtime-html-browser.tgz ./aurelia-debug.tgz ./aurelia-jit.tgz ./aurelia-jit-html.tgz ./aurelia-jit-html-browser.tgz'
        }
      },
      'dependencies': {
        'local': {},
        'dev': {
          ...defaults['package.json'].dependencies.dev
        },
        'latest': {
          ...defaults['package.json'].dependencies.latest
        },
        'all': {}
      },
      'devDependencies': {
        'all': {
          '@types/node': 'latest',
          'babel-core': 'latest',
          'babel-plugin-transform-class-properties': 'latest',
          'babel-plugin-transform-decorators-legacy': 'latest',
          'http-server': 'latest',
          'parcel-bundler': 'latest',
          'parcel-plugin-typescript': 'latest',
          'rimraf': 'latest',
          'typescript': 'latest'
        },
        'local': {
          'copyfiles': 'latest',
          'rename-cli': 'latest'
        }
      }
    },
    'README.md': {
      ...defaults['.README.md']
    },
    'src': {
      ...defaults.src
    }
  },
  'jit-webpack-ts': {
    'package.json': {
      'scripts': {
        'all': {
          'watch': 'webpack-dev-server --no-inline',
          'build': 'rimraf dist && webpack --config webpack.config.js',
          'serve': 'http-server -c-1 -p 9000 dist'
        }
      },
      'dependencies': {
        ...defaults['package.json'].dependencies,
        'all': {}
      },
      'devDependencies': {
        'all': {
          '@types/node': 'latest',
          'html-loader': 'latest',
          'html-webpack-plugin': 'latest',
          'http-server': 'latest',
          'rimraf': 'latest',
          'ts-loader': 'latest',
          'typescript': 'latest',
          'webpack-cli': 'latest',
          'webpack-dev-server': 'latest',
          'webpack': 'latest'
        }
      }
    },
    'README.md': {
      ...defaults['.README.md']
    },
    'src': {
      ...defaults.src
    }
  }
}

const generate = {
  async ['.npmrc'](channel: $channel, app: $app) {
    const content = `package-lock=false
`;

    await emit(join(cases[channel][app].path, '.npmrc'), content);

    if (channel === 'dev') {
      await emit(join(project.examples[app].path, '.npmrc'), content);
    }
  },
  async ['README.md'](channel: $channel, app: $app) {
    const content = `# ${app}\n${settings[app]['README.md'].instructions}`;

    await emit(join(cases[channel][app].path, 'README.md'), content);

    if (channel === 'dev') {
      await emit(join(project.examples[app].path, 'README.md'), content);
    }
  },
  async ['package.json'](channel: $channel, app: $app) {
    const obj = {
      name: app,
      license: project.pkg.license,
      engines: project.pkg.engines,
      version: project.lerna.version,
      scripts: {
        ...settings[app]['package.json'].scripts.all,
        ...settings[app]['package.json'].scripts[channel]
      },
      dependencies: {
        ...settings[app]['package.json'].dependencies.all,
        ...settings[app]['package.json'].dependencies[channel]
      },
      devDependencies: {
        ...settings[app]['package.json'].devDependencies.all,
        ...settings[app]['package.json'].devDependencies[channel]
      }
    };

    const content = JSON.stringify(obj, null, 2) + '\n';

    await emit(join(cases[channel][app].path, 'package.json'), content);

    if (channel === 'dev') {
      await emit(join(project.examples[app].path, 'package.json'), content);
    }
  },
  async ['src'](channel: $channel, app: $app) {
    const src = settings[app].src;
    const files = Object.keys(src);
    for (const file of files) {
      const content = src[file].content;
      await emit(join(cases[channel][app].path, 'src', file), content);

      if (channel === 'dev') {
        await emit(join(project.examples[app].path, 'src', file), content);
      }
    }
  }
};

type $file = keyof typeof generate;

async function run() {
  const channelNames = Object.keys(cases) as $channel[];
  for (const channelName of channelNames) {
    const appNames = Object.keys(cases[channelName]) as $app[];
    for (const appName of appNames) {
      log(`generating test app ${channelName}/${appName}`);
      const fileNames = Object.keys(generate) as $file[];
      for (const file of fileNames) {
        await generate[file](channelName, appName);
      }
    }
  }
}

run().then(() => {
  log(`Done.`);
});
