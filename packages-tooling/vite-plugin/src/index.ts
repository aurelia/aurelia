import { IOptionalPreprocessOptions, preprocess } from '@aurelia/plugin-conventions';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { resolve, dirname } from 'path';
import { promises } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default function au(options: {
  include?: FilterPattern;
  exclude?: FilterPattern;
  pre?: boolean;
  /**
   * Indiciates whether the plugin should alias aurelia packages to the dev bundle.
   */
  useDev?: boolean;
} & IOptionalPreprocessOptions = {}) {
  const {
    include = 'src/**/*.{ts,js,html}',
    exclude,
    pre = true,
    useDev,
    ...additionalOptions
  } = options;
  const filter = createFilter(include, exclude);
  const isVirtualTsFileFromHtml = (id: string) => id.endsWith('.$au.ts');

  const devPlugin: import('vite').Plugin = {
    name: 'aurelia:dev-alias',
    config(config) {
      const isDev = useDev === true || (useDev == null && config.mode !== 'production');
      if (!isDev) {
        return;
      }

      [
        'platform',
        'platform-browser',
        'aurelia',
        'fetch-client',
        'router',
        'kernel',
        'metadata',
        'i18n',
        'state',
        'route-recognizer',
        'compat-v1',
        'dialog',
        'expression-parser',
        'runtime',
        'template-compiler',
        'runtime-html',
        'router-direct',
      ].reduce((aliases, pkg) => {
        const name = pkg === 'aurelia' ? pkg : `@aurelia/${pkg}`;
        try {
          const packageLocation = require.resolve(name);
          aliases[name] = resolve(packageLocation, `../../esm/index.dev.mjs`);
        } catch {/* needs not to do anything */}
        return aliases;
      }, ((config.resolve ??= {}).alias ??= {}) as Record<string, string>);
    },
  };

  let $config!: import('vite').ResolvedConfig;

  const auPlugin: import('vite').Plugin = {
    name: 'au2',
    enforce: pre ? 'pre' : 'post',
    configResolved(config) {
      $config = config;
    },
    async transform(code, id) {
      if (!filter(id)) return;
      // .$au.ts = .html
      // which already preprocessed by the load hook of this plugin
      if (isVirtualTsFileFromHtml(id)) return;

      const result = preprocess({
        path: id,
        contents: code,
      }, {
        // hmr: true,
        hmrModule: 'import.meta',
        getHmrCode,
        transformHtmlImportSpecifier: (s) => {
          return $config.mode === 'production'
            ? s.replace(/\.html$/, '.$au.ts')
            : s;
        },
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions
      });
      return result;
    },

    resolveId(id, importer) {
      if (!isVirtualTsFileFromHtml(id)) {
        return null;
      }

      // Vite id is in POSIX format, either relative like ./foo.ts or absolute like /src/foo.ts
      // When absolute is in use:
      // 1. on POSIX system, resolve('/some/dir', '/src/foo.ts') => '/src/foo.ts'
      // 2. on win32 system, resolve('C:\\some\\dir', '/src/foo.ts') => 'C:\\src\\foo.ts' that's
      // not what vite want.
      //
      // For absolute path like /src/foo.ts, retain it on win32, and let vitest.config's test.root
      // to resolve it.
      if (id.startsWith('/')) return id;

      id = resolve(dirname(importer ?? ''), this.meta.watchMode ? id.replace(/^\//, './') : id);
      return id;
    },

    async load(id) {
      if (!isVirtualTsFileFromHtml(id)) {
        return null;
      }
      const htmlId = id.replace('.$au.ts', '.html');
      const code = await promises.readFile(htmlId, { encoding: 'utf-8' });
      const result = preprocess({
        path: htmlId,
        contents: code,
      }, {
        hmrModule: 'import.meta',
        transformHtmlImportSpecifier: s => s.replace(/\.html$/, '.$au.ts'),
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions
      });
      return result!.code;
    }
  };

  return [devPlugin, auPlugin];
}

function getHmrCode(className: string, moduleNames: string = ''): string {
  const moduleText = 'import.meta';
  const code = `
import { Metadata as $$M } from '@aurelia/metadata';
import {
  Controller as $$C,
  CustomElement as $$CE,
  IHydrationContext as $$IHC,
  PropertyBinding as $$PB,
  ContentBinding as $$CB,
} from '@aurelia/runtime-html';

// @ts-ignore
const controllers = [];

// @ts-ignore
if (${moduleText}.hot) {

  // @ts-ignore
  ${moduleText}.hot.accept(/* ${moduleNames ? `${JSON.stringify(moduleNames)}, ` : ''}  */function (newModule, oldModule) {
    // console.log({ newModule, oldModule });
  });

  let aurelia = ${moduleText}.hot.data?.aurelia;

  // @ts-ignore
  document.addEventListener('au-started', (event) => {aurelia= event.detail; });
  const currentClassType = ${className};

  // @ts-ignore
  const proto = ${className}.prototype;

  // @ts-ignore
  const $created = proto?.created;
  // @ts-ignore
  const $dispose = proto?.dispose;

  if (proto) {
    // @ts-ignore
    proto.created = function(controller) {
      // @ts-ignore
      $created?.call(this, controller);
      controllers.push(controller);
    }
    // @ts-ignore
    proto.dispose = function() {
      // @ts-ignore
      $dispose?.call(this);
      controllers.length = 0;
    }
  }

  // @ts-ignore
  ${moduleText}.hot.dispose(function (data) {
    // @ts-ignore
    data.controllers = controllers;
    data.aurelia = aurelia;
  });

  if (${moduleText}.hot.data?.aurelia) {
    const newDefinition = $$CE.getDefinition(currentClassType);
    $$M.define(newDefinition, currentClassType, newDefinition.name);
    $$M.define(newDefinition, newDefinition, newDefinition.name);
    ${moduleText}.hot.data.aurelia.container.res[$$CE.keyFrom(newDefinition.name)] = newDefinition;

    const previousControllers = ${moduleText}.hot.data.controllers;
    if (previousControllers == null || previousControllers.length === 0) {
      // @ts-ignore
      ${moduleText}.hot.invalidate();
    }

    // @ts-ignore
    previousControllers.forEach(controller => {
      const values = { ...controller.viewModel };
      const hydrationContext = controller.container.get($$IHC)
      const hydrationInst = hydrationContext.instruction;

      const bindableNames = Object.keys(controller.definition.bindables);
      // @ts-ignore
      Object.keys(values).forEach(key => {
        if (bindableNames.includes(key)) {
          return;
        }
        // if there' some bindings that target the existing property
        // @ts-ignore
        const isTargettedByBinding = controller.bindings?.some(y =>
          y instanceof $$PB
            && y.ast.$kind === 'AccessScope'
            && y.ast.name === key
          || y instanceof $$CB
            && y.ast.$kind === 'ValueConverter'
            && y.ast.expression.$kind === 'AccessScope'
            && y.ast.expression.name === key
        );
        if (!isTargettedByBinding) {
          delete values[key];
        }
      });
      const h = controller.host;
      delete controller._compiledDef;
      controller.viewModel = controller.container.invoke(currentClassType);
      controller.definition = newDefinition;
      console.log('assigning', JSON.stringify(Object.entries(values)));
      Object.assign(controller.viewModel, values);
      if (controller._hydrateCustomElement) {
        controller._hydrateCustomElement(hydrationInst, hydrationContext);
      } else {
        controller.hE(hydrationInst, hydrationContext);
      }
      h.parentNode.replaceChild(controller.host, h);
      controller.deactivate(controller, controller.parent ?? null, 0);
      controller.activate(controller, controller.parent ?? null, 0);
    });
  }
}`;

  return code;
}
