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
 * Webpack plugin entry. Designed so that both ESM `import` and CJS `require` obtain
 * the function directly without accessing a `.default` property – the same pattern
 * we already use for our Vite plugin. The returned instance wires its own loader
 * (defined further below in this file) into Webpack's `beforeLoaders` hook so that
 * existing "loader" behaviour continues to work transparently for template, TS and
 * JS resources.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export default function auOrLoader(this: any, arg?: any, ...rest: any[]): any {
  // Called as a loader → first argument is the file source (string or Buffer).
  if (typeof arg === "string" || Buffer.isBuffer(arg)) {
    // The loader signature is (source: string, inputSourceMap?: RawSourceMap | undefined)
    // Our loader fn has a 2nd arg for testing, so we only pass the source.
    return (loader as any).apply(this, [arg]);
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
): webpack.WebpackPluginInstance {
  const processed = preprocessOptions(options);
  // Determine the absolute path of *this* file so we can reference our built-in loader.
  const loaderPath =
    typeof __filename === "string"
      ? __filename
      : fileURLToPath(import.meta.url);

  return {
    apply(compiler: webpack.Compiler) {
      const wp: typeof import("webpack") =
        (compiler as any).webpack ?? require("webpack");
      compiler.hooks.compilation.tap(
        "AureliaWebpackPlugin",
        (compilation: unknown) => {
          // Ensure we always operate on the *same* webpack instance that produced the compiler.
          // Some consuming applications may have multiple copies of webpack in node_modules,
          // which can lead to `instanceof` checks failing (see #webpac­k-dup-instance issue).
          // eslint-disable-next-line import/no-nodejs-modules, @typescript-eslint/no-var-requires
          const { createRequire } = require("module");
          const requireFn = createRequire(import.meta.url);
          const wp: any = (compiler as any).webpack ?? requireFn("webpack");
          const NormalModule: any = wp.NormalModule;

          // Typings for webpack v4/v5 differ; use generics suppressed for maximum compatibility.
          (NormalModule as any)
            .getCompilationHooks(compilation as any)
            .beforeLoaders.tap(
              "AureliaWebpackPlugin",
              (loaders: any, module: any) => {
                const resource = module.resource;
                if (!resource) return;

                const ext = extname(resource);
                // The plugin is auto-injected for .js and .ts files.
                // HTML templates require an explicit rule in webpack.config.js.
                if (ext !== ".js" && ext !== ".ts") {
                  return;
                }

                loaders.push({
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
 * ( HMR code injection, etc.) and hands the result back
 * to Webpack.
 */
export function loader(
  // Using `any` here to remain compatible across webpack v4 and v5 typings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: any,
  contents: string,
  _preprocess = preprocess
) {
  // Let Webpack know the result is cacheable for better build performance.
  this.cacheable?.();

  const cb = this.async();
  const options = this.getOptions() as IOptionalPreprocessOptions;
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
      cb(null, result.code, result.map as any);
      return;
    }

    cb(null, contents);
  } catch (e) {
    cb(e as Error);
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
