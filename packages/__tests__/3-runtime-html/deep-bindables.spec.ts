// import { ITraceInfo, Profiler, Tracer } from '@aurelia/kernel';
// import {
//   Aurelia,
//   BindingStrategy,
//   CustomElement,
//   IViewModel,
//   LifecycleFlags
// } from '@aurelia/runtime';
// import { disableTracing, enableTracing, TestContext, writeProfilerReport } from '@aurelia/testing';

// const spec = 'deep-bindables';

// describe(spec, function () {
//   function createFixture() {
//     const ctx = TestContext.createHTMLTestContext();
//     const container = ctx.container;
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(container);
//     const host = ctx.createElement('div');

//     return { ctx, container, lifecycle, au, host };
//   }

//   for (const strategy of [
//     BindingStrategy.getterSetter,
//     BindingStrategy.proxies,
//     BindingStrategy.keyed | BindingStrategy.getterSetter,
//     BindingStrategy.keyed | BindingStrategy.proxies
//   ]) {
//     it(`strategy=${stringifyLifecycleFlags(strategy)}`, function () {
//       const bb = (strategy & BindingStrategy.keyed) > 0 ? ' & keyed' : '';
//       this.timeout(30000);
//       let num = 0;
//       const { lifecycle, au, host } = createFixture();

//       const bindables = {
//         max: { property: 'max', attribute: 'max' },
//         depth: { property: 'depth', attribute: 'depth' },
//         items: { property: 'items', attribute: 'items' },
//         item: { property: 'item', attribute: 'item' }
//       };
//       const FooA = CustomElement.define(
//         {
//           name: 'foo-a',
//           template: `a\${depth}.\${item} <foo-a if.bind="depth<=max" repeat.for="i of items${bb}" max.bind="max" depth.bind="depth+1" items.bind="items" item.bind="i"></foo-a>`,
//           strategy
//         },
//         class { public static bindables = bindables; }
//       );

//       const FooB = CustomElement.define(
//         {
//           name: 'foo-b',
//           template: `b\${depth}.\${item} <foo-b if.bind="depth<=max" repeat.for="i of items${bb}" max.bind="max" depth.bind="depth+1" items.bind="items" item.bind="i"></foo-b>`,
//           strategy
//         },
//         class { public static bindables = bindables; }
//       );

//       class $App {
//         public a: boolean = true;
//         public max: number = 3;
//         public depth: number = 0;
//         public items: number[] = [1, 2, 3];
//       }
//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo-a if.bind="a" max.bind="max" depth.bind="depth+1" items.bind="items" item.bind="0"></foo-a><foo-b else max.bind="max" depth.bind="depth+1" items.bind="items" item.bind="0"></foo-b>`,
//           strategy,
//           dependencies: [FooA, FooB]
//         },
//         $App
//       );

//       function verify(c: IViewModel & $App) {
//         lifecycle.processFlushQueue(strategy);
//         const { a, max, items } = c;
//         assert.strictEqual(host.textContent, `#${++num}`, getExpectedText(a ? 'a' : 'b', max, items, 0, 1), `host.textContent, `#${++num}``);
//       }
//       function getExpectedText(prefix: string, max: number, items: unknown[], item: unknown, depth: number): string {
//         let text = `${prefix}${depth}.${item} `;
//         if (depth <= max) {
//           const len = items.length;
//           let i = 0;
//           for (i = 0; i < len; ++i) {
//             text += getExpectedText(prefix, max, items, items[i], depth + 1);
//           }
//         }
//         return text;
//       }

//       const trace = true;

//       const calls = {
//         'ProxyObserver': [] as ITraceInfo[],
//         'ProxySubscriberCollection': [] as ITraceInfo[],
//         'BindableObserver': [] as ITraceInfo[],
//         'SetterObserver': [] as ITraceInfo[]
//       };
//       if (trace) {
//         enableTracing();
//         Tracer.enableLiveLogging({
//           write(info) {
//             if (calls[info.objName] === undefined) {
//               calls[info.objName] = 0;
//             }
//             if (typeof calls[info.objName] === 'object') {
//               calls[info.objName].push(info);
//             } else {
//               ++calls[info.objName];
//             }
//           }
//         });
//       }

//       au.app({ host, component: App, strategy });
//       au.start();
//       const component = au.root() as IViewModel & $App;

//       verify(component);
//       component.max = 2;
//       component.items = [1, 2, 3];

