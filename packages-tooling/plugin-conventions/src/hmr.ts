/**
 * This is the minimum required runtime modules for HMR
 */
export const hmrRuntimeModules = ['CustomElement', 'LifecycleFlags', 'IHydrationContext', 'Controller'];

/**
 * This is the minimum required metadata modules for HMR
 */
export const hmrMetadataModules = ['Metadata'];

/**
 * This gets the generated HMR code for the specified class
 *
 * @param className - The name of the class to generate HMR code for
 * @param moduleText -  Usually module but Vite uses import instead
 * @param type - CustomElement | CustomAttribute
 * @returns Generated HMR code
 */
export const getHmrCode = (className: string, moduleText: string = 'module'): string => {

  const code = `
    // @ts-ignore
    const controllers = [];

    // @ts-ignore
    if (${moduleText}.hot) {

    // @ts-ignore
    ${moduleText}.hot.accept();

    // @ts-ignore
    const hot = ${moduleText}.hot;

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
      const newDefinition = CustomElement.getDefinition(currentClassType);
      Metadata.define(newDefinition.name, newDefinition, currentClassType);
      Metadata.define(newDefinition.name, newDefinition, newDefinition);
      hot.data.aurelia.container.res[CustomElement.keyFrom(newDefinition.name)] = newDefinition;

      const previousControllers = hot.data.controllers;
      if(previousControllers == null || previousControllers.length === 0) {
        // @ts-ignore
        hot.invalidate();
      }

      // @ts-ignore
      previousControllers.forEach(controller => {
        const hydrationContext = controller.container.get(IHydrationContext)
        const hydrationInst = hydrationContext.instruction;

        const values = {};
        Object.keys(controller.definition.bindables).forEach(property => {
          values[property] = controller.viewModel[property];
        });

        const h = controller.host;
        delete controller._compiledDef;
        controller.viewModel = controller.container.invoke(currentClassType);
        controller.definition = newDefinition;
        Object.assign(controller.viewModel, values);
        controller.hooks = new controller.hooks.constructor(controller.viewModel);
        if (controller._hydrateCustomElement) {
          controller._hydrateCustomElement(hydrationInst, hydrationContext);
        } else {
          controller.hE(hydrationInst, hydrationContext);
        }
        h.parentNode.replaceChild(controller.host, h);
        controller.hostController = null;
        controller.deactivate(controller, controller.parent ?? null, LifecycleFlags.none);
        controller.activate(controller, controller.parent ?? null, LifecycleFlags.none);
      });
    }
  }`;

  return code;
};
