import { BindingMode, CustomElement, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.spec.ts', function () {
  it('works with multiple layers of change propagation & <input/>', async function () {
    const { ctx, appHost } = await createFixture(
      `<input value.bind="first_name | properCase">
      <form-input value.two-way="first_name | properCase"></form-input>`,
      class App {
        public message = 'Hello Aurelia 2!';
        public first_name = '';
      },
      [
        CustomElement.define({
          name: 'form-input',
          template: '<input value.bind="value">',
          bindables: {
            value: { mode: BindingMode.twoWay }
          }
        }, class FormInput { }),
        ValueConverter.define('properCase', class ProperCase {
          public toView(value: unknown): unknown {
            if (typeof value == 'string' && value) {
              return value
                .split(' ')
                .map(m => m[0].toUpperCase() + m.substring(1).toLowerCase())
                .join(' ');
            }
            return value;
          }
        }),
      ],
    ).started;

    const [, nestedInputEl] = Array.from(appHost.querySelectorAll('input'));
    nestedInputEl.value = 'aa bb';
    nestedInputEl.dispatchEvent(new ctx.CustomEvent('input', { bubbles: true }));

    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(nestedInputEl.value, 'Aa Bb');
  });

  it('renders containerless per element via "containerless" attribute', async function () {
    const { appHost } = await createFixture(
      `<my-el containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message']
      })]
    ).started;

    assert.visibleTextEqual(appHost, 'hello world');
  });

  it('renders element with @customElement({ containerness: true })', async function () {
    const { assertText } = await createFixture(`<my-el message="hello world">`, class App {}, [CustomElement.define({
      name: 'my-el',
      template: '${message}',
      bindables: ['message'],
      containerless: true
    })]).started;

    assertText('hello world');
  });

  it('renders elements with both "containerless" attribute and @customElement({ containerless: true })', async function () {
    const { assertText } = await createFixture(
      `<my-el containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message'],
        containerless: true,
      })]
    ).started;

    assertText('hello world');
  });

  it('renders elements with template controller and containerless attribute on it', async function () {
    const { assertText } = await createFixture(
      `<my-el if.bind="true" containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message']
      })]
    ).started;

    assertText('hello world');
  });
});
// import {
//   bindable,
//   customElement,
//   CustomElement,
//   alias,
//   CustomElementHost,
//   Aurelia,
//   ICustomElementViewModel,
//   IDryCustomElementController,
//   CustomElementDefinition,
//   PartialCustomElementDefinitionParts,
//   PartialCustomElementDefinition,
//   IContextualCustomElementController,
//   ICompiledCustomElementController,
//   ICustomElementController,
//   LifecycleFlags,
//   MaybePromiseOrTask,
//   IHydratedController
// } from '@aurelia/runtime';
// import {
//   TestConfiguration,
//   assert,
//   createFixture,
//   TestContext,
//   HTMLTestContext,
//   CallCollection,
// } from '@aurelia/testing';
// import {
//   Registration,
//   IIndexable,
//   PLATFORM,
//   Class,
//   IContainer,
// } from '@aurelia/kernel';
// import {
//   InterceptorFunc,
// } from '@aurelia/runtime/dist/templating/bindable';

// interface Person { firstName?: string; lastName?: string; fullName?: string }
// const app = class { public value: string = 'wOOt'; };

// describe('5-jit-html/custom-elements/custom-elements.spec.ts', function () {

//   const registrations = [TestConfiguration];

//   // custom elements
//   it('01.', async function () {
//     const { tearDown, appHost } = createFixture(`<template><name-tag name="bigopon"></name-tag></template>`, undefined, registrations);
//     assert.strictEqual(appHost.textContent, 'bigopon', `host.textContent`);
//     await tearDown();
//   });

//   // [as-element]
//   describe('02.', function () {

//     // works with custom element with [as-element]
//     it('01.', async function () {
//       const { tearDown, appHost } = createFixture(`<template><div as-element="name-tag" name="bigopon"></div></template>`, undefined, registrations);

//       assert.strictEqual(appHost.textContent, 'bigopon', `host.textContent`);
//       await tearDown();

//     });

//     // ignores tag name
//     it('02.', async function () {
//       const { tearDown, appHost } = createFixture(`<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`, undefined, registrations);

//       assert.strictEqual(appHost.textContent, 'Fred', `host.textContent`);

//       await tearDown();

//     });
//   });

//   // <let/>
//   it('03.', async function () {
//     const { tearDown, platform, appHost, component } = createFixture(`<template><let full-name.bind="firstName + \` \` + lastName"></let><div>\${fullName}</div></template>`,
//       class { public static isStrictBinding: boolean = true; public firstName?: string = undefined; public lastName?: string = undefined; });
//     assert.strictEqual(appHost.textContent, 'undefined undefined', `host.textContent`);

//     component.firstName = 'bi';
//     component.lastName = 'go';

//     assert.strictEqual(appHost.textContent, 'undefined undefined', `host.textContent`);
//     platform.domWriteQueue.flush();

//     assert.strictEqual(appHost.textContent, 'bi go', `host.textContent`);

//     await tearDown();

//   });

//   // //<let [to-binding-context] />
//   it('04.', async function () {
//     const { tearDown, platform, appHost, component } = createFixture<Person>(`<template><let to-binding-context full-name.bind="firstName + \` \` + lastName"></let><div>\${fullName}</div></template>`,
//       class implements Person { public static isStrictBinding: boolean = true; });
//     component.firstName = 'bi';
//     assert.strictEqual(component.fullName, 'bi undefined', `component.fullName`);
//     component.lastName = 'go';
//     assert.strictEqual(component.fullName, 'bi go', `component.fullName`);
//     platform.domWriteQueue.flush();
//     assert.strictEqual(appHost.textContent, 'bi go', `host.textContent`);
//     await tearDown();

//   });

//   // //initial values propagate through multiple nested custom elements connected via bindables
//   it('05.', async function () {
//     let boundCalls = 0;

//     @customElement({ name: 'foo1', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>` })
//     class FooElement1 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo1.this.value');
//         assert.strictEqual(this.value1, 'w00t1', 'Foo1.this.value1');
//         boundCalls++;
//       }
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo2', template: `<template><foo3 value.bind="value" value2.bind="value2"></foo3>\${value}</template>` })
//     class FooElement2 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo2.this.value');
//         assert.strictEqual(this.value1, 'w00t1', 'Foo2.this.value1');
//         assert.strictEqual(this.value2, 'w00t1', 'Foo2.this.value2');
//         boundCalls++;
//       }
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo3', template: `<template><foo4 value.bind="value" value2.bind="value2"></foo4>\${value}</template>` })
//     class FooElement3 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo3.this.value');
//         assert.strictEqual(this.value1, 'w00t1', 'Foo3.this.value1');
//         assert.strictEqual(this.value2, 'w00t1', 'Foo3.this.value2');
//         boundCalls++;
//       }
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo4', template: `<template><foo5 value.bind="value" value2.bind="value2"></foo5>\${value}</template>` })
//     class FooElement4 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo4.this.value');
//         assert.strictEqual(this.value1, 'w00t1', 'Foo4.this.value1');
//         assert.strictEqual(this.value2, 'w00t1', 'Foo4.this.value2');
//         boundCalls++;
//       }
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo5', template: `<template>\${value}</template>` })
//     class FooElement5 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo5.this.value');
//         assert.strictEqual(this.value1, 'w00t1', 'Foo5.this.value1');
//         assert.strictEqual(this.value2, 'w00t1', 'Foo5.this.value2');
//         boundCalls++;
//       }
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     const resources: any[] = [FooElement1, FooElement2, FooElement3, FooElement4, FooElement5];
//     const { platform, component, appHost, tearDown } = createFixture(`<template><foo1 value.bind="value"></foo1>\${value}</template>`, class { public value: string = 'w00t'; }, [...resources, TestConfiguration]);

//     assert.strictEqual(boundCalls, 5, `boundCalls`);

//     const current = component;
//     assert.strictEqual(appHost.textContent, 'w00t'.repeat(6), `host.textContent`);

//     component.value = 'w00t00t';
//     assert.strictEqual(current.value, 'w00t00t', `current.value`);
//     assert.strictEqual(appHost.textContent, 'w00t'.repeat(6), `host.textContent`);
//     platform.domWriteQueue.flush();
//     assert.strictEqual(appHost.textContent, 'w00t00t'.repeat(6), `host.textContent`);
//     await tearDown();

//   });

//   describe('06. Aliasing', function () {

//     @customElement({ name: 'foo1', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>`, aliases: ['foo11', 'foo12'] })
//     class FooContainerless1 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo2', template: `<template>\${value}</template>`, aliases: ['foo21', 'foo22'] })
//     class FooContainerless2 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo3', template: `<template><foo11 value.bind="value" value2.bind="value1"></foo11>\${value}</template>`, aliases: ['foo31', 'foo32'] })
//     class FooContainerless3 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo4', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>`, aliases: ['foo43'] })
//     @alias('foo41', 'foo42')
//     class FooContainerless4 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo5', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>`, aliases: ['foo53'] })
//     @alias(...['foo51', 'foo52'])
//     class FooContainerless5 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }
//     const resources: any[] = [FooContainerless1, FooContainerless2, FooContainerless3, FooContainerless4, FooContainerless5];
//     it('Simple Alias doesn\'t break original', async function () {
//       const options = createFixture(`<template><foo1 value.bind="value"></foo1>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with decorator doesn\'t break original', async function () {
//       const options = createFixture(`<template><foo4 value.bind="value"></foo4>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with decorator doesn\'t break origianl aliases', async function () {
//       const options = createFixture(`<template><foo43 value.bind="value"></foo43>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias Works', async function () {
//       const options = createFixture(`<template><foo11 value.bind="value"></foo11>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with decorator 1st position works as expected', async function () {
//       const options = createFixture(`<template><foo41 value.bind="value"></foo41>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with decorator 2nd position works as expected', async function () {
//       const options = createFixture(`<template><foo42 value.bind="value"></foo42>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with spread decorator 1st position works as expected', async function () {
//       const options = createFixture(`<template><foo51 value.bind="value"></foo51>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias with spread decorator 2nd position works as expected', async function () {
//       const options = createFixture(`<template><foo52 value.bind="value"></foo52>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });

//     it('Simple Alias element referencing another alias', async function () {
//       const options = createFixture(`<template><foo31 value.bind="value"></foo31>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(4));
//       await options.tearDown();
//     });
//     it('Orig and Alias work', async function () {
//       const options = createFixture(`<template><foo11 value.bind="value"></foo11><foo1 value.bind="value"></foo1>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(5));
//       await options.tearDown();
//     });
//     it('Alias and Alias (2) work', async function () {
//       const options = createFixture(`<template><foo11 value.bind="value"></foo11><foo12 value.bind="value"></foo12>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(5));
//       await options.tearDown();
//     });
//     it('Alias to Alias ', async function () {
//       const options = createFixture(`<template><test value.bind="value"></test>\${value}</template>`, app, [...resources, Registration.aliasTo(CustomElement.keyFrom('foo11'), CustomElement.keyFrom('test'))]);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });
//     it('Alias to Alias plus original alias ', async function () {
//       const options = createFixture(`<template><test value.bind="value"></test><foo12 value.bind="value"></foo12>\${value}</template>`, app, [...resources, Registration.aliasTo(CustomElement.keyFrom('foo11'), CustomElement.keyFrom('test'))]);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(5));
//       await options.tearDown();
//     });
//     it('Alias to Alias 2 aliases and original', async function () {
//       const options = createFixture(`<template><test value.bind="value"></test><foo12 value.bind="value"></foo11><foo12 value.bind="value"></foo11><foo1 value.bind="value"></foo1>\${value}</template>`, app, [...resources, Registration.aliasTo(CustomElement.keyFrom('foo11'), CustomElement.keyFrom('test'))]);
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(9));
//       await options.tearDown();
//     });
//   });

