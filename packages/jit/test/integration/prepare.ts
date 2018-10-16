
import { BasicConfiguration } from "../../src";
import { expect } from "chai";
import { valueConverter, customElement, bindable, CustomElementResource, IChangeSet, IObserverLocator, Aurelia } from "@aurelia/runtime";
import { IContainer, DI, Constructable, PLATFORM } from "@aurelia/kernel";

export function cleanup(): void {
  const body = document.body;
  let current = body.firstElementChild;
  while (current !== null) {
    const next = current.nextElementSibling;
    if (current.tagName === 'APP') {
      body.removeChild(current);
    }
    current = next;
  }
}

@valueConverter('sort')
export class SortValueConverter {
  public toView(arr: any[], prop?: string, dir: 'asc' | 'desc' = 'asc'): any[] {
    if (Array.isArray(arr)) {
      const factor = dir === 'asc' ? 1 : -1;
      if (prop && prop.length) {
        arr.sort((a, b) => a[prop] - b[prop] * factor);
      } else {
        arr.sort((a, b) => a - b * factor);
      }
    }
    return arr;
  }
}

@valueConverter('json')
export class JsonValueConverter {
  public toView(input: any): string {
    return JSON.stringify(input);
  }
  public fromView(input: string): any {
    return JSON.parse(input);
  }
}


@customElement({
  name: 'name-tag',
  templateOrNode: '<template>${name}</template>',
  build: { required: true, compiler: 'default' },
  dependencies: [],
  instructions: [],
  surrogates: []
})
class NameTag {

  @bindable()
  name: string;
}

const globalResources: any[] = [
  SortValueConverter,
  JsonValueConverter,
  NameTag
];

export const TestConfiguration = {
  register(container: IContainer) {
    container.register(...globalResources);
  }
}

const buildRequired = { required: true, compiler: 'default' };

export function defineCustomElement<T>(name: string, markupOrNode: string | Node, $class: Constructable<T>, dependencies: ReadonlyArray<any> = PLATFORM.emptyArray) {
  return CustomElementResource.define({
    name,
    templateOrNode: markupOrNode,
    build: buildRequired,
    dependencies: <any>dependencies,
    instructions: []
  }, $class);
}

export function createCustomElement(markup: string | Element, $class: Constructable | null, ...dependencies: Function[]): { [key: string]: any } {
  return new (CustomElementResource.define({
    name: 'app',
    dependencies: [...dependencies],
    templateOrNode: markup,
    build: { required: true, compiler: 'default' },
    instructions: [],
    surrogates: []
  }, $class === null ? class App { } : $class))();
}

export function stringify(o) {
  let cache = [];
  const result = JSON.stringify(o, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof Node) {
        return value['innerHTML']
      }
      if (cache.indexOf(value) !== -1) {
        try {
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          return;
        }
      }
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return result;
}

export function setupAndStart(template: string, $class: Constructable | null, ...registrations: any[]) {
  const container = DI.createContainer();
  container.register(...registrations);
  const cs = container.get<IChangeSet>(IChangeSet);
  const observerLocator = container.get<IObserverLocator>(IObserverLocator);
  container.register(TestConfiguration, BasicConfiguration)
  const host = document.createElement('app');
  document.body.appendChild(host);
  const au = new Aurelia(container);
  const component = createCustomElement(template, $class);
  au.app({ host, component }).start();
  return { container, cs, host, au, component, observerLocator };
}

export function setup(template: string, $class: Constructable | null, ...registrations: any[]) {
  const container = DI.createContainer();
  container.register(...registrations);
  const cs = container.get<IChangeSet>(IChangeSet);
  const observerLocator = container.get<IObserverLocator>(IObserverLocator);
  container.register(TestConfiguration, BasicConfiguration)
  const host = document.createElement('app');
  document.body.appendChild(host);
  const au = new Aurelia(container);
  const component = createCustomElement(template, $class);
  return { container, cs, host, au, component, observerLocator };
}

export function tearDown(au: Aurelia, cs: IChangeSet, host: HTMLElement) {
  au.stop();
  expect(cs.size).to.equal(0);
  document.body.removeChild(host);
}
