import { IContainer, DI, PLATFORM, Constructable } from '../../../kernel/src';
import { BasicConfiguration } from '../../src';
import {
  Aurelia, IChangeSet, CustomElementResource, valueConverter,
  customElement, bindable, SetterObserver, Binding,
  PropertyAccessor, ElementPropertyAccessor, Observer, IObserverLocator, SelectValueObserver
} from '../../../runtime/src';
import { expect } from 'chai';
import { spy } from 'sinon';
import { eachCartesianJoinFactory, h } from './util';


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

const TestConfiguration = {
  register(container: IContainer) {
    container.register(...globalResources);
  }
}

function createCustomElement<T = Record<string, any>>(
  markup: string | Element,
  klass: Constructable<T> = class {} as Constructable<T>,
  ...dependencies: Function[]
): T {
  return new (CustomElementResource.define({
    name: 'app',
    dependencies: [...dependencies],
    templateOrNode: markup,
    build: { required: true, compiler: 'default' },
    instructions: [],
    surrogates: []
  }, klass))();
}

describe('TemplateCompiler - <select/> Integration', () => {
  let container: IContainer;
  let observerLocator: IObserverLocator;
  let au: Aurelia;
  let host: HTMLElement;
  let cs: IChangeSet

  beforeEach(() => {
    container = DI.createContainer();
    observerLocator = container.get(IObserverLocator);
    cs = container.get(IChangeSet);
    container.register(TestConfiguration, BasicConfiguration)
    host = document.createElement('app');
    document.body.appendChild(host);
    au = new Aurelia(container);
  });

  afterEach(() => {
    au.stop();
    document.body.removeChild(host);
  });

  describe('<select/> - single', () => {

    it(`multiple toViewBinding <select/>`, () => {
      const component = createCustomElement(
        template(null,
          select(
            { id: 'select1', 'value.to-view': 'selectedValue' },
            ...[1, 2].map(v => option({ value: v }))
          ),
          select(
            { id: 'select2', 'value.to-view': 'selectedValue' },
            ...[1, 2].map(v => option({ value: v }))
          ),
          select(
            { id: 'select3', 'value.to-view': 'selectedValue' },
            ...[3, 4].map(v => option({ value: v }))
          )
        ),
        class App {
          selectedValue: string = '2';
        }
      );
      au.app({ host, component }).start();
      const select1 = document.querySelector('#select1') as HTMLSelectElement;
      const select2 = document.querySelector('#select2') as HTMLSelectElement;
      const select3 = document.querySelector('#select3') as HTMLSelectElement;
      // Inititally, <select/>s are not affected by view model values
      expect(select1.value).to.equal('1');
      expect(select2.value).to.equal('1');
      expect(select3.value).to.equal('3');
      cs.flushChanges();
      // after flush changes, view model value should propagate to <select/>s
      expect(select1.value).to.equal('2');
      expect(select2.value).to.equal('2');
      // vCurrent does not attempt to correct <select/> value
      // vNext shouldn't for compat
      expect(select3.value).to.equal('3');
      const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
      expect(observer3.currentValue).to.equal('2');
    });

    it(`works with mixed of multiple binding: twoWay + toView`, () => {
      const component = createCustomElement(
        template(null,
          select(
            { id: 'select1', 'value.to-view': 'selectedValue' },
            ...[1, 2].map(v => option({ value: v }))
          ),
          select(
            { id: 'select2', 'value.two-way': 'selectedValue' },
            ...[1, 2].map(v => option({ value: v }))
          ),
          select(
            { id: 'select3', 'value.to-view': 'selectedValue' },
            ...[3, 4].map(v => option({ value: v }))
          )
        ),
        class App {
          selectedValue: string = '2';
        }
      );
      au.app({ host, component }).start();
      const select1 = document.querySelector('#select1') as HTMLSelectElement;
      const select2 = document.querySelector('#select2') as HTMLSelectElement;
      const select3 = document.querySelector('#select3') as HTMLSelectElement;
      expect(component.selectedValue).to.equal('2');
      // Inititally, <select/>s are not affected by view model values
      expect(select1.value).to.equal('1');
      expect(select2.value).to.equal('1');
      expect(select3.value).to.equal('3');
      cs.flushChanges();
      expect(component.selectedValue).to.equal('2');

      // Verify observer 3 will take the view model value, regardless valid value from view model
      const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
      expect(observer3.currentValue).to.equal('2');

      // simulate change from under input
      select2.value = '1';
      select2.dispatchEvent(new CustomEvent('change', { bubbles: true }));

      expect(component.selectedValue).to.equal('1');
      const observer1 = observerLocator.getObserver(select1, 'value') as SelectValueObserver;
      expect(observer1.currentValue).to.equal('1');
      // verify observer 3 will take the view model value from changes, regardless valid value from view model
      expect(observer3.currentValue).to.equal('1');
    });
  });

  function template(attrs: Record<string, any> | null, ...children: Element[]) {
    return h('template', attrs, ...children);
  }

  function select(attrs: Record<string, any> | null, ...children: (HTMLOptionElement | HTMLOptGroupElement)[]) {
    return h('select', attrs, ...children);
  }

  function option(attrs: Record<string, any> | null) {
    return h('option', attrs);
  }
});