//   describe('07. Containerless', function () {
//     @customElement({ name: 'foo1', template: `<template><div><foo2 value.bind="value" value2.bind="value1"></foo2></div>\${value}</template>`, aliases: ['foo11', 'foo12'], containerless: true })
//     class Foo1 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo2', template: `<template>\${value}</template>`, aliases: ['foo21', 'foo22'], containerless: true })
//     class Foo2 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     @customElement({ name: 'foo3', template: `<template><foo11 value.bind="value" value2.bind="value1"></foo11>\${value}</template>`, aliases: ['foo31', 'foo32'], containerless: false })
//     class Foo3 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public binding() { this.valueChanged(); }
//       public valueChanged(): void {
//         this.value1 = `${this.value}1`;
//       }
//     }

//     const resources: any[] = [Foo1, Foo2, Foo3];
//     it('Simple containerless', async function () {
//       const options = createFixture(`<template><foo1 value.bind="value"></foo1>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.firstElementChild.tagName, 'DIV', 'DIV INSTEAD OF ELEMENT TAG WITH CONTAINERLESS');
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });
//     it('Simple alias containerless', async function () {
//       const options = createFixture(`<template><foo11 value.bind="value"></foo11>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.firstElementChild.tagName, 'DIV', 'DIV INSTEAD OF ELEMENT TAG WITH CONTAINERLESS');
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(3));
//       await options.tearDown();
//     });
//     it('Containerless inside non containerless', async function () {
//       const options = createFixture(`<template><foo3 value.bind="value"></foo3>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.firstElementChild.firstElementChild.tagName, 'DIV', 'DIV INSTEAD OF ELEMENT TAG WITH CONTAINERLESS');
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(4));
//       await options.tearDown();
//     });
//     it('Containerless inside non containerless alias', async function () {
//       const options = createFixture(`<template><foo31 value.bind="value"></foo31>\${value}</template>`, app, resources);
//       assert.strictEqual(options.appHost.firstElementChild.firstElementChild.tagName, 'DIV', 'DIV INSTEAD OF ELEMENT TAG WITH CONTAINERLESS');
//       assert.strictEqual(options.appHost.textContent, 'wOOt'.repeat(4));
//       await options.tearDown();
//     });