//       verify(component);

//       component.a = false;

//       verify(component);

//       if (trace) {
//         disableTracing();
//       }

//       if ((strategy & BindingStrategy.proxies) > 0) {
//         assert.strictEqual(calls['SetterObserver'].length, 0, 'calls[\'SetterObserver\'].length', `calls['SetterObserver'].length`);
//       } else {
//         assert.strictEqual(calls['ProxyObserver'].length, 0, 'calls[\'ProxyObserver\'].length', `calls['ProxyObserver'].length`);
//       }
//       // TODO: deeply verify observer call counts
//       // const names = ['ProxyObserver', 'ProxySubscriberCollection', 'BindableObserver', 'SetterObserver'];
//       // for (const {} of names) {
//       //   calls[`${name}.constructor`].sort((a, b) => a.depth < b.depth ? -1 : b.depth < a.depth ? 1 : 0);
//       //   for (const call of calls[`${name}.constructor`]) {
//       //     console.log(`${call.depth}`.padEnd(2, ' ') + ' '.repeat(call.depth) + call.name)
//       //   }
//       // }
//     });
//   }

//   for (const strategy of [
//     BindingStrategy.getterSetter,
//     BindingStrategy.proxies,
//     BindingStrategy.keyed | BindingStrategy.getterSetter,
//     BindingStrategy.keyed | BindingStrategy.proxies
//   ]) {
//     it(`profile, strategy=${stringifyLifecycleFlags(strategy)}`, function () {
//       const bb = (strategy & BindingStrategy.keyed) > 0 ? ' & keyed' : '';
//       this.timeout(30000);
//       const { au, host } = createFixture();

//       const bindingCount = 3;
//       const elementCount = 5000;

//       const arr = Array(bindingCount).fill(0);

//       const bindables = {
//         ...arr
//           .map((v, i) => ({[`item${i + 1}`]: { property: `item${i + 1}`, attribute: `item${i + 1}` }}))
//           .reduce(
//             (acc, cur) => {
//               Object.assign(acc, cur);
//               return acc;
//             },
//             {}
//           )
//       };

//       const interpolations = arr.map((v, i) => `\${item${i + 1}}`).join('');
//       const bindings = arr.map((v, i) => `item${i + 1}.bind="item${i + 1}"`).join(' ');
//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: `${interpolations}`,
//           strategy
//         },
//         class { public static bindables = bindables; }
//       );

//       class $App {
//         public item1: string = '$1';
//         public item2: string = '$2';
//         public item3: string = '$3';
//       }
//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo repeat.for="i of ${elementCount}${bb}" ${bindings}></foo>`,
//           strategy,
//           dependencies: [Foo]
//         },
//         $App
//       );

//       Profiler.enable();

//       au.app({ host, component: App, strategy });
//       au.start();
//       au.stop();

//       Profiler.disable();

//       writeProfilerReport(`deep-bindables strategy:${stringifyLifecycleFlags(strategy)}`);
//     });
//   }

// // TODO: replace these tests with cartesian loop and remove these comments

//   // it('works 2', function () {
//   //   this.timeout(30000);
//   //   let count = 100000;
//   //   const { ctx, container, lifecycle, au, host } = createFixture();
//   //   let proxyStrategy = true;

//   //   const Foo = CustomElement.define(
//   //     {
//   //       name: 'foo',
//   //       template: `\${a}\${b}\${c}\${d}\${e}\${f}\${g}\${h}\${i}\${j}`,
//   //       proxyStrategy
//   //     },
//   //     class {
//   //       public a = 'a';
//   //       public b = 'b';
//   //       public c = 'c';
//   //       public d = 'd';
//   //       public e = 'e';
//   //       public f = 'f';
//   //       public g = 'g';
//   //       public h = 'h';
//   //       public i = 'i';
//   //       public j = 'j';
//   //     }
//   //   );
//   //   const App = CustomElement.define(
//   //     {
//   //       name: 'app',
//   //       template: `<foo repeat.for="i of ${count}"></foo>`,
//   //       proxyStrategy,
//   //       dependencies: [Foo]
//   //     },
//   //     class {}
//   //   );

//   //   const component = new App();

//   //   let trace = false;
//   //   if (trace) {
//   //     enableTracing();
//   //     Tracer.enableLiveLogging({
//   //       write(info) {
//   //         const [name, op] = info.name.split('.');
//   //         if (['ProxyObserver', 'SetterObserver'].includes(name)) {
//   //           console.log(`${host.textContent.padEnd(40, ' ')}-${' '.repeat(info.depth)}: ${info.name}`);
//   //         }
//   //       }
//   //     });
//   //   }

