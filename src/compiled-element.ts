import { Template } from "./framework/templating/template";
import { IBinding } from "./framework/binding/binding";
import { View } from "./framework/templating/view";
import { Scope } from "./framework/binding/binding-interfaces";
import { createOverrideContext } from "./framework/binding/scope";
import { oneWayText, twoWay } from "./framework/generated";

export interface CompiledElementConfiguration {
  name: string;
  template: Template;
}

export function compiledElement(config: CompiledElementConfiguration) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {
      $b1: IBinding;
      $b2: IBinding;

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

        this.$b1 = oneWayText('message', targets[0]);
        this.$b2 = twoWay('message', targets[1], 'value');

        return this;
      }

      bind() {
        let scope = this.$scope;

        this.$b1.bind(scope);
        this.$b2.bind(scope);

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
        this.$b2.unbind();
        this.$b1.unbind();
      }
    }
  }
}
