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
      proto.created = (controller) => {
        // @ts-ignore
        ogCreated && ogCreated(controller);
        controllers.push(controller);
      }
    }

    hot.dispose(function (data) {
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
        hot.invalidate();
      }

      previousControllers.forEach(controller => {
        const values = { ...controller.viewModel };
        const hydrationContext = controller.container.get(IHydrationContext)
        const hydrationInst = hydrationContext.instruction;

        Object.keys(values).forEach(key => {
          if (!controller.bindings?.some(y => y.sourceExpression?.name === key && y.targetProperty)) {
            delete values[key];
          }
        });
        const h = controller.host;
        delete controller._compiledDef;
        controller.viewModel = controller.invoke(currentClassType);
        controller.definition = newDefinition;
        Object.assign(controller.viewModel, values);
        controller.hooks = new controller.hooks.constructor(controller.viewModel);
        controller._hydrateCustomElement(hydrationInst, hydrationContext);
        h.parentNode.replaceChild(controller.host, h);
        controller.hostController = null;
        controller.deactivate(controller, controller.parent ?? null, LifecycleFlags.none);
        controller.activate(controller, controller.parent ?? null, LifecycleFlags.none);
      });
    }
  }`;

  return code;
};
