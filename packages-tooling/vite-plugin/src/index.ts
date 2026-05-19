import { IOptionalPreprocessOptions, nodeFileSystem, preprocess } from '@aurelia/plugin-conventions';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { resolve, dirname } from 'path';

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
  const fileSystem = additionalOptions.fileSystem ?? nodeFileSystem;
  const isAuViewRequest = (id: string) => id.includes('?au-view');
  const toAuViewSpecifier = (id: string) => id.replace(/\.html$/, '.html?au-view');
  const matches = (id: string) => filter(id.split('?', 1)[0]);

  const devPlugin: import('vite').Plugin = {
    name: 'aurelia:dev-alias',
    sharedDuringBuild: true,
    config(config) {
      const isDev = useDev === true || (useDev == null && config.mode !== 'production');
      if (!isDev) {
        return;
      }

      (config.resolve ??= {}).conditions ??= [];
      if (!config.resolve.conditions.includes('development')) {
        config.resolve.conditions.unshift('development');
      }
    },
  };

  const resourcePlugin: import('vite').Plugin = {
    name: 'au2:resources',
    sharedDuringBuild: true,
    enforce: pre ? 'pre' : 'post',
    async transform(code, id) {
      if (!matches(id) || isAuViewRequest(id) || id.endsWith('.html')) return;

      return preprocess({
        path: id,
        contents: code,
      }, {
        hmrModule: 'import.meta',
        getHmrCode,
        transformHtmlImportSpecifier: toAuViewSpecifier,
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions
      });
    },

    resolveId(id, importer) {
      if (!isAuViewRequest(id)) {
        return null;
      }

      const [pathPart, query = ''] = id.split('?', 2);
      const querySuffix = `?${query}`;

      if (pathPart.startsWith('/')) return `${pathPart}${querySuffix}`;

      return resolve(dirname(importer ?? ''), this.meta.watchMode ? pathPart.replace(/^\//, './') : pathPart) + querySuffix;
    },

    load(id) {
      if (!isAuViewRequest(id) || !matches(id)) {
        return null;
      }

      const htmlId = id.replace(/\?au-view\b.*$/, '');
      return fileSystem.read({ path: htmlId, contents: '' }, htmlId);
    }
  };

  const viewPlugin: import('vite').Plugin = {
    name: 'au2:views',
    sharedDuringBuild: true,
    enforce: 'post',
    transform(code, id) {
      if (!isAuViewRequest(id) || !matches(id)) {
        return null;
      }

      const htmlId = id.replace(/\?au-view\b.*$/, '');
      return preprocess({
        path: htmlId,
        contents: code,
      }, {
        hmrModule: 'import.meta',
        getHmrCode,
        transformHtmlImportSpecifier: toAuViewSpecifier,
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions
      });
    }
  };

  return [devPlugin, resourcePlugin, viewPlugin];
}

function getHmrCode(className: string, moduleNames: string = ''): string {
  const moduleText = 'import.meta';
  const code = `
import { Metadata as $$M } from '@aurelia/metadata';
import { onResolve as $$onResolve } from '@aurelia/kernel';
import {
  Controller as $$C,
  CustomElement as $$CE,
  IHydrationContext as $$IHC,
  PropertyBinding as $$PB,
  ContentBinding as $$CB,
  refs as $$refs,
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
      const def = controller._compiledDef ?? newDefinition;
      $$onResolve(controller.deactivate(controller, controller.parent ?? null, 0), () => {
        controller.container.deregister(def.key);
        controller.container.deregister(def.Type);
        delete controller._compiledDef;
        $$refs.clear(h);
        controller.viewModel = controller.container.invoke(currentClassType);
        controller.definition = newDefinition;

        console.log('transferring old component bindable props:', values);
        Object.assign(controller.viewModel, values);

        if (controller._hydrateCustomElement) {
          controller._hydrateCustomElement(hydrationInst, hydrationContext);
        } else {
          controller.hE(hydrationInst, hydrationContext);
        }
        h.parentNode.replaceChild(controller.host, h);
        controller.activate(controller, controller.parent ?? null, 0);

        controllers.push(controller);
      });
    });
  }
}`;

  return code;
}
