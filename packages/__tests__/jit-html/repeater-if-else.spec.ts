import {
  Aurelia,
  BindingStrategy,
  CustomElementResource,
  ILifecycle,
  LifecycleFlags
} from '@aurelia/runtime';
import { expect } from 'chai';
import { eachCartesianJoin, TestContext, TestConfiguration, trimFull } from '@aurelia/testing';

const spec = 'repeater-if-else';

describe(spec, function () {

  type Comp = { items: any[]; display: boolean; };
  interface Spec {
    t: string;
  }
  interface StrategySpec extends Spec {
    strategy: BindingStrategy;
  }
  interface BehaviorsSpec extends Spec {
    behaviors: string;
  }
  interface CETemplateSpec extends Spec {
    createCETemplate(behaviors: string): string;
  }
  interface ItemsSpec extends Spec {
    ifText: string;
    elseText: string;
    createItems(): any[];
  }
  interface AppTemplateSpec extends Spec {
    createAppTemplate(behaviors: string): string;
  }
  interface CountSpec extends Spec {
    count: number;
  }
  interface MutationSpec extends Spec {
    execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void;
  }
  const strategySpecs: StrategySpec[] = [
    {
      t: '01',
      strategy: BindingStrategy.getterSetter
    },
    {
      t: '02',
      strategy: BindingStrategy.proxies
    },
  ];

  const behaviorsSpecs: BehaviorsSpec[] = [
    {
      t: '01',
      behaviors: ''
    },
    {
      t: '02',
      behaviors: '& keyed'
    }
  ];

  const ceTemplateSpecs: CETemplateSpec[] = [
    {
      t: '101',
      createCETemplate(behaviors: string): string {
        return  `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '102',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              <div if.bind="true">
                \${item.if}
              </div>
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '103',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              <div if.bind="false">
                do_not_show
              </div>
              <div else>
                \${item.if}
              </div>
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '104',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div if.bind="true" repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '105',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div if.bind="false">do_not_show</div>
          <div else repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '106',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display" repeat.for="i of 1 ${behaviors}">
              \${item.if}
            </div>
            <div else repeat.for="i of 1 ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '107',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div if.bind="true" repeat.for="item of items ${behaviors}">
            <div if.bind="display" repeat.for="i of 1 ${behaviors}">
              \${item.if}
            </div>
            <div else repeat.for="i of 1 ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '108',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="a of 1 ${behaviors}">
            <div repeat.for="item of items ${behaviors}">
              <div if.bind="display">
                \${item.if}
              </div>
              <div else>
                \${item.else}
              </div>
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '109',
      createCETemplate(behaviors: string): string {
        return `<template>
          <template repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </template>
        </template>`;
      }
    },
    {
      t: '110',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}">
            <template if.bind="display">
              \${item.if}
            </template>
            <template else>
              \${item.else}
            </template>
          </div>
        </template>`;
      }
    },
    {
      t: '111',
      createCETemplate(behaviors: string): string {
        return `<template>
          <template repeat.for="item of items ${behaviors}">
            <template if.bind="display">
              \${item.if}
            </template>
            <template else>
              \${item.else}
            </template>
          </template>
        </template>`;
      }
    },
    {
      t: '112',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div if.bind="display" repeat.for="item of items ${behaviors}">
            \${item.if}
          </div>
          <div else repeat.for="item of items ${behaviors}">
            \${item.else}
          </div>
        </template>`;
      }
    },
    {
      t: '113',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div if.bind="display">
            <div repeat.for="item of items ${behaviors}">
              \${item.if}
            </div>
          </div>
          <div else>
            <div repeat.for="item of items ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '114',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}" with.bind="item">
            <div if.bind="display">
              \${if}
            </div>
            <div else>
              \${else}
            </div>
          </div>
        </template>`;
      }
    },
    {
      t: '115',
      createCETemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div with.bind="item">
              <div if.bind="display">
                \${if}
              </div>
              <div else>
                \${else}
              </div>
            </div>
          </div>
        </template>`;
      }
    }
  ];

  const appTemplateSpecs: AppTemplateSpec[] = [
    {
      t: '01',
      createAppTemplate(behaviors: string): string {
        return `<template>
          <foo repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
      }
    },
    {
      t: '02',
      createAppTemplate(behaviors: string): string {
        return `<template>
          <foo repeat.for="i of count ${behaviors}" if.bind="true" items.bind="items" display.bind="display">
          </foo>
        </template>`;
      }
    },
    {
      t: '03',
      createAppTemplate(behaviors: string): string {
        return `<template>
          <div repeat.for="i of count ${behaviors}">
            <div if.bind="false">
              do_not_show
            </div>
            <foo else items.bind="items" display.bind="display">
            </foo>
          </div>
        </template>`;
      }
    },
    {
      t: '04',
      createAppTemplate(behaviors: string): string {
        return `<template>
          <foo if.bind="true" repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
      }
    },
    {
      t: '05',
      createAppTemplate(behaviors: string): string {
        return `<template>
          <div if.bind="false">
            do_not_show
          </div>
          <foo else repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
      }
    }
  ];

  const itemsSpecs: ItemsSpec[] = [
    {
      t: '01',
      createItems() {
        return [{if: 1,   else: 2},   {if: 3,   else: 4}];
      },
      ifText: '13',
      elseText: '24'
    },
    {
      t: '02',
      createItems() {
        return [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}, {if: 'g', else: 'h'}];
      },
      ifText: 'aceg',
      elseText: 'bdfh'
    }
  ];

  const countSpecs: CountSpec[] = [
    {
      t: '01',
      count: 1
    },
    {
      t: '02',
      count: 3
    }
  ];

  const mutationSpecs: MutationSpec[] = [
    {
      t: '01',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(ifText.repeat(count));
      }
    },
    {
      t: '02',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);
        component.display = false;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(elseText.repeat(count));
      }
    },
    {
      t: '03',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items = [{if: 2, else: 1}, {if: 4, else: 3}];
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal('13'.repeat(count));
      }
    },
    {
      t: '04',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items[0].if = 5;
        component.items[0].else = 6;
        component.items[1].if = 7;
        component.items[1].else = 8;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal((`68${elseText.slice(2)}`).repeat(count));
      }
    },
    {
      t: '05',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.reverse();
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal((elseText.split('').reverse().join('')).repeat(count));
      }
    },
    {
      t: '06',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.reverse();
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal((ifText.split('').reverse().join('')).repeat(count));
      }
    },
    {
      t: '07',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items = [{if: 'a', else: 'b'}];
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal('b'.repeat(count));
      }
    },
    {
      t: '08',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items = [{if: 'a', else: 'b'}];
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal('a'.repeat(count));
      }
    },
    {
      t: '09',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.pop();
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(elseText.slice(0, -1).repeat(count));
      }
    },
    {
      t: '10',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.pop();
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(ifText.slice(0, -1).repeat(count));
      }
    },
    {
      t: '11',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items = component.items.slice().concat({if: 'x', else: 'y'});
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(`${elseText}y`.repeat(count));
      }
    },
    {
      t: '12',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal('ace'.repeat(count));
      }
    },
    {
      t: '13',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.push({if: 5, else: 6});
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(`${elseText}6`.repeat(count));
      }
    },
    {
      t: '14',
      execute(component: Comp, lifecycle: ILifecycle, host: Element, count: number, ifText: string, elseText: string): void {
        component.items.push({if: 5, else: 6});
        component.display = true;
        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(trimFull(host.textContent)).to.equal(`${ifText}5`.repeat(count));
      }
    }
  ];

  eachCartesianJoin(
    [strategySpecs, behaviorsSpecs, ceTemplateSpecs, appTemplateSpecs, itemsSpecs, countSpecs, mutationSpecs],
    (strategySpec, behaviorsSpec, ceTemplateSpec, appTemplateSpec, itemsSpec, countSpec, mutationSpec) => {

    it(`strategySpec ${strategySpec.t}, behaviorsSpec ${behaviorsSpec.t}, ceTemplateSpec ${ceTemplateSpec.t}, appTemplateSpec ${appTemplateSpec.t}, itemsSpec ${itemsSpec.t}, countSpec ${countSpec.t}, mutationSpec ${mutationSpec.t}`, function () {
      const { strategy } = strategySpec;
      const { behaviors } = behaviorsSpec;
      const { createCETemplate } = ceTemplateSpec;
      const { createAppTemplate } = appTemplateSpec;
      const { ifText, elseText, createItems } = itemsSpec;
      const { count } = countSpec;
      const { execute } = mutationSpec;

      const ctx = TestContext.createHTMLTestContext();
      const { container } = ctx;

      const initialItems = createItems();

      const Component = CustomElementResource.define(
        {
          name: 'app',
          template: createAppTemplate(behaviors),
          strategy,
          dependencies: [
            CustomElementResource.define(
              {
                name: 'foo',
                template: createCETemplate(behaviors),
                strategy
              },
              class Foo {
                public static bindables = ['items', 'display'];
                public items: any[];
                public display: boolean;
              }
            )
          ]
        },
        class App {
          public items: any[];
          public display: boolean;
          public count: number;
          public created() {
            this.items = initialItems;
            this.display = false;
            this.count = count;
          }
        }
      );

      const host = ctx.createElement('div');

      const au = new Aurelia(container)
        .register(TestConfiguration)
        .app({ host, component: Component, strategy })
        .start();
      const component = au.root();

      expect(trimFull(host.textContent)).to.equal(elseText.repeat(count));

      execute(component as any, ctx.lifecycle, host, count, ifText, elseText);

      au.stop();
      expect(trimFull(host.textContent)).to.equal('');
    });
  });

});
