import { Template } from "./framework/templating/template";
import { IBinding } from "./framework/binding/binding";
import { View } from "./framework/templating/view";
import { Scope } from "./framework/binding/binding-interfaces";
import { createOverrideContext } from "./framework/binding/scope";
import { oneWayText, twoWay, listener, oneWay, ref } from "./framework/generated";
import { Observer } from "./framework/binding/property-observation";
import { TaskQueue } from "./framework/task-queue";
import { IComponent, IAttach } from "./framework/templating/component";

export interface CompiledElementConfiguration {
  name: string;
  template: string;
  observers: any[];
  targetInstructions: any[];
  surrogateInstructions: any[];
}

function applyInstruction(component, instruction, target) {
  switch(instruction.type) {
    case 'oneWayText':
      component.$bindable.push(oneWayText(instruction.source, target));
      break;
    case 'oneWay':
      component.$bindable.push(oneWay(instruction.source, target, instruction.target));
      break;
    case 'twoWay':
      component.$bindable.push(twoWay(instruction.source, target, instruction.target));
      break;
    case 'listener':
      component.$bindable.push(listener(instruction.source, target, instruction.target));
      break;
    case 'ref':
      component.$bindable.push(ref(target, instruction.source)); //TODO: change sig to have source first
      break;
    case 'style':
      component.$bindable.push(oneWay(instruction.source, (target as HTMLElement).style, instruction.target))
      break;
    case 'element':
      let elementInstructions = instruction.instructions;
      let viewModel: IComponent = new instruction.ctor(); //TODO: DI
      viewModel.applyTo(target);

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : viewModel;
        applyInstruction(component, current, realTarget);
      }

      component.$bindable.push(viewModel);
      component.$attachable.push(viewModel);

      break;
  }
}

function setupObservers(component, config) {
  let observerConfigs = config.observers;
  let observers = {};

  for (let i = 0, ii = observerConfigs.length; i < ii; ++i) {
    let observerConfig = observerConfigs[i];
    let name = observerConfig.name;

    if ('changeHandler' in observerConfig) {
      let changeHandler = observerConfig.changeHandler;
      observers[name] = new Observer(component[name], v => component.$isBound ? component[changeHandler](v) : void 0);
      component.$changeCallbacks.push(() => component[changeHandler](component[name]));
    } else {
      observers[name] = new Observer(component[name]);
    }

    createGetterSetter(component, name);
  }

  Object.defineProperty(component, '$observers', {
    enumerable: false,
    value: observers
  });
}

function createGetterSetter(component, name) {
  Object.defineProperty(component, name, {
    enumerable: true,
    get: function() { return this.$observers[name].getValue(); },
    set: function(value) { this.$observers[name].setValue(value); }
  });
}

export function compiledElement(config: CompiledElementConfiguration) {
  let template = new Template(config.template);

  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {
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

        let changeCallbacks = this.$changeCallbacks;

        this.$isBound = true;

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
      }
    }
  }
}