//   //   au.app({ host, component, proxyStrategy });
//   //   au.start();

//   //   let expectedText = '';
//   //   for (let i = 0, ii = count; i < ii; ++i) {
//   //     expectedText += 'abcdefghij';
//   //   }
//   //   assert.strictEqual(host.textContent, expectedText, `host.textContent`);

//   //   au.stop();

//   //   // stage = 'mutation 1';
//   //   // component.max = 2;
//   //   // component.items = [1, 2];
//   //   // verify();

//   //   // stage = 'mutation 2';
//   //   // component.a = false;
//   //   // verify();

//   //   if (trace) {
//   //     disableTracing();
//   //   }
//   // });
// });

// // type TFooA = Constructable<{ a1: string; a2: string; a3: string }> & ICustomElementType;
// // type TFooB = Constructable<{ b1: string; b2: string; b3: string }> & ICustomElementType;
// // type TFooC = Constructable<{ c1: string; c2: string; c3: string }> & ICustomElementType;
// // type TApp = Constructable<{ $1: string; $2: string; $3: string }> & ICustomElementType & TFooA & TFooB & TFooC;

// // // #region parentSuite
// // const parentSuite = baseSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);

// // parentSuite.addDataSlot('e').addData('app').setFactory(ctx => {
// //   const { a: container } = ctx;
// //   const $ctx = container.get<HTMLTestContext>(HTMLTestContext);
// //   const template = $ctx.createElement('template') as HTMLTemplateElement;
// //   const text = $ctx.doc.createTextNode('${$1}${$2}${$3}');
// //   const fooA_el = $ctx.createElement('foo-a');

// //   fooA_el.setAttribute('a1.bind', '$1');
// //   fooA_el.setAttribute('a2.bind', '$2');
// //   fooA_el.setAttribute('a3.bind', '$3');

// //   template.content.appendChild(text);
// //   template.content.appendChild(fooA_el);

// //   const $App = CustomElement.define({ name: 'app', template }, class App {});
// //   container.register($App);
// //   ctx.i = fooA_el;
// //   return $App;
// // });
// // parentSuite.addDataSlot('f').addData('foo-a').setFactory(ctx => {
// //   const { a: container } = ctx;
// //   const $ctx = container.get<HTMLTestContext>(HTMLTestContext);
// //   const template = $ctx.createElement('template') as HTMLTemplateElement;
// //   const text = $ctx.doc.createTextNode('${a1}${a2}${a3}');
// //   const fooB_el = $ctx.createElement('foo-b');

// //   fooB_el.setAttribute('b1.bind', 'a1');
// //   fooB_el.setAttribute('b2.bind', 'a2');
// //   fooB_el.setAttribute('b3.bind', 'a3');

// //   template.content.appendChild(text);
// //   template.content.appendChild(fooB_el);

// //   class FooA {
// //     @bindable() public a1: string;
// //     @bindable() public a2: string;
// //     @bindable() public a3: string;
// //     @bindable() public display: boolean;
// //     @bindable() public things: any[];
// //   }
// //   const $FooA = CustomElement.define({ name: 'foo-a', template }, FooA);
// //   container.register($FooA);
// //   ctx.j = fooB_el;
// //   return $FooA;
// // });
// // parentSuite.addDataSlot('g').addData('foo-b').setFactory(ctx => {
// //   const { a: container } = ctx;
// //   const $ctx = container.get<HTMLTestContext>(HTMLTestContext);
// //   const template = $ctx.createElement('template') as HTMLTemplateElement;
// //   const text = $ctx.doc.createTextNode('${b1}${b2}${b3}');
// //   const fooC_el = $ctx.createElement('foo-c');

// //   fooC_el.setAttribute('c1.bind', 'b1');
// //   fooC_el.setAttribute('c2.bind', 'b2');
// //   fooC_el.setAttribute('c3.bind', 'b3');

// //   template.content.appendChild(text);
// //   template.content.appendChild(fooC_el);

