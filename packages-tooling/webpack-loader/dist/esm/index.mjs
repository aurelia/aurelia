import { preprocessOptions, preprocess } from '@aurelia/plugin-conventions';
import { getOptions } from 'loader-utils';

function index (contents, sourceMap) {
    return loader.call(this, contents);
}
function loader(contents, _preprocess = preprocess) {
    var _a;
    (_a = this.cacheable) === null || _a === void 0 ? void 0 : _a.call(this);
    const cb = this.async();
    const options = getOptions(this);
    const filePath = this.resourcePath;
    try {
        const result = _preprocess({ path: filePath, contents }, preprocessOptions({
            ...options,
            getHmrCode
        }));
        if (result) {
            cb(null, result.code, result.map);
            return;
        }
        cb(null, contents);
    }
    catch (e) {
        cb(e);
    }
}
const getHmrCode = (className) => {
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
          // if there' some bindings that target the existing property
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

export { index as default, loader };
//# sourceMappingURL=index.mjs.map
