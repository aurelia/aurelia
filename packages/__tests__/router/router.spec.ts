// import { DebugConfiguration } from '@aurelia/debug';
// import { PLATFORM } from '@aurelia/kernel';
// import { IRouter, RouterConfiguration, IRoute } from '@aurelia/router';
// import { Aurelia, CustomElement, customElement, IScheduler } from '@aurelia/runtime';
// import { assert, TestContext } from '@aurelia/testing';
// import { TestRouterConfiguration } from './configuration';

// describe('Router', function () {
//   function spyNavigationStates(
//     router: IRouter,
//     spy: (type: 'push' | 'replace', data: {}, title: string, path: string) => void,
//   ) {
//     let _pushState;
//     let _replaceState;
//     if (spy) {
//       _pushState = router['history'].pushState;
//       router['history'].pushState = function (data, title, path) {
//         spy('push', data, title, path);
//         _pushState.call(router['history'], data, title, path);
//       };
//       _replaceState = router['history'].replaceState;
//       router['history'].replaceState = function (data, title, path) {
//         spy('replace', data, title, path);
//         _replaceState.call(router['history'], data, title, path);
//       };
//     }
//     return { _pushState, _replaceState };
//   }
//   function unspyNavigationStates(
//     router: IRouter,
//     _push?: (data: {}, title: string, path: string) => void,
//     _replace?: (data: {}, title: string, path: string) => void,
//   ) {
//     if (_push) {
//       router['history'].pushState = _push;
//       router['history'].replaceState = _replace;
//     }
//   }

//   async function createFixture(config?, App?, stateSpy?) {
//     const ctx = TestContext.createHTMLTestContext();
//     const { container, scheduler } = ctx;
//     container.register(TestRouterConfiguration.for(ctx));

//     if (App === void 0) {
//       App = CustomElement.define({ name: 'app', template: '<template>left<au-viewport name="left"></au-viewport>right<au-viewport name="right"></au-viewport></template>' });
//     }
//     const Foo = CustomElement.define({ name: 'foo', template: '<template>Viewport: foo <a href="baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
//     const Bar = CustomElement.define({ name: 'bar', template: `<template>Viewport: bar Parameter id: [\${id}] Parameter name: [\${name}] <au-viewport name="bar"></au-viewport></template>` }, class {
//       public static parameters = ['id', 'name'];
//       public id = 'no id';
//       public name = 'no name';

//       // public static inject = [IRouter];
//       // public constructor(private readonly router: IRouter) { }
//       // public created() {
//       //   console.log('created', 'closest viewport', this.router.getClosestViewport(this));
//       // }
//       // public canEnter() {
//       //   console.log('canEnter', 'closest viewport', this.router.getClosestViewport(this));
//       //   return true;
//       // }
//       public enter(params) {
//         // console.log('enter', 'closest viewport', this.router.getClosestViewport(this));
//         if (params.id) { this.id = params.id; }
//         if (params.name) { this.name = params.name; }
//       }
//       // public binding() {
//       //   console.log('binding', 'closest viewport', this.router.getClosestViewport(this));
//       // }
//     });
//     const Baz = CustomElement.define({ name: 'baz', template: `<template>Viewport: baz Parameter id: [\${id}] <au-viewport name="baz"></au-viewport></template>` }, class {
//       public static parameters = ['id'];
//       public id = 'no id';
//       public enter(params) { if (params.id) { this.id = params.id; } }
//     });
//     const Qux = CustomElement.define({ name: 'qux', template: '<template>Viewport: qux<au-viewport name="qux"></au-viewport></template>' }, class {
//       public canEnter() { return true; }
//       public canLeave() {
//         if (quxCantLeave > 0) {
//           quxCantLeave--;
//           return false;
//         } else {
//           return true;
//         }
//       }
//       public enter() { return true; }
//       public leave() { return true; }
//     });
//     const Quux = CustomElement.define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
//     const Corge = CustomElement.define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport>Viewport: dummy<au-viewport name="dummy"></au-viewport></template>' });

//     const Uier = CustomElement.define({ name: 'uier', template: '<template>Viewport: uier</template>' }, class {
//       public async canEnter() {
//         await wait(500);
//         return true;
//       }
//     });

//     const Grault = CustomElement.define(
//       {
//         name: 'grault', template: '<template><input type="checkbox" checked.two-way="toggle">toggle<div if.bind="toggle">Viewport: grault<au-viewport name="grault" stateful used-by="garply,corge" default="garply"></au-viewport></div></template>'
//       },
//       class {
//         public toggle = false;
//       });
//     const Garply = CustomElement.define(
//       {
//         name: 'garply', template: '<template>garply<input checked.two-way="text">text</template>'
//       },
//       class {
//         public text;
//       });
//     const Waldo = CustomElement.define(
//       {
//         name: 'waldo', template: '<template>Viewport: waldo<au-viewport name="waldo" stateful used-by="grault,foo" default="grault"></au-viewport></div></template>'
//       },
//       class { });
//     const Plugh = CustomElement.define(
//       {
//         name: 'plugh', template: `<template>Parameter: \${param} Entry: \${entry}</template>`
//       },
//       class {
//         public param: number;
//         public entry: number = 0;
//         public reentryBehavior: string = 'default';
//         public enter(params) {
//           this.param = +params[0];
//           this.entry++;
//           this.reentryBehavior = plughReentryBehavior;
//         }
//       });