//   });

//   describe('08. Change Handler', function () {
//     this.afterEach(assert.areTaskQueuesEmpty);

//     describe('+ with only [prop]Changed()', function () {
//       interface IChangeHandlerTestViewModel {
//         prop: any;
//         propChangedCallCount: number;
//         propChanged(newValue: any): void;
//       }

//       @customElement({
//         name: 'foo',
//         template: ''
//       })
//       class Foo implements IChangeHandlerTestViewModel {
//         @bindable()
//         public prop: any;
//         public propChangedCallCount: number = 0;
//         public propChanged(): void {
//           this.propChangedCallCount++;
//         }
//       }

//       it('does not invoke change handler when starts with plain usage', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop="prop"></foo>');
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with commands', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop.bind="prop"></foo>');
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with interpolation', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest(`<foo prop="\${prop}"></foo>`);
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with two way binding', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest(`<foo prop.two-way="prop"></foo>`);
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         await tearDown();
//       });

//       function setupChangeHandlerTest(template: string) {
//         const options = createFixture(template, app, [Foo]);
//         const fooEl = options.appHost.querySelector('foo') as CustomElementHost;
//         const fooVm = CustomElement.for(fooEl).viewModel as Foo;
//         return {
//           fooVm: fooVm,
//           tearDown: () => options.tearDown()
//         };
//       }
//     });

