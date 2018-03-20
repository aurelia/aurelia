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

function applyInstruction(instance, instruction, target) {
  switch(instruction.type) {
    case 'oneWayText':
      instance.$bindable.push(oneWayText(instruction.source, target));
      break;
    case 'oneWay':
      instance.$bindable.push(oneWay(instruction.source, target, instruction.target));
      break;
    case 'twoWay':
      instance.$bindable.push(twoWay(instruction.source, target, instruction.target));
      break;
    case 'listener':
      instance.$bindable.push(listener(instruction.source, target, instruction.target));
      break;
    case 'ref':
      instance.$bindable.push(ref(instruction.source, target));
      break;
    case 'style':
      instance.$bindable.push(oneWay(instruction.source, (target as HTMLElement).style, instruction.target))
      break;
    case 'element':
      let elementInstructions = instruction.instructions;
      let viewModel: IComponent = new instruction.ctor(); //TODO: DI
      viewModel.applyTo(target);

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : viewModel;
        applyInstruction(instance, current, realTarget);
      }

      instance.$bindable.push(viewModel);
      instance.$attachable.push(viewModel);

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

export function compiledElement(config: CompiledElementConfiguration) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    let template = new Template(config.template);
    
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
      }
    }
  }
}
