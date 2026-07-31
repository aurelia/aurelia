import { bindable } from 'aurelia';

declare global {
  interface Window {
    vite8DecoratorInstances?: number;
    vite8ModuleEvaluations?: number;
  }
}

window.vite8ModuleEvaluations = (window.vite8ModuleEvaluations ?? 0) + 1;

function revision(value: string) {
  return function (
    _target: undefined,
    _context: ClassFieldDecoratorContext<object, string>,
  ): (initialValue: string) => string {
    return function (_initialValue: string): string {
      const instance = (window.vite8DecoratorInstances ?? 0) + 1;
      window.vite8DecoratorInstances = instance;
      return `${value}:${instance}`;
    };
  };
}

class CardBase {}

export class DecoratedCard extends CardBase {
  // This intentionally has no initializer or constructor. It covers the derived
  // assignment-style path where decorators must be lowered before Vite handles
  // class fields, so generated initialization remains after super().
  @bindable public value!: string;

  @revision('decorator-v1')
  public decoratorRevision = '';
}