//     describe('+ with only propertyChanged(name, newValue, oldValue)', function () {
//       interface IChangeHandlerTestViewModel {
//         prop: any;
//         propertyChangedCallCount: number;
//         propertyChanged(name: string, newValue: any, oldValue: any): void;
//       }

//       @customElement({
//         name: 'foo',
//         template: ''
//       })
//       class Foo implements IChangeHandlerTestViewModel {
//         @bindable()
//         public prop: any;
//         public propertyChangedCallCount: number = 0;
//         public propertyChanged(): void {
//           this.propertyChangedCallCount++;
//         }
//       }

//       it('does not invoke change handler when starts with plain usage', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop="prop"></foo>');
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with commands', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop.bind="prop"></foo>');
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with interpolation', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest(`<foo prop="\${prop}"></foo>`);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with two way binding', async function () {
//         const { fooVm, rootVm, tearDown } = setupChangeHandlerTest(`<foo prop.two-way="prop"></foo>`);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         assert.strictEqual(rootVm.prop, '5');
//         await tearDown();
//       });

//       function setupChangeHandlerTest(template: string) {
//         const options = createFixture(template, app, [Foo]);
//         const fooEl = options.appHost.querySelector('foo') as CustomElementHost;
//         const fooVm = CustomElement.for(fooEl).viewModel as Foo;
//         return {
//           fooVm: fooVm,
//           rootVm: options.au.root.controller.viewModel as any,
//           tearDown: () => options.tearDown()
//         };
//       }
//     });

//     describe('+ with both [prop]Changed() + propertyChanged(name, newValue, oldValue)', function () {
//       interface IChangeHandlerTestViewModel {
//         prop: any;
//         propChangedCallCount: number;
//         propChanged(): void;
//         propertyChangedCallCount: number;
//         propertyChanged(name: string, newValue: any, oldValue: any): void;
//       }

//       @customElement({
//         name: 'foo',
//         template: ''
//       })
//       class Foo implements IChangeHandlerTestViewModel {
//         @bindable()
//         public prop: any;
//         public propChangedCallCount: number = 0;
//         public propChanged(): void {
//           this.propChangedCallCount++;
//         }
//         public propertyChangedCallCount: number = 0;
//         public propertyChanged(): void {
//           this.propertyChangedCallCount++;
//         }
//       }

//       it('does not invoke change handler when starts with plain usage', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop="prop"></foo>');
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with commands', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest('<foo prop.bind="prop"></foo>');
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with interpolation', async function () {
//         const { fooVm, tearDown } = setupChangeHandlerTest(`<foo prop="\${prop}"></foo>`);
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         await tearDown();
//       });

//       it('does not invoke change handler when starts with two way binding', async function () {
//         const { fooVm, rootVm, tearDown } = setupChangeHandlerTest(`<foo prop.two-way="prop"></foo>`);
//         assert.strictEqual(fooVm.propChangedCallCount, 0);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 0);
//         fooVm.prop = '5';
//         assert.strictEqual(fooVm.propChangedCallCount, 1);
//         assert.strictEqual(fooVm.propertyChangedCallCount, 1);
//         assert.strictEqual(rootVm.prop, '5');
//         await tearDown();
//       });

//       function setupChangeHandlerTest(template: string) {
//         const options = createFixture(template, app, [Foo]);
//         const fooEl = options.appHost.querySelector('foo') as CustomElementHost;
//         const fooVm = CustomElement.for(fooEl).viewModel as Foo;
//         return {
//           fooVm: fooVm,
//           rootVm: options.au.root.controller.viewModel as any,
//           tearDown: () => options.tearDown()
//         };
//       }
//     });
//   });

//   describe('09. with setter', function () {
//     this.afterEach(assert.areTaskQueuesEmpty);
//     interface IBindableSetterHtmlInputTestCase {
//       title: string;
//       template: string;
//       setter: InterceptorFunc;
//       assertionFn: (ctx: HTMLTestContext, rootVm: IIndexable, inputEl: HTMLElement) => void;
//     }

//     const testCases: IBindableSetterHtmlInputTestCase[] = [
//       {
//         title: 'works <input />',
//         template: '<input value.bind="value">',
//         setter: Number,
//         assertionFn: (ctx, rootVm, host) => {
//           const inputEl = host.querySelector('input');

//           assert.strictEqual(inputEl.value, '');
//           assert.strictEqual(rootVm.value, undefined);

//           inputEl.value = '5';
//           inputEl.dispatchEvent(new ctx.CustomEvent('input'));
//           assert.strictEqual(rootVm.value, 5);

//           // emulate wrong input scenario
//           // that it won't cause an overflow, because guarded with Object.is(newValue, currentValue)
//           inputEl.value = 'a5';
//           inputEl.dispatchEvent(new ctx.CustomEvent('input'));
//           assert.strictEqual(Object.is(rootVm.value, NaN), true);

//           // emulate view model value change
//           rootVm.value = 4;
//           assert.strictEqual(inputEl.value, 'a5');
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(inputEl.value, '4');

//           // emulate wrong value assignment
//           rootVm.value = NaN;
//           assert.strictEqual(Object.is(rootVm.value, NaN), true);
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(inputEl.value, 'NaN');
//         }
//       },
//       {
//         title: 'works with <input type="range">',
//         template: '<input type="range" min="100" max="1000" value.bind="value">',
//         setter: Number,
//         assertionFn: (ctx, rootVm, host) => {
//           const inputEl = host.querySelector('input');

//           assert.strictEqual(inputEl.value, /* (100 + 1000)/2 */'550'); // start at the middle when value is undefined
//           assert.strictEqual(rootVm.value, undefined);

//           // emulate input 1
//           inputEl.value = '5';
//           inputEl.dispatchEvent(new ctx.CustomEvent('input'));
//           assert.strictEqual(inputEl.value, PLATFORM.isBrowserLike ? '100' : '5');
//           assert.strictEqual(rootVm.value, PLATFORM.isBrowserLike ? 100 : 5);

//           // emulate input 2
//           inputEl.value = '5555';
//           inputEl.dispatchEvent(new ctx.CustomEvent('input'));
//           assert.strictEqual(inputEl.value, PLATFORM.isBrowserLike ? '1000' : '5555');
//           assert.strictEqual(rootVm.value, PLATFORM.isBrowserLike ? 1000 : 5555);

//           // emulate input 3
//           inputEl.value = '555';
//           inputEl.dispatchEvent(new ctx.CustomEvent('input'));
//           assert.strictEqual(inputEl.value, '555');
//           assert.strictEqual(rootVm.value, 555);

//           // emulate view model change 1
//           // valid value: in side min-max range
//           rootVm.value = 444;
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(inputEl.value, '444');
//           assert.strictEqual(rootVm.value, 444);

//           // emulate view model change 2
//           // invalid value: outside min-max range
//           rootVm.value = 11;
//           // should it should be 100 here?
//           // todo:  define how to handle range input properly.
//           //        This means ValueAttributeObserver needs to be more intelligent about the input/type combo & extra signals
//           assert.strictEqual(rootVm.value, 11);
//           assert.strictEqual(inputEl.value, '444');
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(inputEl.value, PLATFORM.isBrowserLike ? '100' : '11');
//         }
//       },
//       {
//         title: 'works with <select />',
//         template: '<select value.bind="value"><option>1 <option>2 <option>3',
//         setter: Number,
//         assertionFn: (ctx, rootVm, host) => {
//           const selectEl = host.querySelector('select');

//           // while there is also an out-of-sync behavior here
//           // it's different to range input issue above
//           // as during start up, it is OK to only use view model as source of truth and disregard the view value
//           assert.strictEqual(selectEl.value, '1');
//           assert.strictEqual(rootVm.value, undefined);

//           selectEl.options.item(1).selected = true;
//           assert.strictEqual(rootVm.value, undefined);
//           selectEl.dispatchEvent(new ctx.CustomEvent('change'));
//           assert.strictEqual(rootVm.value, 2);

//           // emulate vm change from intercomponent binding
//           rootVm.value = 'wack';
//           assert.strictEqual(selectEl.value, '2');
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(rootVm.value, NaN);
//           assert.strictEqual(selectEl.value, '1');
//         }
//       },
//       {
//         title: 'works with model binding + <select />',
//         template: [
//           '<select value.bind="value">',
//           '<option model.bind="1">Neutral',
//           '<option model.bind="2">Female',
//           '<option model.bind="3">Male'
//         ].join(''),
//         setter: Number,
//         assertionFn: (ctx, rootVm, host) => {
//           const selectEl = host.querySelector('select');

//           assert.strictEqual(selectEl.value, 'Neutral');
//           assert.strictEqual(rootVm.value, undefined);

//           // emulate programmatically changed input
//           selectEl.options.item(1).selected = true;
//           assert.strictEqual(rootVm.value, undefined);
//           selectEl.dispatchEvent(new ctx.CustomEvent('change'));
//           assert.strictEqual(rootVm.value, 2);

//           // emulate normal input change
//           selectEl.value = 'Male';
//           selectEl.dispatchEvent(new ctx.CustomEvent('change'));
//           assert.strictEqual(rootVm.value, 3);

//           // emulate vm change from intercomponent binding
//           rootVm.value = 'wack';
//           assert.strictEqual(selectEl.value, 'Male');
//           ctx.platform.domWriteQueue.flush();
//           assert.strictEqual(rootVm.value, NaN);
//           assert.strictEqual(selectEl.value, 'Neutral');
//         }
//       }
//     ];

//     for (const testCase of testCases) {
//       const {
//         title,
//         template,
//         setter,
//         assertionFn
//       } = testCase;

//       it(title, function () {
//         const ctx = TestContext.createHTMLTestContext();
//         const au = new Aurelia(ctx.container);
//         const host = ctx.createElement('app');

//         @customElement({ name: 'app', template: template })
//         class App {
//           @bindable({ set: setter })
//           public value: number;
//         }

//         au.app({ host: host, component: App });
//         au.start();

//         assertionFn(ctx, au.root.controller.viewModel as any, host);
//         au.stop();
//       });
//     }
//   });

//   interface ICallTracingViewModel extends ICustomElementViewModel<HTMLElement> {
//     readonly id: number;
//     readonly $calls: CallCollection;
//   }

//   function addHooks<TProto extends ICallTracingViewModel>(ctor: Class<TProto>): Class<TProto> {
//     const proto = ctor.prototype;

//     proto.define = function define(
//       this: TProto,
//       controller: IDryCustomElementController<HTMLElement, TProto>,
//       parentContainer: IContainer,
//       definition: CustomElementDefinition,
//       parts: PartialCustomElementDefinitionParts | undefined,
//     ): PartialCustomElementDefinition | void {
//       this.$calls.addCall(this.id, 'define');
//     };
//     proto.hydrating = function hydrating(
//       this: TProto,
//       controller: IContextualCustomElementController<HTMLElement, TProto>,
//     ): void {
//       this.$calls.addCall(this.id, 'hydrating');
//     };
//     proto.hydrated = function hydrated(
//       this: TProto,
//       controller: ICompiledCustomElementController<HTMLElement, TProto>,
//     ): void {
//       this.$calls.addCall(this.id, 'hydrated');
//     };
//     proto.created = function created(
//       this: TProto,
//       controller: ICustomElementController<HTMLElement, TProto>,
//     ): void {
//       this.$calls.addCall(this.id, 'created');
//     };

//     proto.binding = function binding(
//       this: TProto,
//       initiator: IHydratedController,
//       parent: IHydratedParentController | null,
//       flags: LifecycleFlags,
//     ): MaybePromiseOrTask {
//       this.$calls.addCall(this.id, 'binding');
//     };
//     proto.bound = function bound(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'bound');
//     };
//     proto.bound = function bound(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'bound');
//     };

//     proto.unbinding = function unbinding(
//       this: TProto,
//       initiator: IHydratedController,
//       parent: IHydratedParentController | null,
//       flags: LifecycleFlags,
//     ): MaybePromiseOrTask {
//       this.$calls.addCall(this.id, 'unbinding');
//     };
//     proto.afterUnbind = function afterUnbind(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'afterUnbind');
//     };
//     proto.afterUnbindChildren = function afterUnbindChildren(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'afterUnbindChildren');
//     };

//     proto.beforeAttach = function beforeAttach(
//       this: TProto,
//       initiator: IHydratedController,
//       parent: IHydratedParentController | null,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'beforeAttach');
//     };
//     proto.attaching = function attaching(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): MaybePromiseOrTask {
//       this.$calls.addCall(this.id, 'attaching');
//     };
//     proto.attached = function attached(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'attached');
//     };

//     proto.detaching = function detaching(
//       this: TProto,
//       initiator: IHydratedController,
//       parent: IHydratedParentController | null,
//       flags: LifecycleFlags,
//     ): MaybePromiseOrTask {
//       this.$calls.addCall(this.id, 'detaching');
//     };
//     proto.afterDetach = function afterDetach(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'afterDetach');
//     };
//     proto.afterDetachChildren = function afterDetachChildren(
//       this: TProto,
//       flags: LifecycleFlags,
//     ): void {
//       this.$calls.addCall(this.id, 'afterDetachChildren');
//     };

//     proto.dispose = function dispose(
//       this: TProto,
//     ): void {
//       this.$calls.addCall(this.id, 'dispose');
//     };

//     return ctor;
//   }

//   describe('hooks fire in the correct order', function () {
//     it(`only root component`, async function () {
//       // Arrange
//       const ctx = TestContext.createHTMLTestContext();
//       const { container } = ctx;
//       const au = new Aurelia(container);
//       const host = ctx.createElement('app');

//       const actualCalls = container.get(CallCollection);

//       const expectedCalls = new CallCollection();
//       expectedCalls
//         .addCall(1, 'define')
//         .addCall(1, 'hydrating')
//         .addCall(1, 'hydrated')
//         .addCall(1, 'created')
//         .addCall(1, 'binding')
//         .addCall(1, 'bound')
//         .addCall(1, 'bound')
//         .addCall(1, 'beforeAttach')
//         .addCall(1, 'attaching')
//         .addCall(1, 'attached')
//         .addCall(1, 'detaching')
//         .addCall(1, 'afterDetach')
//         .addCall(1, 'afterDetachChildren')
//         .addCall(1, 'unbinding')
//         .addCall(1, 'afterUnbind')
//         .addCall(1, 'afterUnbindChildren');

//       const App = CustomElement.define(
//         {
//           name: 'app',
//         },
//         addHooks(class {
//           public readonly id: number = 1;

//           public static get inject(): [typeof CallCollection] {
//             return [CallCollection];
//           }

//           public constructor(
//             public readonly $calls: CallCollection,
//           ) {}
//         })
//       );

//       au.app({ component: App, host });

//       // Act
//       await au.start();
//       await au.stop();

//       // Assert
//       assert.deepStrictEqual(actualCalls, expectedCalls);
//     });

//     it(`root and child component`, async function () {
//       // Arrange
//       const ctx = TestContext.createHTMLTestContext();
//       const { container } = ctx;
//       const au = new Aurelia(container);
//       const host = ctx.createElement('app');

//       const actualCalls = container.get(CallCollection);

//       const expectedCalls = new CallCollection();
//       expectedCalls
//         .addCall(1, 'define')
//         .addCall(1, 'hydrating')
//         .addCall(1, 'hydrated')

//         .addCall(2, 'create')
//         .addCall(2, 'hydrating')
//         .addCall(2, 'hydrated')

//         .addCall(2, 'created')
//         .addCall(1, 'created')

//         .addCall(1, 'binding')
//         .addCall(1, 'bound')

//         .addCall(2, 'binding')
//         .addCall(2, 'bound')

//         .addCall(2, 'bound')
//         .addCall(1, 'bound')

//         .addCall(1, 'beforeAttach')
//         .addCall(1, 'attaching')

//         .addCall(2, 'beforeAttach')
//         .addCall(2, 'attaching')

//         .addCall(2, 'attached')
//         .addCall(1, 'attached')

//         .addCall(1, 'detaching')
//         .addCall(1, 'afterDetach')

//         .addCall(2, 'detaching')
//         .addCall(2, 'afterDetach')

//         .addCall(2, 'afterDetachChildren')
//         .addCall(1, 'afterDetachChildren')

//         .addCall(1, 'unbinding')
//         .addCall(1, 'afterUnbind')

//         .addCall(2, 'unbinding')
//         .addCall(2, 'afterUnbind')

//         .addCall(2, 'afterUnbindChildren')
//         .addCall(1, 'afterUnbindChildren');

//       const Child = CustomElement.define(
//         {
//           name: 'child',
//         },
//         addHooks(class {
//           public readonly id: number = 2;

//           public static get inject(): [typeof CallCollection] {
//             return [CallCollection];
//           }

//           public constructor(
//             public readonly $calls: CallCollection,
//           ) {}
//         })
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           dependencies: [Child],
//           template: '<child></child>'
//         },
//         addHooks(class {
//           public readonly id: number = 1;

//           public static get inject(): [typeof CallCollection] {
//             return [CallCollection];
//           }

//           public constructor(
//             public readonly $calls: CallCollection,
//           ) {}
//         })
//       );

//       au.app({ component: App, host });

//       // Act
//       await au.start();
//       await au.stop();

//       // Assert
//       assert.deepStrictEqual(actualCalls, expectedCalls);
//     });
//   });
// });
