/* eslint-disable import/no-extraneous-dependencies */
import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { getOptions } from 'loader-utils';
// @ts-ignore
import webpack from 'webpack';

export default function (
  // @ts-ignore TODO: fix types
  this: webpack.loader.LoaderContext,
  contents: string,
  sourceMap?: object, // ignore existing source map for now
) {
  return loader.call(this, contents);
}

export function loader(
  // @ts-ignore TODO: fix types
  this: webpack.loader.LoaderContext,
  contents: string,
  _preprocess = preprocess // for testing
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/strict-boolean-expressions
  this.cacheable && this.cacheable();
  // @ts-ignore TODO: fix types
  const cb = this.async() as webpack.loader.loaderCallback;
  const options = getOptions(this) as IOptionalPreprocessOptions;

  const filePath = this.resourcePath;

  try {
    const result = _preprocess(
      { path: filePath, contents },
      preprocessOptions({
        ...options,
        getHmrCode
      })
    );
    // webpack uses source-map 0.6.1 typings for RawSourceMap which
    // contains typing error version: string (should be number).
    // use result.map as any to bypass the typing issue.
    if (result) {
      cb(null, result.code, result.map as any);
      return;
    }

    // bypassed
    cb(null, contents);
  } catch (e) {
    cb(e);
  }
}

/**
 * This gets the generated HMR code for the specified class
 *
 * @param className - The name of the class to generate HMR code for
 * @param moduleText -  Usually module but Vite uses import instead
 * @returns Generated HMR code
 */
const getHmrCode = (className: string): string => {

  const code = `
    import { Metadata as $$M } from '@aurelia/metadata';
    import { ExpressionKind as $$EK } from '@aurelia/runtime';
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
    hot.dispose(function (data) {
      // @ts-ignore
      data.controllers = controllers;
      data.aurelia = aurelia;
    });

    if (hot.data?.aurelia) {
      const newDefinition = $$CE.getDefinition(currentClassType);
      $$M.define(newDefinition.name, newDefinition, currentClassType);
      $$M.define(newDefinition.name, newDefinition, newDefinition);
      hot.data.aurelia.container.res[$$CE.keyFrom(newDefinition.name)] = newDefinition;

      const previousControllers = hot.data.controllers;
      if(previousControllers == null || previousControllers.length === 0) {
        // @ts-ignore
        hot.invalidate();
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
            y.ast?.$kind === $$EK.AccessScope
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
        controller.hostController = null;
        controller.deactivate(controller, controller.parent ?? null, 0);
        controller.activate(controller, controller.parent ?? null, 0);
      });
    }
  }`;

  return code;
};
