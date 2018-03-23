import { Template } from "./framework/templating/template";
import { IBinding } from "./framework/binding/binding";
import { View } from "./framework/templating/view";
import { Scope } from "./framework/binding/binding-interfaces";
import { createOverrideContext } from "./framework/binding/scope";
import { oneWayText, twoWay, listener, oneWay, ref, makeElementIntoAnchor, fromView, call } from "./framework/generated";
import { Observer } from "./framework/binding/property-observation";
import { TaskQueue } from "./framework/task-queue";
import { IComponent, IAttach } from "./framework/templating/component";
import { ViewSlot } from "./framework/templating/view-slot";
import { IVisual } from "./framework/templating/visual";

export interface CompiledElementConfiguration {
  name: string;
  template: string;
  observers: any[];
  targetInstructions: any[];
  surrogateInstructions: any[];
}

function applyInstruction(instance, instruction, target) {
  switch(instruction.type) {
    case 'oneWayText':
      instance.$bindable.push(oneWayText(instruction.source, target));
      break;
    case 'oneWay':
      instance.$bindable.push(oneWay(instruction.source, target, instruction.target));
      break;
    case 'fromView':
      instance.$bindable.push(fromView(instruction.source, target, instruction.target));
      break;
    case 'twoWay':
      instance.$bindable.push(twoWay(instruction.source, target, instruction.target));
      break;
    case 'listener':
      instance.$bindable.push(listener(instruction.source, target, instruction.target, instruction.preventDefault, instruction.strategy));
      break;
    case 'call':
      instance.$bindable.push(call(instruction.source, target, instruction.target));
      break;
    case 'ref':
      instance.$bindable.push(ref(instruction.source, target));
      break;
    case 'style':
      instance.$bindable.push(oneWay(instruction.source, (target as HTMLElement).style, instruction.target))
      break;
    case 'element':
      let elementInstructions = instruction.instructions;
      let elementModel: IComponent = new instruction.ctor(); //TODO: DI
      elementModel.applyTo(target);

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : elementModel;
        applyInstruction(instance, current, realTarget);
      }

      instance.$bindable.push(elementModel);
      instance.$attachable.push(elementModel);

      break;
    case 'attribute':
      let attributeInstructions = instruction.instructions;
      let attributeModel: IComponent = new instruction.ctor(target); //TODO: DI

      for (let i = 0, ii = attributeInstructions.length; i < ii; ++i) {
        applyInstruction(instance, attributeInstructions[i], attributeModel);
      }

      instance.$bindable.push(attributeModel);
      instance.$attachable.push(attributeModel);
      break;
    case 'templateController':
      let templateControllerInstructions = instruction.instructions;
      let factory = instruction.factory;

      if (factory === undefined) {
        instruction.factory = factory = createViewFactory(instruction.config);
      }  

      let templateControllerModel: IComponent = new instruction.ctor(
        factory, 
        new ViewSlot(makeElementIntoAnchor(target), false)
      ); //TODO: DI

      if (instruction.link) {
        (<any>templateControllerModel).link(instance.$attachable[instance.$attachable.length - 1]);
      }

      for (let i = 0, ii = templateControllerInstructions.length; i < ii; ++i) {
        applyInstruction(instance, templateControllerInstructions[i], templateControllerModel);
      }

      instance.$bindable.push(templateControllerModel);
      instance.$attachable.push(templateControllerModel);

      break;
  }
}

function setupObservers(instance, config) {
  let observerConfigs = config.observers;
  let observers = {};

  for (let i = 0, ii = observerConfigs.length; i < ii; ++i) {
    let observerConfig = observerConfigs[i];
    let name = observerConfig.name;

    if ('changeHandler' in observerConfig) {
      let changeHandler = observerConfig.changeHandler;
      observers[name] = new Observer(instance[name], v => instance.$isBound ? instance[changeHandler](v) : void 0);
      instance.$changeCallbacks.push(() => instance[changeHandler](instance[name]));
    } else {
      observers[name] = new Observer(instance[name]);
    }

    createGetterSetter(instance, name);
  }

  Object.defineProperty(instance, '$observers', {
    enumerable: false,
    value: observers
  });
}

function createGetterSetter(instance, name) {
  Object.defineProperty(instance, name, {
    enumerable: true,
    get: function() { return this.$observers[name].getValue(); },
    set: function(value) { this.$observers[name].setValue(value); }
  });
}

