

/**
 * This is the minimum required runtime modules for HMR
 */
export const hmrRuntimeModules = ['ICustomElementViewModel', 'CustomElement', 'LifecycleFlags', 'IHydrationContext', 'Controller'];

/**
 * This is the minimum required metadata modules for HMR
 */
export const hmrMetadataModules = ['Metadata'];

/**
 * This gets the generated HMR code for the specified class
 * @param className The name of the class to generate HMR code for
 * @param moduleText  Usually module but Vite uses import instead
 * @param type CustomElement | CustomAttribute
 * @returns Generated HMR code
 */
export const getHmrCode = (className: string, moduleText: string = 'module', type: 'CustomElement' | 'CustomAttribute' = 'CustomElement'): string => {

  return `
if ((${moduleText} as any).hot) {
  const hot = (${moduleText} as any).hot;
  let aurelia = hot.data?.aurelia;
  document.addEventListener('au-started', (event) => {aurelia= (event as any).detail; });
  const controllers: Controller<ICustomElementViewModel>[] = [];
  const ogCreated = (${className}.prototype as any).created;

  (${className}.prototype as any).created = (controller) => {
    ogCreated && ogCreated(controller);
    controllers.push(controller as Controller<ICustomElementViewModel>);
  }

  hot.accept();
  hot.dispose(function (data) {
    data.controllers = controllers;
    data.aurelia = aurelia;
  });

  if (hot.data?.aurelia) {

    const newDefinition = CustomElement.getDefinition(${className});
    Metadata.define(newDefinition.name, newDefinition, ${className});
    Metadata.define(newDefinition.name, newDefinition, newDefinition);
    (hot.data.aurelia.container as any).res[CustomElement.keyFrom(newDefinition.name)] = newDefinition;


    (hot.data.controllers as typeof controllers).forEach(controller => {
      const values = { ...controller.viewModel };
      const hydrationContext = controller.container.get(IHydrationContext)
      const hydrationInst = hydrationContext.instruction;

      Object.keys(values).forEach(key => {
        if (!controller.bindings?.some(y => (y as any).sourceExpression?.name === key && (y as any).targetProperty)) {
          delete values[key];
        }
      });
      const h = (controller as any).host;
      delete (controller as any)._compiledDef;
      (controller.viewModel as any) = new ${className}();
      (controller.definition as any) = newDefinition;
      Object.assign(controller.viewModel, values);
      (controller.hooks as any) = new (controller.hooks as any).constructor(controller.viewModel);
      (controller as any)._hydrateCustomElement(hydrationInst, hydrationContext);
      h.parentNode.replaceChild((controller as any).host, h);
      (controller as any).hostController = null;
      (controller as any).deactivate(controller, controller.parent ?? null, LifecycleFlags.none);
      (controller as any).activate(controller, controller.parent ?? null, LifecycleFlags.none);
    });
  }
}`


}