//     const host = ctx.doc.createElement('div');
//     ctx.doc.body.appendChild(host as any);

//     const au = new Aurelia(container)
//       .register(
//         DebugConfiguration,
//         !config ? RouterConfiguration : RouterConfiguration.customize(config),
//         App)
//       .app({ host: host, component: App });

//     const router = container.get(IRouter);
//     const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

//     container.register(Foo, Bar, Baz, Qux, Quux, Corge, Uier, Grault, Garply, Waldo, Plugh);

//     await au.start().wait();

//     async function tearDown() {
//       unspyNavigationStates(router, _pushState, _replaceState);
//       router.deactivate();
//       await au.stop().wait();
//       ctx.doc.body.removeChild(host);
//     }

//     return { au, container, scheduler, host, router, ctx, tearDown };
//   }

//   it('can be created', async function () {
//     const { router, tearDown } = await createFixture();

//     await tearDown();
//   });

//   it('loads viewports left and right', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     assert.includes(host.textContent, 'left', `host.textContent`);
//     assert.includes(host.textContent, 'right', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates to foo in left', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'foo', `host.textContent`);

//     await tearDown();
//   });

//   it('queues navigations', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     router.goto('uier@left').catch((error) => { throw error; });
//     await router.goto('bar@left');
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('clears viewport', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'foo', `host.textContent`);
//     await $goto('-@left', router, scheduler);
//     assert.notIncludes(host.textContent, 'foo', `host.textContent`);

//     await tearDown();
//   });

//   it('clears all viewports', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     await $goto('bar@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     await $goto('-', router, scheduler);
//     assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('replaces foo in left', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     const historyLength = router['history'].length;
//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'foo', `host.textContent`);
//     assert.strictEqual(router['history'].length, historyLength + 1, `router.navigation.history.length`);

//     await router.goto('bar@left', { replace: true });

//     assert.includes(host.textContent, 'bar', `host.textContent`);
//     assert.strictEqual(router['history'].length, historyLength + 1, `router.navigation.history.length`);

//     await tearDown();
//   });

//   it('navigates to bar in right', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar@right', router, scheduler);
//     assert.includes(host.textContent, 'bar', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates to foo in left then bar in right', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await $goto('bar@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('reloads state when refresh method is called', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await $goto('bar@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await router.refresh();
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates back and forward with one viewport', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await $goto('bar@left', router, scheduler);
//     assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await router.back();

//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await router.forward();

//     assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates back and forward with two viewports', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await $goto('bar@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await router.back();

//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await router.forward();

//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates to foo/bar in left/right', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left+bar@right', router, scheduler);
//     assert.includes(host.textContent, 'foo', `host.textContent`);
//     assert.includes(host.textContent, 'bar', `host.textContent`);

//     await tearDown();
//   });

//   it('cancels if not canLeave', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     quxCantLeave = 1;

//     await $goto('baz@left+qux@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

//     await $goto('foo@left+bar@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

//     await tearDown();
//   });

//   it('cancels if not child canLeave', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     quxCantLeave = 1;

//     await $goto('foo@left/qux@foo+uier@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: uier', `host.textContent`);

//     await $goto('bar@left+baz@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: uier', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: baz', `host.textContent`);

//     await tearDown();
//   });

//   it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     // await $goto('foo@left+bar@right+baz@foo+qux@bar', router, scheduler);
//     await $goto('foo@left/baz@foo+bar@right/qux@bar', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

//     await tearDown();
//   });

//   it('handles anchor click', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture({ useHref: true });

//     await $goto('foo@left', router, scheduler);
//     assert.includes(host.textContent, 'foo', `host.textContent`);

//     (host.getElementsByTagName('SPAN')[0] as HTMLElement).parentElement.click();

//     await scheduler.yieldAll();

//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

//     await tearDown();
//   });

//   it('handles anchor click with goto', async function () {
//     const tests = [
//       { bind: false, value: 'id-name(1)', result: 1 },
//       { bind: true, value: "'id-name(2)'", result: 2 },
//       { bind: true, value: "{ component: 'id-name', parameters: '3' }", result: 3 },
//       { bind: true, value: "{ component: IdName, parameters: '4' }", result: 4 },
//     ];

//     const IdName = CustomElement.define({ name: 'id-name', template: `|id-name| Parameter id: [\${id}] Parameter name: [\${name}]` }, class {
//       public static parameters = ['id', 'name'];
//       public id = 'no id';
//       public name = 'no name';
//       public enter(params) {
//         if (params.id) { this.id = params.id; }
//         if (params.name) { this.name = params.name; }
//       }
//     });
//     @customElement({
//       name: 'app',
//       dependencies: [IdName],
//       template: `
//       ${tests.map(test => `<a goto${test.bind ? '.bind' : ''}="${test.value}">${test.value}</a>`).join('<br>')}
//       <br>
//       <au-viewport></au-viewport>
//       `}) class App {
//       // Wish the following two lines weren't necessary
//       public constructor() { this['IdName'] = IdName; }
//     }