// //   class FooB {
// //     @bindable() public b1: string;
// //     @bindable() public b2: string;
// //     @bindable() public b3: string;
// //     @bindable() public display: boolean;
// //     @bindable() public things: any[];
// //   }
// //   const $FooB = CustomElement.define({ name: 'foo-b', template }, FooB);
// //   container.register($FooB);
// //   ctx.k = fooC_el;
// //   return $FooB;
// // });
// // parentSuite.addDataSlot('h').addData('foo-c').setFactory(ctx => {
// //   const { a: container } = ctx;
// //   const $ctx = container.get<HTMLTestContext>(HTMLTestContext);
// //   const template = $ctx.createElement('template') as HTMLTemplateElement;
// //   const text = $ctx.doc.createTextNode('${c1}${c2}${c3}');

// //   template.content.appendChild(text);

// //   class FooC {
// //     @bindable() public c1: string;
// //     @bindable() public c2: string;
// //     @bindable() public c3: string;
// //     @bindable() public display: boolean;
// //     @bindable() public things: any[];
// //   }
// //   const $FooC = CustomElement.define({ name: 'foo-c', template }, FooC);
// //   container.register($FooC);
// //   return $FooC;
// // });

// // // #endregion

// // // #region basic
// // const nonWrappedBasic = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);
// // const wrappedBasic = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);

// // wrappedBasic.addActionSlot('wrap in div')
// //   .addAction('setup', ctx => {
// //     const {
// //       e: { description: { template: appTemplate } },
// //       f: { description: { template: fooATemplate } },
// //       g: { description: { template: fooBTemplate } },
// //       h: { description: { template: fooCTemplate } }
// //     } = ctx;

// //     const $ctx = ctx.a.get<HTMLTestContext>(HTMLTestContext);
// //     for (const template of [appTemplate, fooATemplate, fooBTemplate, fooCTemplate] as HTMLTemplateElement[]) {
// //       const div = $ctx.createElement('div');
// //       div.appendChild(template.content);
// //       template.content.appendChild(div);
// //     }
// //   });

// // for (const suite of [nonWrappedBasic, wrappedBasic]) {
// //   suite.addActionSlot('act')
// //     .addAction('assign', ctx => {
// //       const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //       const component = new app();
// //       component.$1 = '1';
// //       component.$2 = '2';
// //       component.$3 = '3';

// //       au.app({ host, component }).start();

// //       assert.strictEqual(host.textContent, '123'.repeat(4), `host.textContent`);
// //     })
// //     .addAction('no assign', ctx => {
// //       const { b: au, c: lifecycle, d: host, e: app } = ctx;
// //       const component = new app();

// //       au.app({ host, component }).start();

// //       assert.strictEqual(host.textContent, 'undefined'.repeat(12), `host.textContent`);
// //     });

// //   suite.addActionSlot('teardown')
// //     .addAction(null, ctx => {
// //       const { a: container, b: au, c: lifecycle, d: host, e: app, f: fooA, g: fooB, h: fooC } = ctx;

// //       au.stop();
// //       assert.strictEqual(lifecycle['flushCount'], 0, `lifecycle['flushCount']`);
// //       //assert.strictEqual(host.textContent, '', `host.textContent`);
// //     });

// //   suite.load();
// //   suite.run();
// // }
// // // #endregion

// // // #region noBindables
// // const noBindables = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);
// // noBindables.addActionSlot('remove bindables')
// //   .addAction('setup', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       while (el.attributes[0]) {
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //     }
// //   });

// // noBindables.addActionSlot('act')
// //   .addAction('assign 1', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.$1 = '1';
// //     component.$2 = '2';
// //     component.$3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, '123' + 'undefined'.repeat(9), `host.textContent`);
// //   })
// //   .addAction('assign 2', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.a1 = '1';
// //     component.a2 = '2';
// //     component.a3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, 'undefined'.repeat(12), `host.textContent`);
// //   })
// //   .addAction('assign 3', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.b1 = '1';
// //     component.b2 = '2';
// //     component.b3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, 'undefined'.repeat(12), `host.textContent`);
// //   })
// //   .addAction('assign 4', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.c1 = '1';
// //     component.c2 = '2';
// //     component.c3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, 'undefined'.repeat(12), `host.textContent`);
// //   });

// // noBindables.load();
// // noBindables.run();

// // // #endregion

// // // #region duplicated
// // const duplicated = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);
// // duplicated.addActionSlot('duplicate')
// //   .addAction('setup', ctx => {
// //     const { f: $fooA, g: $fooB, h: $fooC,  i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     const fooC_clone = fooC_el.cloneNode(true);
// //     for (let i = 0; i < 100; ++i) {
// //       ($fooB.description.template as HTMLTemplateElement).content.appendChild(fooC_clone.cloneNode(true));
// //     }

