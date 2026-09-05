import { preprocess } from '@aurelia/plugin-conventions';
import type { IFileUnit, IOptionalPreprocessOptions } from '@aurelia/plugin-conventions';
import { nodeFileUnitHost } from '@aurelia/plugin-conventions/node';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { resolve, dirname } from 'path';
import { promises } from 'fs';
import { createStandardDecoratorPlugin, normalizeFilterId } from './standard-decorators';
import { transformTemplateAssetUrls } from './template-assets';

export interface AureliaPluginOptions extends IOptionalPreprocessOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  pre?: boolean;
  /**
   * Indiciates whether the plugin should alias aurelia packages to the dev bundle.
   */
  useDev?: boolean;
  /**
   * Transform static asset URLs in HTML templates during production builds.
   *
   * Defaults to true.
   */
  transformTemplateAssets?: boolean;
  /**
   * Transform TC39 standard decorators before Vite compiles application modules.
   *
   * Defaults to true on Vite 8 and false on Vite 7. Set this to false when a
   * custom compiler or AOT pipeline guarantees decorator-free output.
   */
  transformStandardDecorators?: boolean;
  /**
   * Files eligible for standard decorator transformation.
   *
   * This is intentionally independent from `include`, which controls Aurelia
   * convention preprocessing.
   */
  standardDecoratorInclude?: FilterPattern;
  /**
   * Files excluded from standard decorator transformation.
   *
   * This is intentionally independent from `exclude`, which controls Aurelia
   * convention preprocessing.
   */
  standardDecoratorExclude?: FilterPattern;
}

export default function au(options: AureliaPluginOptions = {}) {
  const {
    include = 'src/**/*.{ts,js,html}',
    exclude,
    pre = true,
    useDev,
    transformTemplateAssets = true,
    transformStandardDecorators,
    standardDecoratorInclude,
    standardDecoratorExclude,
    transformHtml,
    ...additionalOptions
  } = options;
  const filter = createFilter(include, exclude);
  const isVirtualTsFileFromHtml = (id: string) => id.endsWith('.$au.ts');
  const isAureliaBareImport = (id: string) => id === 'aurelia' || /^@aurelia\/[^/]+$/.test(id);
  let useDevImports = false;

  const devPlugin: import('vite').Plugin = {
    name: 'aurelia:dev-alias',
    config(config, env) {
      const mode = config.mode ?? env.mode;
      useDevImports = useDev === true || (useDev == null && mode !== 'production');
    },
  };

  let $config!: import('vite').ResolvedConfig;
  const transformHtmlForVite = (html: string, unit: IFileUnit, warn: (message: string) => void) => {
    const transformedHtml = transformHtml?.(html, unit) ?? html;
    if (!transformTemplateAssets || typeof transformedHtml !== 'string' || $config.command !== 'build') {
      return transformedHtml;
    }
    return transformTemplateAssetUrls(transformedHtml, unit, nodeFileUnitHost, warn) ?? transformedHtml;
  };

  const auPlugin: import('vite').Plugin = {
    name: 'au2',
    enforce: pre ? 'pre' : 'post',
    configResolved(config) {
      $config = config;
    },
    async transform(code, id) {
      if (!filter(normalizeFilterId(id))) return;
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
          return $config.command === 'build'
            ? s.replace(/\.html$/, '.$au.ts')
            : s;
        },
        transformHtml: (html, unit) => transformHtmlForVite(html, unit, warning => this.warn(warning)),
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions,
        isDev: $config.command !== 'build',
      }, nodeFileUnitHost);
      return result;
    },

    async resolveId(id, importer, options) {
      if (useDevImports && isAureliaBareImport(id) && !id.endsWith('/development')) {
        return (await this.resolve(`${id}/development`, importer, { ...options, skipSelf: true }))?.id ?? `${id}/development`;
      }

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
        transformHtml: (html, unit) => transformHtmlForVite(html, unit, warning => this.warn(warning)),
        stringModuleWrap: (id) => `${id}?inline`,
        ...additionalOptions,
        isDev: $config.command !== 'build',
      }, nodeFileUnitHost);
      return result!.code;
    }
  };

  return [
    devPlugin,
    auPlugin,
    createStandardDecoratorPlugin({
      include: standardDecoratorInclude,
      exclude: standardDecoratorExclude,
      pre,
      transformStandardDecorators,
    }),
  ];
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

        // because we are in the previous controllers loop,
        // we are sure that the controllers array is initialized to empty,
        // from the HMR initialize code at the top.
        // hence we push the controller back to the controllers array.
        controllers.push(controller);
      });
    });
  }
}`;

  return code;
}