//     const { host, router, container, tearDown, scheduler } = await createFixture({ useHref: false }, App);

//     container.register(IdName);

//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];

//       (host.getElementsByTagName('A')[i] as HTMLElement).click();

//       await scheduler.yieldAll();

//       assert.includes(host.textContent, '|id-name|', `host.textContent`);
//       assert.includes(host.textContent, `Parameter id: [${test.result}]`, `host.textContent`);

//       await router.back();
//       assert.notIncludes(host.textContent, '|id-name|', `host.textContent`);
//     }

//     await tearDown();
//   });

//   it('understands used-by', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('corge@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

//     await $goto('corge@left/baz', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

//     await tearDown();
//   });

//   it('does not update fullStatePath on wrong history entry', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('foo@left', router, scheduler);
//     await $goto('bar@left', router, scheduler);
//     await $goto('baz@left', router, scheduler);

//     await tearDown();
//   });

//   it('parses parameters after component', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await $goto('bar(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses named parameters after component', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(id=123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await $goto('bar(id=456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses parameters after component individually', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await $goto('bar(456)@right', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses parameters without viewport', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('corge@left/baz(123)', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses named parameters without viewport', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('corge@left/baz(id=123)', router, scheduler);

//     assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses multiple parameters after component', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(123,OneTwoThree)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

//     await $goto('bar(456,FourFiveSix)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses multiple name parameters after component', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(id=123,name=OneTwoThree)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

//     await $goto('bar(name=FourFiveSix,id=456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

//     await tearDown();
//   });

//   it('parses querystring', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar@left?id=123', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

//     await $goto('bar@left?id=456&name=FourFiveSix', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

//     await tearDown();
//   });

//   it('overrides querystring with parameter', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('bar(456)@left?id=123', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

//     await $goto('bar(456,FourFiveSix)@left?id=123&name=OneTwoThree', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

//     await $goto('bar(name=SevenEightNine,id=789)@left?id=123&name=OneTwoThree', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter id: [789]', `host.textContent`);
//     assert.includes(host.textContent, 'Parameter name: [SevenEightNine]', `host.textContent`);

//     await tearDown();
//   });

//   it('uses default reentry behavior', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('plugh(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     await $goto('plugh(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     await $goto('plugh(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     await $goto('plugh(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     await tearDown();
//   });

//   it('uses overriding reentry behavior', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
//     await $goto('plugh(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     plughReentryBehavior = 'refresh'; // Affects navigation AFTER this one
//     await $goto('plugh(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

//     plughReentryBehavior = 'default'; // Affects navigation AFTER this one
//     await $goto('plugh(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
//     await $goto('plugh(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

//     plughReentryBehavior = 'disallow'; // Affects navigation AFTER this one
//     await $goto('plugh(123)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

//     plughReentryBehavior = 'default'; // Affects navigation AFTER this one
//     await $goto('plugh(456)@left', router, scheduler);
//     assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
//     assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

//     await tearDown();
//   });

//   it('loads default when added by if condition becoming true', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('grault@left', router, scheduler);
//     assert.includes(host.textContent, 'toggle', `host.textContent #1`);
//     assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent #2`);
//     assert.notIncludes(host.textContent, 'garply', `host.textContent #3`);

//     (host as any).getElementsByTagName('INPUT')[0].click();

//     await scheduler.yieldAll();

//     assert.includes(host.textContent, 'Viewport: grault', `host.textContent #4`);
//     assert.includes(host.textContent, 'garply', `host.textContent #5`);

//     (host as any).getElementsByTagName('INPUT')[0].click();

//     await scheduler.yieldAll();

//     assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent #6`);
//     assert.notIncludes(host.textContent, 'garply', `host.textContent #7`);

//     (host as any).getElementsByTagName('INPUT')[0].click();

//     await scheduler.yieldAll();
//     await wait(50);

//     assert.includes(host.textContent, 'Viewport: grault', `host.textContent #8`);
//     assert.includes(host.textContent, 'garply', `host.textContent #9`);

//     await tearDown();
//   });

//   if (PLATFORM.isBrowserLike) {
//     // TODO: figure out why this works in nodejs locally but not in CI and fix it
//     it.skip('keeps input when stateful', async function () {
//       const { scheduler, host, router, tearDown } = await createFixture();

//       await $goto('grault@left', router, scheduler);
//       assert.includes(host.textContent, 'toggle', `host.textContent`);
//       assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
//       assert.notIncludes(host.textContent, 'garply', `host.textContent`);

//       (host as any).getElementsByTagName('INPUT')[0].click();

//       await scheduler.yieldAll();

//       assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
//       assert.includes(host.textContent, 'garply', `host.textContent`);

//       (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

//       await scheduler.yieldAll();

//       // NOT going to work since it loads non-stateful parent grault
//       await $goto('grault@left/corge@grault', router, scheduler);

//       assert.notIncludes(host.textContent, 'garply', `host.textContent`);
//       assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

//       await $goto('grault@left/garply@grault', router, scheduler);

