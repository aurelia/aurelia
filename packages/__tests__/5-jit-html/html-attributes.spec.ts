// import { Key } from '@aurelia/kernel';
// import { Aurelia, CustomElement as CE, IViewModel, INode, LifecycleFlags as LF } from '@aurelia/runtime';
// import { TestContext, eachCartesianJoin } from '@aurelia/testing';

// interface IThing {
//   enabled?: boolean;
// }
// type VM<T> = T & IViewModel<Node> & {
//   el: Element;
//   parent?: VM<T>;
// };
// interface Spec {
//   t: string;
// }

// describe('html attribute', function () {
//   function setup() {
//     const ctx = TestContext.createHTMLTestContext();

//     const host = ctx.createElement('div');
//     const au = new Aurelia(ctx.container);
//     return { ctx, host, au };
//   }

//   describe('class', function () {
//     describe('on a surrogate', function () {
//       interface ThingSpec extends Spec {
//         createThing(): IThing;
//       }
//       interface ExpressionSpec extends Spec {
//         expression: string;
//         getExpectedClassNames(thing: IThing): string[];
//       }
//       interface ElementSpec extends Spec {
//         name: string;
//       }

//       const thingSpecs: ThingSpec[] = [
//         { t: '1', createThing() { return { enabled: false }; } },
//         { t: '2', createThing() { return { enabled: true  }; } },
//         { t: '3', createThing() { return {                }; } }
//       ];
//       const expressionSpecs: ExpressionSpec[] = [
//         {
//           t: '1',
//           expression: '${thing.enabled?\'class-1\':\'\'}',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-1'] : ['au'];
//           }
//         },
//         {
//           t: '2',
//           expression: '${thing.enabled?\'class-1\':\'class-2\'}',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-1'] : ['au', 'class-2'];
//           }
//         },
//         {
//           t: '3',
//           expression: '${thing.enabled?\'class-1\':\'\'} class-3',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-3', 'class-1'] : ['au', 'class-3'];
//           }
//         },
//         {
//           t: '4',
//           expression: '${thing.enabled?\'class-1\':\'class-2\'} class-3',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-3', 'class-1'] : ['au', 'class-2', 'class-3'];
//           }
//         },
//         {
//           t: '5',
//           expression: 'class-0 ${thing.enabled?\'class-1\':\'\'}',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-0', 'class-1'] : ['au', 'class-0'];
//           }
//         },
//         {
//           t: '6',
//           expression: 'class-0 ${thing.enabled?\'class-1\':\'class-2\'}',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-0', 'class-1'] : ['au', 'class-0', 'class-2'];
//           }
//         },
//         {
//           t: '7',
//           expression: 'class-0 ${thing.enabled?\'class-1\':\'\'} class-3',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-0', 'class-3', 'class-1'] : ['au', 'class-0', 'class-3'];
//           }
//         },
//         {
//           t: '8',
//           expression: 'class-0 ${thing.enabled?\'class-1\':\'class-2\'} class-3',
//           getExpectedClassNames(thing: IThing) {
//             return thing && thing.enabled ? ['au', 'class-0', 'class-3', 'class-1'] : ['au', 'class-0', 'class-2', 'class-3'];
//           }
//         },
//       ];
//       const elementSpecs: ElementSpec[] = [
//         {
//           t: '1',
//           name: 'template'
//         },
//         {
//           t: '2',
//           name: 'div'
//         },
//         {
//           t: '3',
//           name: 'bar'
//         }
//       ];

//       eachCartesianJoin(
//         [thingSpecs, thingSpecs, thingSpecs, thingSpecs, expressionSpecs, elementSpecs],
//         function (thingSpec1, thingSpec2, thingSpec3, thingSpec4, expressionSpec, elementSpec) {
//           it(`thingSpec1 ${thingSpec1.t}, thingSpec2 ${thingSpec2.t}, thingSpec3 ${thingSpec3.t}, thingSpec4 ${thingSpec4.t}, expressionSpec ${expressionSpec.t}, elementSpec ${elementSpec.t}`, function () {
//             const { createThing: createThing1 } = thingSpec1;
//             const { createThing: createThing2 } = thingSpec2;
//             const { createThing: createThing3 } = thingSpec3;
//             const { createThing: createThing4 } = thingSpec4;
//             const { expression, getExpectedClassNames } = expressionSpec;
//             const { name } = elementSpec;

//             const thing1 = createThing1();
//             const thing2 = createThing2();
//             const thing3 = createThing3();
//             const thing4 = createThing4();

//             const { host, au } = setup();
//             // verify that the assertions inside change handler / lifecycles were actually performed
//             let assertionCount = 0;

//             const component = CE.define(
//               {
//                 name: 'app',
//                 template: `<foo parent.bind="$this"></foo>`,
//                 dependencies: [
//                   CE.define(
//                     {
//                       name: 'foo',
//                       template: `<${name} class="${expression}"></${name}>`,
//                       bindables: ['thing', 'parent'],
//                       dependencies: [
//                         CE.define(
//                           {
//                             name: 'bar',
//                             template: ''
//                           }
//                         )
//                       ]
//                     },
//                     class {
//                       public static readonly inject: readonly Key[] = [INode];
//                       public thing: IThing;
//                       constructor(public el: Element) {
//                         this.thing = thing1;
//                       }

//                       public attached(): void {
//                         if (name !== 'template') {
//                           this.el = this.el.firstElementChild;
//                         }
//                         this.thing = thing2;
//                         this.thing = thing3;
//                         this.thing = thing4;
//                       }

//                       public thingChanged(this: VM<this>, newValue: IThing, oldValue: IThing): void {
//                         this.verifyClassName(oldValue);
//                         this.$lifecycle.processFlushQueue(LF.none);
//                         this.verifyClassName(newValue);
//                       }

//                       private verifyClassName(this: VM<this>, thing: IThing): void {
//                         const actualClassNames: string[] = [];
//                         this.el.classList.forEach(c => { actualClassNames.push(c); });
//                         const expectedClassNames = getExpectedClassNames(thing);
//                         assert.strictEqual(actualClassNames.length, `actualClassNames.length #${++assertionCount}, actual=${actualClassNames.join(' ')}, expected=${expectedClassNames.join(' ')}`, expectedClassNames.length, `actualClassNames.length, `actualClassNames.length #${++assertionCount}, actual=${actualClassNames.join(' ')}, expected=${expectedClassNames.join(' ')}``);
//                         for (const expectedClassName of expectedClassNames) {
//                           expect(actualClassNames, `actualClassNames #${++assertionCount}`).to.include(expectedClassName);
//                         }
//                       }
//                     }
//                   )
//                 ]
//               },
//               class {
//                 public static readonly inject: readonly Key[] = [INode];
//                 constructor(public el: Element) {}
//               }
//             );

//             au.app({ host, component });
//             au.start();

//             assert.greaterThanOrEqualTo(assertionCount, 'assertionCount', 12, `assertionCount, 'assertionCount'`);

//             au.stop();
//           });
//         }
//       );
//     });
//   });
// });
