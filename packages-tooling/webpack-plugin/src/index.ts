/* eslint-disable import/no-nodejs-modules */
import {
  IOptionalPreprocessOptions,
  preprocess,
  preprocessOptions,
} from "@aurelia/plugin-conventions";
import type webpack from "webpack";
import { extname } from "path";
import { fileURLToPath } from "url";

/**
 * Webpack plugin interface
 */
interface WebpackPluginInstance {
  apply(compiler: Compiler): void;
}

/**
 * LoaderContext interface for webpack 5 loader functions
 */
interface LoaderContext {
  cacheable?: () => void;
  async: () => (err?: Error | null, content?: string | Buffer, sourceMap?: unknown) => void;
  getOptions: () => IOptionalPreprocessOptions;
  resourcePath: string;
}

/**
 * Interface for webpack normalModuleFactory hook resolveData
 */
interface ResolveData {
  request?: string;
  loaders?: { loader: string; options?: IOptionalPreprocessOptions }[];
}

/**
 * Extended interface for webpack NormalModuleFactory with proper hook typing
 */
interface NormalModuleFactory extends webpack.NormalModuleFactory {
  hooks: {
    beforeResolve: {
      tap: (name: string, callback: (resolveData: ResolveData) => void) => void;
    };
  };
}

/**
 * Extended interface for webpack Compiler with proper hook typing
 */
interface Compiler extends webpack.Compiler {
  hooks: {
    normalModuleFactory: {
      tap: (name: string, callback: (normalModuleFactory: NormalModuleFactory) => void) => void;
    };
  };
}

/**
 * Webpack plugin entry. Designed so that both ESM `import` and CJS `require` obtain
 * the function directly without accessing a `.default` property – the same pattern
 * we already use for our Vite plugin. The returned instance wires its own loader
 * (defined further below in this file) into Webpack's `beforeLoaders` hook so that
 * existing "loader" behaviour continues to work transparently for template, TS and
 * JS resources.
 */
export default function auOrLoader(
  this: LoaderContext | void,
  arg?: string | Buffer | IOptionalPreprocessOptions,
  ..._rest: unknown[]
): WebpackPluginInstance | string {
  // Called as a loader → first argument is the file source (string or Buffer).
  if (typeof arg === "string" || Buffer.isBuffer(arg)) {
    // The loader signature is (source: string, inputSourceMap?: RawSourceMap | undefined)
    // Our loader fn has a 2nd arg for testing, so we only pass the source.
    const source = typeof arg === "string" ? arg : arg.toString();
    return loader.call(this as LoaderContext, source);
  }

  // Otherwise assume normal plugin usage where `arg` is our (optional) options object.
  return plugin(arg as IOptionalPreprocessOptions);
}

/**
 * Factory that creates the actual Aurelia Webpack plugin instance.
 */
export function plugin(
  options: IOptionalPreprocessOptions = {},
  _preprocess = preprocess
): WebpackPluginInstance {
  // Determine the absolute path of *this* file so we can reference our built-in loader.
  const loaderPath =
    typeof __filename === "string"
      ? __filename
      : fileURLToPath(import.meta.url);

  return {
    apply(compiler: Compiler) {
      // Use webpack 5's normalModuleFactory hook to access loader hooks
      compiler.hooks.normalModuleFactory.tap(
        "AureliaWebpackPlugin",
        (normalModuleFactory: NormalModuleFactory) => {
          normalModuleFactory.hooks.beforeResolve.tap(
            "AureliaWebpackPlugin",
            (resolveData: ResolveData) => {
              // Only process .js and .ts files
              const request = resolveData.request;
              if (!request) return;

              const ext = extname(request);
              if (ext !== ".js" && ext !== ".ts") {
                return;
              }

              // Add our loader to the loader list
              if (!resolveData.loaders) {
                resolveData.loaders = [];
              }

              resolveData.loaders.unshift({
                loader: loaderPath,
                options,
              });
            }
          );
        }
      );
    },
  };
}

/**
 * The loader implementation that the plugin injects for every matched module.
 * It simply delegates to `@aurelia/plugin-conventions` to perform preprocessing
 * (HMR code injection, etc.) and hands the result back
 * to Webpack.
 */
export function loader(
  this: LoaderContext,
  contents: string,
  _preprocess = preprocess
): string {
  // Let Webpack know the result is cacheable for better build performance.
  this.cacheable?.();

  const cb = this.async();
  const options = this.getOptions();
  const filePath = this.resourcePath;

  try {
    const result = _preprocess(
      { path: filePath, contents },
      preprocessOptions({
        ...options,
        getHmrCode,
      })
    );

    if (result) {
      cb(null, result.code, result.map);
      return result.code;
    }

    cb(null, contents);
    return contents;
  } catch (e) {
    cb(e as Error);
    return contents;
  }
}

// --- Internal helpers ------------------------------------------------------

/**
 * Generates Hot-Module-Replacement code tailored for the supplied component class
 * name. The logic mirrors what we offer in the existing loader so that behaviour
 * remains identical after the migration to the plugin.
 */
const getHmrCode = (className: string): string => {
  const code = `
    import { Metadata as $$M } from '@aurelia/metadata';
    import { Controller as $$C, CustomElement as $$CE, IHydrationContext as $$IHC } from '@aurelia/runtime-html';

    // @ts-ignore
    const controllers = [];

    // @ts-ignore
    if (module.hot) {

    // @ts-ignore
    module.hot.accept();

    // @ts-ignore
    const hot = module.hot;

    let aurelia = hot.data?.aurelia;

    // @ts-ignore
    document.addEventListener('au-started', (event) => {aurelia= event.detail; });
    const currentClassType = ${className};

    // @ts-ignore
    const proto = ${className}.prototype

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
    hot.dispose(function (data) {
      // @ts-ignore
      data.controllers = controllers;
      data.aurelia = aurelia;
    });

    if (hot.data?.aurelia) {
      const newDefinition = $$CE.getDefinition(currentClassType);
      $$M.define(newDefinition, currentClassType, newDefinition.name);
      $$M.define(newDefinition, newDefinition, newDefinition.name);
      hot.data.aurelia.container.res[$$CE.keyFrom(newDefinition.name)] = newDefinition;

      const previousControllers = hot.data.controllers ?? [];
      if(previousControllers.length === 0) {
        // @ts-ignore
        hot.invalidate?.();
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
          // if there's some bindings that target the existing property
          // @ts-ignore
          const isTargettedByBinding = controller.bindings?.some(y =>
            y.ast?.$kind === 'AccessScope'
              && y.ast.name === key && y.targetProperty
          );
          if (!isTargettedByBinding) {
            delete values[key];
          }
        });
        const h = controller.host;
        delete controller._compiledDef;
        controller.viewModel = controller.container.invoke(currentClassType);
        controller.definition = newDefinition;
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
};

// Provide CommonJS compatibility for direct require() usage without .default
// This allows both `import plugin from '@aurelia/webpack-plugin'` (ESM)
// and `const plugin = require('@aurelia/webpack-plugin')` (CommonJS) to work
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = auOrLoader;
  // @ts-ignore
  module.exports.default = auOrLoader;
  // @ts-ignore
  module.exports.plugin = plugin;
  // @ts-ignore
  module.exports.loader = loader;
}