//       assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
//       assert.includes(host.textContent, 'garply', `host.textContent`);

//       assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

//       await tearDown();
//     });
//   }
//   it.skip('keeps input when grandparent stateful', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('waldo@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: waldo', `host.textContent`);
//     assert.includes(host.textContent, 'toggle', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
//     assert.notIncludes(host.textContent, 'garply', `host.textContent`);

//     (host as any).getElementsByTagName('INPUT')[0].click();

//     await scheduler.yieldAll();

//     assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
//     assert.includes(host.textContent, 'garply', `host.textContent`);

//     (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

//     await $goto('waldo@left/foo@waldo', router, scheduler);

//     assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

//     await $goto('waldo@left/grault@waldo', router, scheduler);

//     assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
//     assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
//     assert.includes(host.textContent, 'garply', `host.textContent`);

//     assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

//     await tearDown();
//   });

//   it.skip('keeps children\'s custom element\'s input when navigation history stateful', async function () {
//     const { scheduler, host, router, tearDown, container } = await createFixture({ statefulHistoryLength: 2 });

//     const GrandGrandChild = CustomElement.define({ name: 'grandgrandchild', template: '|grandgrandchild|<input>' }, null);
//     const GrandChild = CustomElement.define({ name: 'grandchild', template: '|grandchild|<input> <grandgrandchild></grandgrandchild>', dependencies: [GrandGrandChild] }, null);
//     const Child = CustomElement.define({ name: 'child', template: '|child|<input> <input type="checkbox" checked.bind="toggle"> <div if.bind="toggle"><input> <au-viewport name="child"></au-viewport></div>', dependencies: [GrandChild] }, class { public toggle = true; });
//     const ChildSibling = CustomElement.define({ name: 'sibling', template: '|sibling|' }, null);
//     const Parent = CustomElement.define({ name: 'parent', template: '<br><br>|parent|<input> <au-viewport name="parent"></au-viewport>', dependencies: [Child, ChildSibling] }, null);
//     container.register(Parent);

//     const values = ['parent', 'child', false, 'child-hidden', 'grandchild', 'grandgrandchild'];

//     await $goto('parent@left/child@parent/grandchild@child', router, scheduler);

//     assert.includes(host.textContent, '|parent|', `host.textContent`);
//     assert.includes(host.textContent, '|child|', `host.textContent`);
//     assert.includes(host.textContent, '|grandchild|', `host.textContent`);
//     assert.includes(host.textContent, '|grandgrandchild|', `host.textContent`);

//     let inputs = host.getElementsByTagName('INPUT') as HTMLCollectionOf<HTMLInputElement>;
//     for (let i = 0; i < inputs.length; i++) {
//       if (typeof values[i] === 'string') {
//         inputs[i].value = values[i] as string;
//       }
//     }
//     for (let i = 0; i < inputs.length; i++) {
//       if (typeof values[i] === 'string') {
//         assert.strictEqual(inputs[i].value, values[i], `host.getElementsByTagName('INPUT')[${i}].value`);
//       }
//     }

//     await $goto('parent@left/sibling@parent', router, scheduler);

//     assert.includes(host.textContent, '|parent|', `host.textContent`);
//     assert.includes(host.textContent, '|sibling|', `host.textContent`);
//     assert.notIncludes(host.textContent, '|child|', `host.textContent`);
//     assert.notIncludes(host.textContent, '|grandchild|', `host.textContent`);
//     assert.notIncludes(host.textContent, '|grandgrandchild|', `host.textContent`);

//     await router.back();

//     assert.includes(host.textContent, '|parent|', `host.textContent`);
//     assert.includes(host.textContent, '|child|', `host.textContent`);
//     assert.includes(host.textContent, '|grandchild|', `host.textContent`);
//     assert.includes(host.textContent, '|grandgrandchild|', `host.textContent`);
//     assert.notIncludes(host.textContent, '|sibling|', `host.textContent`);

//     inputs = inputs = host.getElementsByTagName('INPUT') as HTMLCollectionOf<HTMLInputElement>;
//     for (let i = 0; i < inputs.length; i++) {
//       if (typeof values[i] === 'string') {
//         assert.strictEqual(inputs[i].value, values[i], `host.getElementsByTagName('INPUT')[${i}].value`);
//       }
//     }

//     await tearDown();
//   });

//   // TODO: Fix scoped viewports!
//   it.skip('loads scoped viewport', async function () {
//     const { scheduler, host, router, tearDown } = await createFixture();

//     await $goto('quux@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

//     await $goto('quux@quux!', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

//     await $goto('quux@left/foo@quux!', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

//     (host.getElementsByTagName('SPAN')[0] as HTMLElement).click();

//     await scheduler.yieldAll();

//     assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

//     await $goto('bar@left', router, scheduler);
//     assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
//     assert.notIncludes(host.textContent, 'Viewport: quux', `host.textContent`);

//     await tearDown();
//   });

//   describe('local deps', function () {
//     async function $setup(dependencies: any[] = [], stateSpy?) {
//       const ctx = TestContext.createHTMLTestContext();

//       const { container, scheduler } = ctx;
//       container.register(TestRouterConfiguration.for(ctx));

