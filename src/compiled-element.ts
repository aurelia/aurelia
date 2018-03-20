import { Template } from "./framework/templating/template";
import { IBinding } from "./framework/binding/binding";
import { View } from "./framework/templating/view";
import { Scope } from "./framework/binding/binding-interfaces";
import { createOverrideContext } from "./framework/binding/scope";
import { oneWayText, twoWay, listener } from "./framework/generated";

export interface CompiledElementConfiguration {
  name: string;
  template: Template;
  instructions: any[];
}

function applyInstruction(component, instruction, target) {
  switch(instruction.type) {
    case 'oneWayText':
      component.$bindings.push(oneWayText(instruction.source, target));
      break;
    case 'twoWay':
      component.$bindings.push(twoWay(instruction.source, target, instruction.target));
      break;
    case 'listener':
      component.$bindings.push(listener(instruction.source, target, instruction.target));
      break;
  }
}

export function compiledElement(config: CompiledElementConfiguration) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {
      private $bindings: IBinding[] = [];
      private $isBound = false;

      private $view: View;
      private $anchor: Element;
      
      private $scope: Scope = {
        bindingContext: this,
        overrideContext: createOverrideContext()
      };

      applyTo(anchor: Element) { 
        this.$anchor = anchor;
        this.$view = config.template.create();

        let targets = this.$view.targets;
        let targetInstructions = config.instructions;

        for (let i = 0, ii = targets.length; i < ii; ++i) {
          let instructions = targetInstructions[i];
          let target = targets[i];

          for (let j = 0, jj = instructions.length; j < jj; ++j) {
            let instruction = instructions[j];
            applyInstruction(this, instruction, target);
          }
        }

        return this;
      }

      bind() {
        let scope = this.$scope;
        let bindings = this.$bindings;

        for (let i = 0, ii = bindings.length; i < ii; ++i) {
          bindings[i].bind(scope);
        }

        //execute change callbacks

        this.$isBound = true;

        //this.bound(); //if developer implemented this callback
      }

      attach() {
        //this.attaching(); //if developer implemented this callback
        //attach children
        this.$view.appendTo(this.$anchor); //attach children before the parent
        //TaskQueue.instance.queueMicroTask(() => this.attached()); //queue callback if developer implemented it
      }

      detach() {
        //this.detaching(); //if developer implemented this callback
        this.$view.remove(); //remove parent before detaching children
        //detach children
        //TaskQueue.instance.queueMicroTask(() => this.detached()); //queue callback if developer implemented it
      }

      unbind() {
        let bindings = this.$bindings;
        let i = bindings.length;

        while (i--) {
          bindings[i].unbind();
        }
      }
    }
  }
}