// //     const fooB_clone = fooB_el.cloneNode(true);
// //     for (let i = 0; i < 10; ++i) {
// //       ($fooA.description.template as HTMLTemplateElement).content.appendChild(fooB_clone.cloneNode(true));
// //     }
// //   });

// // duplicated.addActionSlot('act')
// //   .addAction('assign', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.$1 = '1';
// //     component.$2 = '2';
// //     component.$3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, '123'.repeat(1124), `host.textContent`);
// //   })
// //   .addAction('no assign', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;
// //     const component = new app();

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, 'undefined'.repeat(1124 * 3), `host.textContent`);
// //   });

// // duplicated.load();
// // duplicated.run();

// // // #endregion

// // // #region staticTemplateCtrl
// // const staticTemplateCtrl = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);

// // staticTemplateCtrl.addActionSlot('static template controller')
// //   .addAction('prepend if+repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('if.bind', 'true');
// //       el.setAttribute('repeat.for', 'i of 1');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('prepend if', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('if.bind', 'true');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('prepend repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('repeat.for', 'i of 1');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('append if+repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('if.bind', 'true');
// //       el.setAttribute('repeat.for', 'i of 1');
// //     }
// //   })
// //   .addAction('append repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('repeat.for', 'i of 1');
// //     }
// //   })
// //   .addAction('append if', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('if.bind', 'true');
// //     }
// //   });

// // staticTemplateCtrl.addActionSlot('act')
// //   .addAction(null, ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.$1 = '1';
// //     component.$2 = '2';
// //     component.$3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, '123'.repeat(4), `host.textContent`);
// //   });

// // staticTemplateCtrl.load();
// // staticTemplateCtrl.run();

// // // #endregion

// // // #region boundTemplateCtrl
// // const boundTemplateCtrl = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, TFooA, TFooB, TFooC, HTMLElement, HTMLElement, HTMLElement>(spec);

// // boundTemplateCtrl.addActionSlot('bound template controller')
// //   .addAction('prepend if+repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('if.bind', 'display');
// //       el.setAttribute('repeat.for', 'i of things');
// //       el.setAttribute('things.bind', 'things');
// //       el.setAttribute('display.bind', 'display');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('prepend repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('repeat.for', 'i of things');
// //       el.setAttribute('things.bind', 'things');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('prepend if', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       const attributes = [];
// //       while (el.attributes[0]) {
// //         attributes.push(el.attributes[0]);
// //         el.removeAttribute(el.attributes[0].name);
// //       }
// //       el.setAttribute('if.bind', 'display');
// //       el.setAttribute('display.bind', 'display');
// //       while (attributes[0]) {
// //         el.setAttribute(attributes[0].name, attributes[0].value);
// //         attributes.shift();
// //       }
// //     }
// //   })
// //   .addAction('append if+repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('things.bind', 'things');
// //       el.setAttribute('display.bind', 'display');
// //       el.setAttribute('if.bind', 'display');
// //       el.setAttribute('repeat.for', 'i of things');
// //     }
// //   })
// //   .addAction('append repeat', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('things.bind', 'things');
// //       el.setAttribute('repeat.for', 'i of things');
// //     }
// //   })
// //   .addAction('append if', ctx => {
// //     const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
// //     for (const el of [fooA_el, fooB_el, fooC_el]) {
// //       el.setAttribute('display.bind', 'display');
// //       el.setAttribute('if.bind', 'display');
// //     }
// //   });

// // boundTemplateCtrl.addActionSlot('act')
// //   .addAction('1', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.$1 = '1';
// //     component.$2 = '2';
// //     component.$3 = '3';
// //     component.display = true;
// //     component.things = [1];

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, '123'.repeat(4), `host.textContent`);
// //   })
// //   .addAction('2', ctx => {
// //     const { b: au, c: lifecycle, d: host, e: app } = ctx;

// //     const component = new app();
// //     component.$1 = '1';
// //     component.$2 = '2';
// //     component.$3 = '3';

// //     au.app({ host, component }).start();

// //     assert.strictEqual(host.textContent, '123', `host.textContent`);
// //   });

// // boundTemplateCtrl.load();
// // boundTemplateCtrl.run();
// // // #endregion