//       const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

//       const host = ctx.doc.createElement('div');
//       ctx.doc.body.appendChild(host as any);
//       const component = new App();

//       const au = new Aurelia(container)
//         .register(DebugConfiguration, RouterConfiguration)
//         .app({ host: host, component: App });

//       const router = container.get(IRouter);

//       await au.start().wait();

//       async function $teardown() {
//         await au.stop().wait();
//         ctx.doc.body.removeChild(host);
//         router.deactivate();
//       }

//       return { ctx, container, scheduler, host, component, au, router, $teardown };
//     }

//     it('verify that the test isn\'t broken', async function () {
//       const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
//       const Global = CustomElement.define({ name: 'global', template: 'global' }, null);
//       const { scheduler, container, host, router, $teardown } = await $setup([Local]);

//       container.register(Global);

//       await $goto('global', router, scheduler);

//       assert.match(host.textContent, /.*global.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep', async function () {
//       const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
//       const { scheduler, host, router, $teardown } = await $setup([Local]);

//       await $goto('local', router, scheduler);

//       assert.match(host.textContent, /.*local.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - nested', async function () {
//       const Local2 = CustomElement.define({ name: 'local2', template: 'local2' }, class { });
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
//       const { scheduler, host, router, $teardown } = await $setup([Local1]);

//       await $goto('local1/local2', router, scheduler);

//       assert.match(host.textContent, /.*local1.*local2.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - double nested - case #1', async function () {
//       const Global3 = CustomElement.define({ name: 'global3', template: 'global3' }, null);
//       const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
//       const { scheduler, host, router, container, $teardown } = await $setup([Local1]);
//       container.register(Global3);

//       await $goto('local1/local2/global3', router, scheduler);

//       assert.match(host.textContent, /.*local1.*local2.*global3.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - double nested - case #2', async function () {
//       const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
//       const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
//       const { scheduler, host, router, container, $teardown } = await $setup([Local1]);
//       container.register(Global2);

//       await $goto('local1/global2/local3', router, scheduler);

//       assert.match(host.textContent, /.*local1.*global2.*local3.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - double nested - case #3', async function () {
//       const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
//       const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
//       const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
//       const { scheduler, host, router, container, $teardown } = await $setup();
//       container.register(Global1);

//       await $goto('global1/local2/local3', router, scheduler);

//       assert.match(host.textContent, /.*global1.*local2.*local3.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - double nested - case #4', async function () {
//       const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
//       const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
//       const { scheduler, host, router, $teardown } = await $setup([Local1]);

//       await $goto('local1/local2/local3', router, scheduler);

//       assert.match(host.textContent, /.*local1.*local2.*local3.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
//       const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
//       const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
//       const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
//       const { scheduler, host, router, $teardown } = await $setup([Local1, Local2]);

//       await $goto('local1@default/conflict@one', router, scheduler);

//       assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

//       await $goto('local2@default/conflict@two', router, scheduler);

//       assert.match(host.textContent, /.*local2.*conflict2.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
//       const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
//       const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
//       const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
//       const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
//       const { scheduler, host, router, container, $teardown } = await $setup();
//       container.register(Global1, Global2);

//       await $goto('global1@default/conflict@one', router, scheduler);

//       assert.match(host.textContent, /.*global1.*conflict1.*/, `host.textContent`);

//       await $goto('global2@default/conflict@two', router, scheduler);

//       assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

//       await $teardown();
//     });

//     it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
//       const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
//       const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
//       const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
//       const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
//       const { scheduler, host, router, container, $teardown } = await $setup([Local1]);
//       container.register(Global2);

//       await $goto('local1@default/conflict@one', router, scheduler);

//       assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

//       await $goto('global2@default/conflict@two', router, scheduler);

//       assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

//       await $teardown();
//     });

//     describe('navigates to locally registered dep recursively', function () {
//       interface RouteSpec {
//         segments: string[];
//         texts: string[];
//       }
//       const routeSpecs: RouteSpec[] = [
//         {
//           segments: ['global1', 'conflict'],
//           texts: ['global1', 'conflict1']
//         },
//         {
//           // note: custom elements always have themselves registered in their own $context, so should be able to navigate to self without registering anywhere
//           segments: ['global1', 'conflict', 'conflict'],
//           texts: ['global1', 'conflict1', 'conflict1']
//         },
//         {
//           segments: ['local2', 'conflict'],
//           texts: ['local2', 'conflict2']
//         },
//         {
//           segments: ['local2', 'conflict', 'conflict'],
//           texts: ['local2', 'conflict2', 'conflict2']
//         },
//         {
//           segments: ['local2', 'global1', 'conflict'],
//           texts: ['local2', 'global1', 'conflict1']
//         },
//         {
//           segments: ['local2', 'global1', 'conflict', 'conflict'],
//           texts: ['local2', 'global1', 'conflict1', 'conflict1']
//         },
//         {
//           segments: ['local2', 'local2', 'conflict', 'conflict'],
//           texts: ['local2', 'local2', 'conflict2', 'conflict2']
//         },
//         {
//           segments: ['local2', 'conflict', 'global1', 'conflict'],
//           texts: ['local2', 'conflict2', 'global1', 'conflict1']
//         },
//         {
//           segments: ['local2', 'conflict', 'local2', 'conflict'],
//           texts: ['local2', 'conflict2', 'local2', 'conflict2']
//         }
//       ];

