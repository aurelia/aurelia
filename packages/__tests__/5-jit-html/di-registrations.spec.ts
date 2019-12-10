// import { Key } from '@aurelia/kernel';
// import {
//   Aurelia,
//   BindingContext,
//   CustomElement,
//   IViewModel,
//   INode,
//   LifecycleFlags as LF,
//   Scope
// } from '@aurelia/runtime';
// import { TestContext } from '@aurelia/testing';

// describe('DI', function () {
//   function setup() {
//     const ctx = TestContext.createHTMLTestContext();
//     const container = ctx.container;
//     const au = new Aurelia(container);
//     const host = ctx.createElement('div');

//     return { ctx, container, au, host };
//   }

//   describe('can render locally registered types', function () {

//     it('from within the type in which it was registered', function () {
//       const { au, host } = setup();

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo'
//         },
//         class {}
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo></foo>`,
//           dependencies: [Foo]
//         },
//         class {}
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'foo', `host.textContent`);
//     });

//     it('from within a child type of the type in which is was registered', function () {
//       const { au, host } = setup();

//       const Bar = CustomElement.define(
//         {
//           name: 'bar',
//           template: 'bar'
//         },
//         class {}
//       );

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo<bar></bar>'
//         },
//         class {}
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo></foo>`,
//           dependencies: [Foo, Bar]
//         },
//         class {}
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'foobar', `host.textContent`);
//     });

//     it('from within a grandchild type of the type in which is was registered', function () {
//       const { au, host } = setup();

//       const Baz = CustomElement.define(
//         {
//           name: 'baz',
//           template: 'baz'
//         },
//         class {}
//       );

//       const Bar = CustomElement.define(
//         {
//           name: 'bar',
//           template: 'bar<baz></baz>'
//         },
//         class {}
//       );

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo<bar></bar>'
//         },
//         class {}
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo></foo>`,
//           dependencies: [Foo, Bar, Baz]
//         },
//         class {}
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'foobarbaz', `host.textContent`);
//     });

//     it('from within a type whose child has registered it, which is a parent via recursion', function () {
//       const { au, host } = setup();

//       const Bar = CustomElement.define(
//         {
//           name: 'bar',
//           template: 'bar<foo depth.bind="depth + 1"></foo>'
//         },
//         class {
//           public static bindables = {
//             depth: { property: 'depth', attribute: 'depth' }
//           };
//         }
//       );

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo<bar if.bind="depth === 0" depth.bind="depth"></bar>',
//           dependencies: [Bar]
//         },
//         class {
//           public static bindables = {
//             depth: { property: 'depth', attribute: 'depth' }
//           };
//         }
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `<foo depth.bind="depth"></foo>`,
//           dependencies: [Foo]
//         },
//         class {
//           public depth: number = 0;
//         }
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'foobarfoo', `host.textContent`);
//     });
//   });

//   describe('can resolve locally registered types', function () {

//     it('from within the type in which it was registered', function () {
//       const { au, host } = setup();

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo'
//         },
//         class {}
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `app`,
//           dependencies: [Foo]
//         },
//         class {
//           public node: INode;
//           public child: IViewModel;
//           constructor(node: INode) {
//             this.node = node;
//           }

//           public binding(this: IViewModel & this): void {
//             this.child = this.$context.get<IViewModel>('au:resource:custom-element:foo');
//             this.child.$hydrate(LF.none, this.$context, this.node);
//             this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
//           }

//           public attaching(): void {
//             this.child.$attach(LF.none);
//           }
//         }
//       );

//       const component = new App(host);
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'fooapp', `host.textContent`);
//     });

//     it('from within a child type of the type in which is was registered', function () {
//       const { au, host } = setup();

//       const Bar = CustomElement.define(
//         {
//           name: 'bar',
//           template: 'bar'
//         },
//         class {}
//       );

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo'
//         },
//         class {
//           public static readonly inject: readonly Key[] = [INode];
//           public node: INode;
//           public child: IViewModel;
//           constructor(node: INode) {
//             this.node = node;
//           }

//           public binding(this: IViewModel & this): void {
//             this.child = this.$context.get<IViewModel>('au:resource:custom-element:bar');
//             this.child.$hydrate(LF.none, this.$context, this.node);
//             this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
//           }

//           public attaching(): void {
//             this.child.$attach(LF.none);
//           }
//         }
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `app<foo></foo>`,
//           dependencies: [Foo, Bar]
//         },
//         class {}
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'appbarfoo', `host.textContent`);
//     });

//     it('from within a grandchild type of the type in which is was registered', function () {
//       const { au, host } = setup();

//       const Baz = CustomElement.define(
//         {
//           name: 'baz',
//           template: 'baz'
//         },
//         class {}
//       );

//       const Bar = CustomElement.define(
//         {
//           name: 'bar',
//           template: 'bar'
//         },
//         class {
//           public static readonly inject: readonly Key[] = [INode];
//           public node: INode;
//           public child: IViewModel;
//           constructor(node: INode) {
//             this.node = node;
//           }

//           public binding(this: IViewModel & this): void {
//             this.child = this.$context.get<IViewModel>('au:resource:custom-element:baz');
//             this.child.$hydrate(LF.none, this.$context, this.node);
//             this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
//           }

//           public attaching(): void {
//             this.child.$attach(LF.none);
//           }
//         }
//       );

//       const Foo = CustomElement.define(
//         {
//           name: 'foo',
//           template: 'foo<bar></bar>'
//         },
//         class {}
//       );

//       const App = CustomElement.define(
//         {
//           name: 'app',
//           template: `app<foo></foo>`,
//           dependencies: [Foo, Bar, Baz]
//         },
//         class {}
//       );

//       const component = new App();
//       au.app({ host, component });
//       au.start();

//       assert.strictEqual(host.textContent, 'appfoobazbar', `host.textContent`);
//     });
//   });
// });
