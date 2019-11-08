import { IContainer, IRegistry } from '@aurelia/kernel';
import { bindable, customAttribute, INode } from '@aurelia/runtime';
import { getClassesToAdd } from '../observation/class-attribute-accessor';

export class CSSModulesProcessorRegistry implements IRegistry {
  public register(container: IContainer, ...params: (Record<string, string>)[]) {
    const classLookup = Object.assign({}, ...params) as Record<string, string>;

    @customAttribute('class')
    class ClassCustomAttribute {
      @bindable public value!: string;

      private element: HTMLElement;

      public constructor(
        @INode element: INode,
      ) {
        this.element = element as HTMLElement;
      }

      public binding() {
        this.valueChanged();
      }

      public valueChanged() {
        if (!this.value) {
          this.element.className = '';
          return;
        }

        this.element.className = getClassesToAdd(this.value)
          .map(x => classLookup[x] || x)
          .join(' ');
      }
    }

    container.register(ClassCustomAttribute);
  }
}