//       for (const routeSpec of routeSpecs) {
//         const { segments, texts } = routeSpec;
//         const path = segments.join('/');
//         const expectedText = new RegExp(`.*${texts.join('.*')}.*`);

//         it(`path: ${path}, expectedText: ${expectedText}`, async function () {
//           const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
//           const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
//           const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
//           const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
//           const { scheduler, host, router, container, $teardown } = await $setup([Local2]);
//           container.register(Global1);

//           await $goto(path, router, scheduler);

//           assert.match(host.textContent, expectedText, `host.textContent`);

//           await $teardown();
//         });
//       }
//     });
//   });

//   describe('can define fallback component', function () {
//     async function $setup(App, config?, stateSpy?) {
//       const ctx = TestContext.createHTMLTestContext();

//       const { container, scheduler } = ctx;
//       container.register(TestRouterConfiguration.for(ctx));

//       const host = ctx.doc.createElement('div');
//       ctx.doc.body.appendChild(host as any);

//       const au = new Aurelia(container)
//         .register(
//           DebugConfiguration,
//           !config ? RouterConfiguration : RouterConfiguration.customize(config),
//           App)
//         .app({ host: host, component: App });

//       const router = container.get(IRouter);
//       const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

//       await au.start().wait();

//       async function $teardown() {
//         unspyNavigationStates(router, _pushState, _replaceState);
//         router.deactivate();
//         await au.stop().wait();
//         ctx.doc.body.removeChild(host);
//       }

//       return { ctx, container, scheduler, host, au, router, $teardown };
//     }

//     const names = ['parent', 'child', 'grandchild'];
//     const dependencies = [];
//     for (let i = 0, ii = names.length; i < ii; i++) {
//       const name = names[i];
//       const fallback = i < ii - 1 ? names[i + 1] : null;
//       const viewport = fallback ? `<au-viewport name="${name}"${fallback ? ` fallback="${fallback}"` : ''}></au-viewport>` : '';
//       const template = `!${name}\${param ? ":" + param : ""}!${viewport}`;
//       dependencies.push(CustomElement.define({ name, template }, class {
//         public static parameters = ['id'];
//         public param: string;
//         public enter(params) {
//           if (params.id !== void 0) {
//             this.param = params.id;
//           }
//         }
//       }));
//     }

//     const App = CustomElement.define({
//       name: 'app',
//       template: '<au-viewport fallback="parent"></au-viewport>',
//       dependencies
//     });

//     const tests = [
//       { path: 'parent(a)@default', result: '!parent:a!', url: 'a' },
//       { path: 'b@default', result: '!parent:b!', url: 'b' },
//       { path: 'parent(c)@default/child(d)@parent', result: '!parent:c!!child:d!', url: 'c/d' },
//       { path: 'e@default/f@parent', result: '!parent:e!!child:f!', url: 'e/f' },
//       { path: 'parent(g)@default/child(h)@parent/grandchild(i)@child', result: '!parent:g!!child:h!!grandchild:i!', url: 'g/h/i' },
//       { path: 'j@default/k@parent/l@child', result: '!parent:j!!child:k!!grandchild:l!', url: 'j/k/l' },
//     ];

//     for (const test of tests) {
//       it(`to load route ${test.path} => ${test.url}`, async function () {
//         let locationPath: string;
//         const { scheduler, container, host, router, $teardown } = await $setup(App, void 0, (type, data, title, path) => {
//           locationPath = path;
//         });
//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
//         await $teardown();
//       });
//     }
//     it(`to load above routes in sequence`, async function () {
//       let locationPath: string;
//       const { scheduler, container, host, router, $teardown } = await $setup(App, void 0, (type, data, title, path) => {
//         locationPath = path;
//       });
//       for (const test of tests) {
//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
//       }
//       await $teardown();
//     });

//     for (const test of tests) {
//       const path = test.path.replace(/@\w+/g, '');
//       const url = test.url.replace(/@\w+/g, '');
//       it(`to load route ${path} => ${url}`, async function () {
//         let locationPath: string;
//         const { scheduler, container, host, router, $teardown } = await $setup(App, void 0, (type, data, title, path) => {
//           locationPath = path;
//         });
//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');
//         await $teardown();
//       });
//     }
//     it(`to load above routes in sequence`, async function () {
//       let locationPath: string;
//       const { scheduler, container, host, router, $teardown } = await $setup(App, void 0, (type, data, title, path) => {
//         locationPath = path;
//       });
//       for (const test of tests) {
//         const path = test.path.replace(/@\w+/g, '');
//         const url = test.url.replace(/@\w+/g, '');
//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');
//       }
//       await $teardown();
//     });
//   });

//   describe('can use configuration', function () {
//     async function $setup(config?, dependencies: any[] = [], routes: IRoute[] = [], stateSpy?) {
//       const ctx = TestContext.createHTMLTestContext();