function createViewFactory(config): () => IVisual {
  let template = new Template(config.template);

  //TODO: Dynamically create the lifecycle methods based on what the view actually contains.
  class PlainView implements IVisual {
    private $bindable: IBinding[] = [];
    private $attachable: IAttach[] = [];
    
    $view: View;
    isBound = false;
  
    constructor() {
      this.$view = template.create();

      let targets = this.$view.targets;
      let targetInstructions = config.targetInstructions;

      for (let i = 0, ii = targets.length; i < ii; ++i) {
        let instructions = targetInstructions[i];
        let target = targets[i];

        for (let j = 0, jj = instructions.length; j < jj; ++j) {
          applyInstruction(this, instructions[j], target);
        }
      }
    }
  
    bind(scope: Scope) {
      let bindable = this.$bindable;

      for (let i = 0, ii = bindable.length; i < ii; ++i) {
        bindable[i].bind(scope);
      }

      this.isBound = true;
    }

    attach() {
      let attachable = this.$attachable;

      for (let i = 0, ii = attachable.length; i < ii; ++i) {
        attachable[i].attach();
      }
    }

    detach() { 
      let attachable = this.$attachable;
      let i = attachable.length;

      while (i--) {
        attachable[i].detach();
      }
    }
  
    unbind() {
      let bindable = this.$bindable;
      let i = bindable.length;

      while (i--) {
        bindable[i].unbind();
      }

      this.isBound = false;
    }
  }

  return function() { return new PlainView(); }
}

function createCustomElement<T extends {new(...args:any[]):{}}>(ctor: T, config: CompiledElementConfiguration) {
  let template = new Template(config.template);
    
  return class extends ctor {
    private $bindable: IBinding[] = [];
    private $attachable: IAttach[] = [];
    private $isBound = false;

    private $view: View;
    private $anchor: Element;

    private $changeCallbacks: (() => void)[] = [];
    
    private $scope: Scope = {
      bindingContext: this,
      overrideContext: createOverrideContext()
    };

    constructor(...args:any[]) {
      super(...args);
      setupObservers(this, config);
    }

    applyTo(anchor: Element) { 
      this.$anchor = anchor;
      this.$view = template.create();

      let targets = this.$view.targets;
      let targetInstructions = config.targetInstructions;

      for (let i = 0, ii = targets.length; i < ii; ++i) {
        let instructions = targetInstructions[i];
        let target = targets[i];

        for (let j = 0, jj = instructions.length; j < jj; ++j) {
          applyInstruction(this, instructions[j], target);
        }
      }

      let surrogateInstructions = config.surrogateInstructions;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        applyInstruction(this, surrogateInstructions[i], anchor);
      }

      if ('created' in this) {
        (<any>this).created();
      }

      return this;
    }

    bind() {
      let scope = this.$scope;
      let bindable = this.$bindable;

      for (let i = 0, ii = bindable.length; i < ii; ++i) {
        bindable[i].bind(scope);
      }

      this.$isBound = true;

      let changeCallbacks = this.$changeCallbacks;

      for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
        changeCallbacks[i]();
      }

      if ('bound' in this) {
        (<any>this).bound();
      }
    }

    attach() {
      if ('attaching' in this) {
        (<any>this).attaching();
      }

      let attachable = this.$attachable;

      for (let i = 0, ii = attachable.length; i < ii; ++i) {
        attachable[i].attach();
      }

      this.$view.appendTo(this.$anchor);
    
      if ('attached' in this) {
        TaskQueue.instance.queueMicroTask(() => (<any>this).attached());
      }
    }

    detach() {
      if ('detaching' in this) {
        (<any>this).detaching();
      }

      this.$view.remove();

      let attachable = this.$attachable;
      let i = attachable.length;

      while (i--) {
        attachable[i].detach();
      }

      if ('detached' in this) {
        TaskQueue.instance.queueMicroTask(() => (<any>this).detached());
      }
    }

    unbind() {
      let bindable = this.$bindable;
      let i = bindable.length;

      while (i--) {
        bindable[i].unbind();
      }

      if ('unbound' in this) {
        (<any>this).unbound();
      }

      this.$isBound = false;
    }
  }
}

export function compiledElement(config: CompiledElementConfiguration) {
  return function<T extends {new(...args:any[]):{}}>(target: T) {
    return createCustomElement(target, config);
  }
}
