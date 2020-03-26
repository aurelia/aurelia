import { IContainer, IRegistry } from '@aurelia/kernel';
import { bindable, customAttribute, INode } from '@aurelia/runtime';
import { getClassesToAdd } from '../observation/class-attribute-accessor';

export function cssModules(...cssModules: (Record<string, string>)[]) {
  return new CSSModulesProcessorRegistry(cssModules);
}

export class CSSModulesProcessorRegistry implements IRegistry {
  public constructor(
    private readonly cssModules: Record<string, string>[],
  ) {}

  public register(container: IContainer) {
    const classLookup = Object.assign({}, ...this.cssModules) as Record<string, string>;

    @customAttribute('class')
    class ClassCustomAttribute {
      @bindable public value!: string;

      private element: HTMLElement;

      public constructor(@INode element: INode /* TODO(fkleuver): fix this type annotation reflection issue in AOT */) {
        this.element = element as HTMLElement;
      }

      public beforeBind() {
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
