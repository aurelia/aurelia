# Controllers and Template Compilation

## Controller Program Flow

1. When `Aurelia#app({ host: document.querySelector('app'), component: new App() })` is called, it creates a new `CompositionRoot`.
    * **1.1.** The `CompositionRoot` instantiates a controller for the 'App' (view-model) instance.
      * **1.1.1.** In the process of instantiation of the `Controller#ctor` calls the rendering engine (already registered to DI), to get the element template.
        * **1.1.1.1.** `RenderingEngine` checks if the template is already built. If not then it builds the template from the template source (HTML markup string).
          * **1.1.1.1.1.** In the process of creating the template, the `RenderingEngine` first creates a rendering context, consisting the `DOM` object, parent context (parent DI Container?), required dependencies, and the type of the view model (constructor function).
          * **1.1.1.1.2.** Next the rendering engines looks for template compiler name in the provided template definition. If there is none, it falls back to the default template compiler, `TemplateCompiler`. Rendering engine gets hold of the compilers by ctor injection.
          * **1.1.1.1.3.** It then uses the compiler to `compile` the template.
          * **1.1.1.1.4.** The compiled template is then registered to the Template Factory with the rendering context.
        * **1.1.1.2.** `RenderingEngine` returns the compiled template (consist of template definition and render context) to the `Controller`.
      * **1.1.2.** `Controller` invokes the `render` method of the compiled template to render which in turn calls `Renderer#render` via `render` in rendering context.
        * **1.1.2.1.** `Renderer` is injected with all the registered `InstructionRenderer`s, which are mapped (looked up) using the instruction type. There are also rendering instructions in compiled template. `Renderer` looks up matching instruction for every instruction in compiled template, and calls `render` method on the instruction.
        * **1.1.2.2.** The `render` method instantiates a specific binding object for the instruction and add that to the collection of bindings in controller (or in other words renderable).
      * **1.1.3.** This logically (ignoring some other stuffs, need to revisit later) concludes the instantiation of the controller.
    * **1.2.** The instantiated controller is then added to a static (weak) map in `Controller` keyed by the view-model.
    * **1.3.** The instantiated controller is also assigned to the `CompositionRoot`'s controller.
2. The composition root is assigned to `Aurelia#root`.
3. When `Aurelia#start` is invoked, it calls the `root.activate()`, which in turn calls `activate` in activator (this seems like a very shallow class that triggers the lifecycle events, such as `bind`, `attach` etc.).
    * **3.1.** The `activate` gets the associated controller instance from Controller's static map of controllers and calls `bind` on the controller.
    * **3.2.** The `bind` checks the view-model type; whether it is a custom element, custom attr., or synthetic (? revisit later), and calls appropriate bind method.
    * **3.3.** Eventually that calls the `$bind` method on every bindings in the controller. The `$bind` is responsible to update the targets as per binding information. For example, `ElementPropertyAccessor` is used to manipulate different properties of the element/node, such as `textContent` for interpolation expression. And those changes are enqueued using `requestAnimationFrame` (RAF).
    * **3.4.** Any change in the source expression can be further observed using the `@connectable` decorator and `handleChange` change handler.

## Template Compilation

* `TemplateCompiler` instantiates a `TemplateBinder` with attribute and syntax parser.
* It then uses `HTMLTemplateElementFactory` to create a template from the HTML markup string which is a template element.
* In the next step it uses the instance of `TemplateBinder` to bind the template.
* If there are attributes in the node, `TemplateBinder` uses `AttributeParser` to parse the attributes which in turn uses `SyntaxInterpreter` to get instruction for every attribute. I am *not much clear about the processing done in `SyntaxInterpreter#interpret`, especially what `CharSpec` or `State` do*. Fred: `SyntaxInterpreter` holds a list of all registered `@attributePattern` implementations which works a bit like a route recognizer. So it feeds in the attribute name, and receives the parsed `AttrSyntax`. `TemplateBinder` wraps the `AttrSyntax` into either a `PlainAttributeSymbol` (if there is no binding command found) or BindingSymbol if there is a binding command
* `TemplateBinder` also loops through node tree to process every descendants.