//       const { container, scheduler } = ctx;
//       container.register(TestRouterConfiguration.for(ctx));

//       const App = CustomElement.define({
//         name: 'app',
//         template: '<au-viewport></au-viewport>',
//         dependencies
//       }, class {
//         public static routes: IRoute[] = routes;
//       });

//       const host = ctx.doc.createElement('div');
//       ctx.doc.body.appendChild(host as any);

//       const au = new Aurelia(container)
//         .register(
//           DebugConfiguration,
//           !config ? RouterConfiguration : RouterConfiguration.customize(config),
//           App)
//         .app({ host: host, component: App });

//       const router = container.get(IRouter);
//       const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

//       await au.start().wait();

//       async function $teardown() {
//         unspyNavigationStates(router, _pushState, _replaceState);
//         router.deactivate();
//         await au.stop().wait();
//         ctx.doc.body.removeChild(host);
//       }

//       return { ctx, container, scheduler, host, au, router, $teardown, App };
//     }

//     function $removeViewport(instructions) {
//       for (const instruction of instructions) {
//         instruction.viewport = null;
//         instruction.viewportName = null;
//         if (Array.isArray(instruction.nextScopeInstructions)) {
//           $removeViewport(instruction.nextScopeInstructions);
//         }
//       }
//     }

//     const Parent = CustomElement.define({ name: 'parent', template: '!parent!<au-viewport name="parent"></au-viewport>' }, class {
//       public static routes: IRoute[] = [
//         { path: 'child-config', instructions: [{ component: 'child', viewport: 'parent' }] },
//       ];
//     });
//     const Parent2 = CustomElement.define({ name: 'parent2', template: '!parent2!<au-viewport name="parent2"></au-viewport>' }, class {
//       public static routes: IRoute[] = [
//         { path: 'child-config', instructions: [{ component: 'child', viewport: 'parent2' }] },
//         // { path: ':id', instructions: [{ component: 'child', viewport: 'parent' }] },
//       ];
//     });
//     const Child = CustomElement.define({ name: 'child', template: `!child\${param ? ":" + param : ""}!<au-viewport name="child"></au-viewport>` }, class {
//       public static routes: IRoute[] = [
//         { path: 'grandchild-config', instructions: [{ component: 'grandchild', viewport: 'child' }] },
//       ];
//       public param: string;
//       public enter(params) {
//         if (params.id !== void 0) {
//           this.param = params.id;
//         }
//       }
//     });
//     const Child2 = CustomElement.define({ name: 'child2', template: `!child2\${param ? ":" + param : ""}!<au-viewport name="child2"></au-viewport>` }, class {
//       public static routes: IRoute[] = [
//         { path: 'grandchild-config', instructions: [{ component: 'grandchild', viewport: 'child2' }] },
//       ];
//       public static parameters = ['id'];
//       public param: string;
//       public enter(params) {
//         if (params.id !== void 0) {
//           this.param = params.id;
//         }
//       }
//     });

//     const Grandchild = CustomElement.define({ name: 'grandchild', template: '!grandchild!' });
//     const Grandchild2 = CustomElement.define({ name: 'grandchild2', template: '!grandchild2!' });

//     const tests = [
//       { path: '/parent-config', result: '!parent!', url: 'parent-config' },
//       { path: '/parent2@default', result: '!parent2!', url: 'parent2' },

//       { path: '/parent-config/child-config', result: '!parent!!child!', url: 'parent-config/child-config' },
//       { path: '/parent2@default/child2@parent2', result: '!parent2!!child2!', url: 'parent2/child2' },

//       { path: '/parent-config/child2@parent', result: '!parent!!child2!', url: 'parent-config/child2@parent' }, // Specific config
//       { path: '/parent2@default/child-config', result: '!parent2!!child!', url: 'parent2/child-config' },

//       { path: '/parent-config/child-config/grandchild-config', result: '!parent!!child!!grandchild!', url: 'parent-config/child-config/grandchild-config' },
//       { path: '/parent2@default/child2@parent2/grandchild2@child2', result: '!parent2!!child2!!grandchild2!', url: 'parent2/child2/grandchild2' },

//       { path: '/parent-config/child-config/grandchild2@child', result: '!parent!!child!!grandchild2!', url: 'parent-config/child-config/grandchild2' },
//       { path: '/parent2@default/child2@parent2/grandchild-config', result: '!parent2!!child2!!grandchild!', url: 'parent2/child2/grandchild-config' },

//       { path: '/parent-config/child2@parent/grandchild-config', result: '!parent!!child2!!grandchild!', url: 'parent-config/child2@parent/grandchild-config' }, // Specific config
//       { path: '/parent2@default/child-config/grandchild2@child', result: '!parent2!!child!!grandchild2!', url: 'parent2/child-config/grandchild2' },

//       { path: '/parent-config/child2@parent/grandchild2@child2', result: '!parent!!child2!!grandchild2!', url: 'parent-config/child2@parent/grandchild2' }, // Specific config
//       { path: '/parent2@default/child-config/grandchild-config', result: '!parent2!!child!!grandchild!', url: 'parent2/child-config/grandchild-config' },

