import { IContainer, IRegistry } from '@aurelia/kernel';
import { bindable, customAttribute, INode } from '@aurelia/runtime';

export class CSSModulesProcessorRegistry implements IRegistry {
  public register(container: IContainer, ...params: (Record<string, string>)[]) {
    const classLookup = Object.assign({}, ...params) as Record<string, string>;

    @customAttribute('class')
    class ClassCustomAttribute {
      @bindable public value!: string;

      public constructor(@INode private element: HTMLElement) {}

      public binding() {
        this.valueChanged();
      }

      public valueChanged() {
        if (!this.value) {
          this.element.className = '';
          return;
        }

        this.element.className = this.value.split(' ')
          .map(x => classLookup[x] || x)
          .join(' ');
      }
    }

    container.register(ClassCustomAttribute);
  }
}
