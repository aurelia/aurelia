import { defineConfig } from 'vite';
import { preprocess } from '@aurelia/plugin-conventions';
import { createFilter } from '@rollup/pluginutils';
import path, { resolve } from 'path';

export default defineConfig({
  // mode: 'production',
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  build: {
    minify: false
  },
  resolve: {
    alias: {
      ...[
        'fetch-client',
        'router-lite',
        'kernel',
        'runtime',
        'runtime-html',
        'router-lite',
      ].reduce((map, pkg) => {
        const name = `@aurelia/${pkg}`;
        map[name] = resolve(__dirname, `../../../node_modules/${name}/dist/esm/index.dev.mjs`);
        return map;
      }, {})
    }
  },
  plugins: [
    au2({ include: 'src/**/*.{ts,js,html}', pre: true }),
  ]
});

function au2(options = {}) {
  const fs = require('fs');
  const filter = createFilter(options.include, options.exclude);
  const htmlCache = new Map();

  /** @type {import('vite').Plugin} */
  const auPlugin = {
    name: 'au2',
    enforce: options.pre ? 'pre' : 'post',
    async transform(code, id) {
      if (!filter(id)) return;
      // .$au.ts = .html
      // which already preprocessed by the load hook of this plugin
      if (id.endsWith('$au.ts')) return;

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
            : s.replace(/\.html$/, '.$au.ts')
        }
      })
      return result;
    },

    resolveId(id, importer) {
      if (!id.endsWith('.$au.ts')) {
        return null;
      }
      id = path.resolve(path.dirname(importer), this.meta.watchMode ? id.replace(/^\//, './') : id);
      return id;
    },

    async load(id) {
      if (!id.endsWith('.$au.ts')) {
        return null;
      }
      const htmlId = id.replace('.$au.ts', '.html');
      const code = await fs.promises.readFile(htmlId, { encoding: 'utf-8' });
      const result = preprocess({
        path: htmlId,
        contents: code,
      }, {
        // hmr: false,
        hmrModule: 'import.meta',
        transformHtmlImportSpecifier: s => s.replace(/\.html$/, '.$au.ts')
      })
      htmlCache.set(htmlId, result);
      return result.code;
    }
  };

  return auPlugin;
}

/**
 * @param {string} className
 * @param {string} moduleNames
 */
function getHmrCode(className, moduleNames) {
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
  const proto = ${className}.prototype

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