//       { path: '/parent-config/abc', result: '!parent!!child:abc!', url: 'parent-config/abc' },
//       { path: '/parent2@default/child2(abc)@parent2', result: '!parent2!!child2:abc!', url: 'parent2/child2(abc)' },

//       // { path: '/parent-config/child2(abc)@parent', result: '!parent!!child2:abc!' },
//       // { path: '/parent2@default/abc', result: '!parent2!!child:abc!' },

//       { path: '/parent-config/abc/grandchild-config', result: '!parent!!child:abc!!grandchild!', url: 'parent-config/abc/grandchild-config' },
//       { path: '/parent2@default/child2(abc)@parent2/grandchild2@child2', result: '!parent2!!child2:abc!!grandchild2!', url: 'parent2/child2(abc)/grandchild2' },

//       { path: '/parent-config/abc/grandchild2@child', result: '!parent!!child:abc!!grandchild2!', url: 'parent-config/abc/grandchild2' },
//       { path: '/parent2@default/child2(abc)@parent2/grandchild-config', result: '!parent2!!child2:abc!!grandchild!', url: 'parent2/child2(abc)/grandchild-config' },

//       // { path: '/parent-config/child2(abc)@parent/grandchild-config', result: '!parent!!child2:abc!!grandchild!' },
//       // { path: '/parent2@default/abc/grandchild2@child', result: '!parent2!!child:abc!!grandchild2!' },

//       // { path: '/parent-config/child2(abc)@parent/grandchild2@child2', result: '!parent!!child2:abc!!grandchild2!' },
//       // { path: '/parent2@default/abc/grandchild-config', result: '!parent2!!child:abc!!grandchild!' },
//     ];
//     const appDependencies = [Parent, Parent2, Child, Child2, Grandchild, Grandchild2];
//     const appRoutes: IRoute[] = [
//       { path: 'parent-config', instructions: [{ component: 'parent', viewport: 'default' }] },
//       { path: 'parent-config/:id', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child', viewport: 'parent' }] }] },
//       { path: 'parent-config/child-config', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child', viewport: 'parent' }] }] },
//       { path: 'parent-config/child2', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent' }] }] },
//       { path: 'parent-config/child2@parent', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent' }] }] },
//       // { path: 'parent-config/child2(abc)', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent', parameters: { id: '$id' } }] }] },
//       // { path: 'parent-config/child2(abc)@parent', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent', parameters: { id: '$id' } }] }] },
//     ];
//     let locationPath: string;
//     const locationCallback = (type, data, title, path) => {
//       // console.log(type, data, title, path);
//       locationPath = path;
//     };
//     for (const test of tests) {
//       it(`to load route ${test.path} => ${test.url}`, async function () {
//         const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');

//         await $teardown();
//       });
//     }
//     it(`to load above routes in sequence`, async function () {
//       const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//       for (const test of tests) {
//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
//       }
//       await $teardown();
//     });

//     for (const test of tests) {
//       const path = test.path.replace(/@\w+/g, '');
//       const url = test.url.replace(/@\w+/g, '');
//       it(`to load route ${path} => ${url}`, async function () {
//         const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');

//         await $teardown();
//       });
//     }
//     it(`to load above routes in sequence`, async function () {
//       const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//       for (const test of tests) {
//         const path = test.path.replace(/@\w+/g, '');
//         const url = test.url.replace(/@\w+/g, '');
//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');
//       }
//       await $teardown();
//     });

//     let removedViewports = false;
//     for (const test of tests) {
//       it(`to load route (without viewports) ${test.path} => ${test.url}`, async function () {
//         const { scheduler, host, router, $teardown, App } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//         if (!removedViewports) {
//           removedViewports = true;
//           for (const type of [App, Parent, Parent2, Child, Child2]) {
//             for (const route of type.routes) {
//               $removeViewport(route.instructions);
//             }
//           }
//         }

//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');

//         await $teardown();
//       });
//     }
//     it(`to load above routes (without viewports) in sequence`, async function () {
//       const { scheduler, host, router, $teardown, App } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//       for (const test of tests) {
//         await $goto(test.path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
//       }
//       await $teardown();
//     });

//     for (const test of tests) {
//       const path = test.path.replace(/@\w+/g, '');
//       const url = test.url.replace(/@\w+/g, '');
//       it(`to load route (without viewports) ${path} => ${url}`, async function () {
//         const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');

//         await $teardown();
//       });
//     }
//     it(`to load above routes (without viewports) in sequence`, async function () {
//       const { scheduler, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

//       for (const test of tests) {
//         const path = test.path.replace(/@\w+/g, '');
//         const url = test.url.replace(/@\w+/g, '');
//         await $goto(path, router, scheduler);
//         assert.strictEqual(host.textContent, test.result, `host.textContent`);
//         assert.strictEqual(locationPath, `#/${url}`, 'location.path');
//       }
//       await $teardown();
//     });
//   });
// });

// let quxCantLeave = 0;
// let plughReentryBehavior = 'default';

// const $goto = async (path: string, router: IRouter, scheduler: IScheduler) => {
//   await router.goto(path);
//   scheduler.getRenderTaskQueue().flush();
// };

// const wait = async (time = 500) => {
//   await new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });
// };
