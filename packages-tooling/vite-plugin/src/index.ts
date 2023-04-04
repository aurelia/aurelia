import { preprocess } from '@aurelia/plugin-conventions';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { resolve, dirname } from 'node:path';
import { promises } from 'node:fs';

export default function au(options: {
  include?: FilterPattern;
  exclude?: FilterPattern;
  pre?: boolean;
  // /**
  //  * Indiciates whether the plugin should alias aurelia packages to the dev bundle.
  //  *
  //  * @default true when NODE_ENV is not 'production'
  //  */
  // useDev?: boolean;
} = {}) {
  const {
    include = 'src/**/*.{ts,js,html}',
    exclude,
    pre = true,
    // useDev = !/production/i.test(process.env.NODE_ENV ?? ''),
  } = options;
  const filter = createFilter(include, exclude);
  const isVirtualTsFileFromHtml = (id: string) => id.endsWith('.$au.ts');

  // it's quite hard to make this work
  // so it's a todo for now
  // todo(vite-plugin): investigate how to enable the aliases
  //

  // const devPlugin = useDev ?
  //   alias({
  //     entries: [
  //       'aurelia',
  //       'fetch-client',
  //       'router-lite',
  //       'router',
  //       'kernel',
  //       'metadata',
  //       'i18n',
  //       'state',
  //       'route-recognizer',
  //       'compat-v1',
  //       'dialog',
  //       'runtime',
  //       'runtime-html',
  //       'router-lite',
  //     ].reduce((aliases: Record<string, string>, pkg) => {
  //       const name = pkg === 'aurelia' ? pkg : `@aurelia/${pkg}`;
  //       const packageLocation = require.resolve(name);
  //       aliases[name] = resolve(packageLocation, `../../esm/index.dev.mjs`);
  //       return aliases;
  //     }, {})
  //   }) as import('vite').Plugin
  //   : null;

  const auPlugin: import('vite').Plugin = {
    name: 'au2',
    enforce: pre ? 'pre' : 'post',
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
          return this.meta.watchMode
            ? s
            : s.replace(/\.html$/, '.$au.ts');
        }
      });
      return result;
    },

    resolveId(id, importer) {
      if (!isVirtualTsFileFromHtml(id)) {
        return null;
      }
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
        transformHtmlImportSpecifier: s => s.replace(/\.html$/, '.$au.ts')
      });
      return result!.code;
    }
  };

  return auPlugin;
}

function getHmrCode(className: string, moduleNames: string = ''): string {
  const moduleText = 'import.meta';
  const code =
`import { Metadata as $$M } from '@aurelia/metadata';
import { ExpressionKind as $$EK } from '@aurelia/runtime';
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
  const ogCreated = proto ? proto.created : undefined;

  if (proto) {
    // @ts-ignore
    proto.created = function(controller) {
      // @ts-ignore
      ogCreated && ogCreated.call(this, controller);
      controllers.push(controller);
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
    $$M.define(newDefinition.name, newDefinition, currentClassType);
    $$M.define(newDefinition.name, newDefinition, newDefinition);
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
            && y.ast.$kind === $$EK.AccessScope
            && y.ast.name === key
          || y instanceof $$CB
            && y.ast.$kind === $$EK.ValueConverter
            && y.ast.expression.$kind === $$EK.AccessScope
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
      controller.hostController = null;
      controller.deactivate(controller, controller.parent ?? null, 0);
      controller.activate(controller, controller.parent ?? null, 0);
    });
  }
}`;

  return code;
}
