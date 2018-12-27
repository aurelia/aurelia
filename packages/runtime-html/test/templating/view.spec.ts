import {
  DI,
  PLATFORM,
  Writable
} from '@aurelia/kernel';
import { expect } from 'chai';
import { spy } from 'sinon';
import {
  eachCartesianJoin,
  eachCartesianJoinFactory
} from '../../../../scripts/test-lib';
import { IRenderable } from '@aurelia/runtime';


class StubView {
  constructor(public cached = false) {}
  public $cache() {
    this.cached = true;
  }
}

class StubTemplate {
  constructor(public nodes = {}) {}
  public render(renderable: Partial<IRenderable>) {
    (renderable as Writable<IRenderable>).$nodes = this.nodes as any;
  }
}

describe(`ViewFactory`, () => {
  describe(`tryReturnToCache`, () => {
    const doNotOverrideVariations: [string, boolean][] = [
      [' true', true],
      ['false', false]
    ];

    const sizeVariations: [string, any, boolean][] = [
      [`  -2`,  -2,  false],
      [`  -1`,  -1,  false],
      [`   0`,   0,  false],
      [`   1`,   1,   true],
      [`'-2'`, '-2', false],
      [`'-1'`, '-1', false],
      [` '0'`,  '0', false],
      [` '1'`,  '1',  true],
      [` '*'`,  '*',  true]
    ];

    const doNotOverrideVariations2: [string, boolean][] = [
      [' true', true],
      ['false', false]
    ];

    const sizeVariations2: [string, any, boolean][] = [
      [`  -2`,  -2,  false],
      [`  -1`,  -1,  false],
      [`   0`,   0,  false],
      [`   1`,   1,   true],
      [`'-2'`, '-2', false],
      [`'-1'`, '-1', false],
      [` '0'`,  '0', false],
      [` '1'`,  '1',  true],
      [` '*'`,  '*',  true]
    ];

    const inputs: [typeof doNotOverrideVariations, typeof sizeVariations, typeof doNotOverrideVariations2, typeof sizeVariations2]
      = [doNotOverrideVariations, sizeVariations, doNotOverrideVariations2, sizeVariations2];

    eachCartesianJoin(inputs, ([text1, doNotOverride1], [text2, size2, isPositive2], [text3, doNotOverride3], [text4, size4, isPositive4]) => {
        it(`setCacheSize(${text2},${text1}) -> tryReturnToCache -> create x2 -> setCacheSize(${text4},${text3}) -> tryReturnToCache -> create x2`, () => {
          const template = new StubTemplate();
          const sut = new ViewFactory(null, template as any, new Lifecycle());
          const view1 = new StubView();
          const view2 = new StubView();

          sut.setCacheSize(size2, doNotOverride1);

          let canCache = isPositive2;
          expect(sut.tryReturnToCache(view1 as any)).to.equal(canCache, 'sut.tryReturnToCache(view1)');
          expect(view1.cached).to.equal(canCache, 'view1.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view1, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(view1 as any)).to.equal(true, 'sut.tryReturnToCache(<any>view1)');

            if (size2 !== '*') {
              expect(sut.tryReturnToCache(view1 as any)).to.equal(false, 'sut.tryReturnToCache(view1) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
          }

          // note: the difference in behavior between 0 (number) and '0' (string),
          // and the behavior of values lower than -1 are kind of quirky
          // probably not important enough for the overhead of an extra check, but at least worth a note
          if (size4 && ((size2 === -1 || size2 === '-1' || size2 === 0) || !doNotOverride3)) {
            canCache = isPositive4;
          }
          sut.setCacheSize(size4, doNotOverride3);

          expect(sut.tryReturnToCache(view2 as any)).to.equal(canCache, 'sut.tryReturnToCache(view2)');
          expect(view2.cached).to.equal(canCache, 'view2.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view2, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(view2 as any)).to.equal(true, 'sut.tryReturnToCache(<any>view2)');

            if (size2 !== '*' && size4 !== '*') {
              expect(sut.tryReturnToCache(view2 as any)).to.equal(false, 'sut.tryReturnToCache(view2) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
          }

        });
      }
    );
  });
});

// const expressions = {
//   text: new AccessScope('text')
// };

// describe(`View`, () => {
//   type $01 = [string, ILifecycle, View, ITemplate, ViewFactory, boolean];
//   type $02 = [string, LifecycleFlags, IScope];
//   type $03 = [string, (sut: View) => void];
//   type $04 = [string, IRenderLocation];
//   type $05 = [string, (sut: View) => void];
//   type $06 = [string, (sut: View) => void];
//   type $07 = [string, (sut: View) => void];
//   type $08 = [string];
//   type $09 = [string, (sut: View) => void];
//   type $10 = [string, LifecycleFlags];
//   type $11 = [string, (sut: View) => void];

//   const sutVariations: (() =>
//     [string, ILifecycle, View, ITemplate, ViewFactory, boolean])[] = [
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const factory = new ViewFactory('foo', noViewTemplate, lifecycle);
//       factory.setCacheSize('*', true);
//       const view = factory.create() as View;

//       return [` noViewTemplate, viewFactory(cache=true )`, lifecycle, view, noViewTemplate, factory, true];
//     },
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const factory = new ViewFactory('foo', noViewTemplate, lifecycle);
//       const view = factory.create() as View;

//       return [` noViewTemplate, viewFactory(cache=false)`, lifecycle, view, noViewTemplate, factory, false];
//     },
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const observerLocator = createObserverLocator(container);
//       const template = new MockTextNodeTemplate(expressions.text, observerLocator, container) as any;
//       const factory = new ViewFactory('foo', template as any, lifecycle);
//       factory.setCacheSize('*', true);
//       const view = factory.create() as View;

//       return [`textNodeTemplate, viewFactory(cache=true )`, lifecycle, view, template, factory, true];
//     },
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const observerLocator = createObserverLocator(container);
//       const template = new MockTextNodeTemplate(expressions.text, observerLocator, container) as any;
//       const factory = new ViewFactory('foo', template as any, lifecycle);
//       const view = factory.create() as View;

//       return [`textNodeTemplate, viewFactory(cache=false)`, lifecycle, view, template, factory, false];
//     },
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const observerLocator = createObserverLocator(container);
//       const template = new MockTextNodeTemplate(expressions.text, observerLocator, container) as any;
//       const factory = new ViewFactory('foo', template as any, lifecycle);
//       const child = factory.create() as View;
//       const sut = factory.create() as View;
//       addBindable(sut, child);
//       addAttachable(sut, child);
//       factory.setCacheSize('*', true);

//       return [`textNodeTemplate, viewFactory(cache=true )`, lifecycle, sut, template, factory, true];
//     },
//     () => {
//       const container = RuntimeConfiguration.createContainer();
//       const lifecycle = container.get(ILifecycle) as Lifecycle;
//       const observerLocator = createObserverLocator(container);
//       const template = new MockTextNodeTemplate(expressions.text, observerLocator, container) as any;
//       const factory = new ViewFactory('foo', template as any, lifecycle);
//       const child = factory.create() as View;
//       const sut = factory.create() as View;
//       addBindable(sut, child);
//       addAttachable(sut, child);

//       return [`textNodeTemplate, viewFactory(cache=false)`, lifecycle, sut, template, factory, false];
//     }
//   ];

//   const scopeVariations: (($01: $01) =>
//     [string, LifecycleFlags, IScope])[] = [
//     () => [`fromBind, {text:'foo'}`, LifecycleFlags.fromBind, Scope.create({text: 'foo'}, null)]
//   ];

//   const bindVariations: (($01: $01, $02: $02) =>
//     [string, (sut: View) => void])[] = [
//     () => [
//       `       noop`,
//       PLATFORM.noop
//     ],
//     ($1, [$21, flags, scope]) => [
//       `      $bind`,
//       (sut) => {
//         sut.$bind(flags, scope);

//         expect(sut.$scope).to.equal(scope, 'sut.$scope');
//         expect(sut).to.have.$state.isBound();
//         if (sut.$nodes.firstChild) {
//           expect(sut.$nodes.firstChild.textContent).to.equal('foo', 'sut.$nodes.firstChild.textContent');
//         }

//         // TODO: verify short-circuit if already bound (now we can only tell by debugging or looking at the coverage report, not very clean)
//         sut.$bind(flags, scope);

//         const newScope = Scope.create({text: 'foo'}, null);
//         sut.$bind(flags, newScope);

//         expect(sut.$scope).to.equal(newScope, 'sut.$scope');
//         expect(sut).to.have.$state.isBound();
//       }
//     ],
//     ([$11, lifecycle, $13, $14], [$21, flags, scope]) => [
//       `$bind+flush`,
//       (sut) => {
//         sut.$bind(flags, scope);

//         expect(sut.$scope).to.equal(scope, 'sut.$scope');
//         expect(sut).to.have.$state.isBound();
//         if (sut.$nodes.firstChild) {
//           expect(sut.$nodes.firstChild.textContent).to.equal('foo', 'sut.$nodes.firstChild.textContent');
//           lifecycle.processFlushQueue(LifecycleFlags.none);
//           expect(sut.$nodes.firstChild.textContent).to.equal('foo', 'sut.$nodes.firstChild.textContent');
//           if (sut.$attachableHead) {
//             expect(sut.$attachableHead['$nodes'].firstChild.textContent).to.equal('foo', 'sut.$attachableHead.$nodes.firstChild.textContent');
//           }
//         }
//       }
//     ]
//   ];

//   const locationVariations: (($01: $01, $02: $02, $03: $03) =>
//     [string, IRenderLocation])[] = [
//     () => {
//       const location = document.createElement('div');

//       return [`div`, location];
//     },
//     () => {
//       const host = document.createElement('div');
//       const location = document.createElement('div');
//       host.appendChild(location);

//       return [`div`, location];
//     }
//   ];

//   const mountVariations: (($01: $01, $02: $02, $03: $03, $04: $04) =>
//     [string, (sut: View) => void])[] = [
//     () => [
//       ` noop`,
//       PLATFORM.noop
//     ],
//     ($1, $2, $3, [$41, location]) => [
//       `mount`,
//       (sut) => {
//         if (!location.parentNode) {
//           expect(() => sut.hold(location, LifecycleFlags.none)).to.throw(/60/);
//         } else {
//           sut.hold(location, LifecycleFlags.none);

//           expect(sut.location).to.equal(location, 'sut.location');
//           if (sut.$attachableHead) {
//             expect(sut.$attachableHead['location']).to.equal(undefined, 'sut.$attachableHead.location');
//           }

//           expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
//           expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
//           expect(location.parentNode.childNodes[0].childNodes.length).to.equal(0, 'location.parentNode.childNodes[0].childNodes.length');
//         }
//       }
//     ]
//   ];

//   const attachVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05) =>
//     [string, (sut: View) => void])[] = [
//     () => [
//       `   noop`,
//       PLATFORM.noop
//     ],
//     ([$11, lifecycle, sut, template], $2, $3, [$41, location], $5, [$61, source]) => [
//       `$attach`,
//       (sut) => {
//         lifecycle.beginAttach();
//         sut.$attach(LifecycleFlags.none);
//         lifecycle.endAttach(LifecycleFlags.none);

//         expect(sut).to.have.$state.isAttached('sut.$isAttached');
//         //expect(sut.$encapsulationSource).to.equal(source);
//         if (sut.$attachableHead) {
//           expect(sut.$attachableHead).to.have.$state.isAttached('sut.$attachableHead.$isAttached');
//           //expect(sut.$attachableHead.$encapsulationSource).to.equal(source);
//         }

//         if (location.parentNode) {
//           if (template === noViewTemplate || !sut.location) {
//             expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
//             expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
//           } else {
//             expect(location.parentNode.childNodes.length).to.equal(2);
//             if (lifecycle.flushCount > 0 || !(sut.$state & State.isBound)) {
//               expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
//             } else {
//               expect(location.parentNode.textContent).to.equal('foo', 'location.parentNode.textContent');
//             }
//           }
//         }

//         // verify short-circuit if already attached
//         //const def = sut.$encapsulationSource;
//         //sut.$encapsulationSource = null;
//         lifecycle.beginAttach();
//         sut.$attach(LifecycleFlags.none);
//         lifecycle.endAttach(LifecycleFlags.none);
//         //expect(sut.$encapsulationSource).to.equal(null, 'sut.$encapsulationSource');
//         //sut.$encapsulationSource = def;
//       }
//     ]
//   ];

//   const releaseVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05, $06: $06) =>
//     [string, (sut: View) => void])[] = [
//     () => [`   noop`, PLATFORM.noop],
//     ([$11, $12, $13, $14, $15, cache], $2, $3, $4, $5, $6, [$71, attachFn]) => [`release`, (sut) => {
//       expect(sut.release(LifecycleFlags.none)).to.equal(cache && attachFn !== PLATFORM.noop, 'sut.release()');
//     }]
//   ];

//   const lifecycleVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05, $06: $06, $07: $07) =>
//     [string])[] = [
//     ([$11, $12, $13, $14, lifecycle]) => [`Lifecycle(none)`]
//   ];

//   const detachVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05, $06: $06, $07: $07, $08: $08) =>
//     [string, (sut: View) => void])[] = [
//     () => [`   noop`, PLATFORM.noop],
//     ([$11, lifecycle, sut, template, factory, cache], $2, $3, [$41, location], $5, [$61, source], [$71, attach], [$81, release], [$91]) => [`$detach`, (sut) => {
//       lifecycle.beginDetach();
//       sut.$detach(LifecycleFlags.none);
//       lifecycle.endDetach(LifecycleFlags.none);

//       expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
//       if (attach === PLATFORM.noop) {
//         //expect(sut.$encapsulationSource).to.equal(undefined);

//         // verify short-circuit if already detached
//         const s = spy(lifecycle, 'enqueueUnmount' as any);
//         sut.$detach(lifecycle as any);
//         expect(s).not.to.have.been.called;
//         s.restore();
//       } else {
//         //expect(sut.$encapsulationSource).to.equal(source);
//       }
//       if (sut.$attachableHead) {
//         expect(sut.$attachableHead).to.not.have.$state.isAttached('sut.$attachableHead.$isAttached');
//         if (attach === PLATFORM.noop) {
//           //expect(sut.$attachableHead.$encapsulationSource).to.equal(undefined);
//         } else {
//           //expect(sut.$attachableHead.$encapsulationSource).to.equal(source);
//         }
//       }

//       if (location.parentNode) {
//         expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
//         expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
//       }
//       if (cache && release !== PLATFORM.noop && attach !== PLATFORM.noop) {
//         expect(factory.cache[0]).to.equal(sut, 'factory.cache[0]');
//       } else if (factory.cache !== null) {
//         expect(factory.cache[0]).not.to.equal(sut, 'factory.cache[0]');
//       }
//     }]
//   ];

//   const unbindFlagsVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05, $06: $06, $07: $07, $08: $08, $09: $09) =>
//     [string, LifecycleFlags])[] = [
//     () => [`fromUnbind`, LifecycleFlags.fromBind]
//   ];

//   const unbindVariations: (($01: $01, $02: $02, $03: $03, $04: $04, $05: $05, $06: $06, $07: $07, $08: $08, $09: $09, $10: $10) =>
//     [string, (sut: View) => void])[] = [
//     () => [`   noop`, PLATFORM.noop],
//     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, [$111, flags]) => [`$unbind`, (sut) => {
//       sut.$unbind(flags);

//       expect(sut).to.not.have.$state.isBound();
//       expect(sut.$scope).to.equal(null, 'sut.$scope');
//       if (sut.$attachableHead) {
//         expect(sut.$attachableHead).to.not.have.$state.isBound();
//         expect(sut.$attachableHead.$scope).to.equal(null, 'sut.$attachableHead.$scope');
//       }
//     }]
//   ];

//   const inputs: [
//     typeof sutVariations,
//     typeof scopeVariations,
//     typeof bindVariations,
//     typeof locationVariations,
//     typeof mountVariations,
//     typeof attachVariations,
//     typeof releaseVariations,
//     typeof lifecycleVariations,
//     typeof detachVariations,
//     typeof unbindFlagsVariations,
//     typeof unbindVariations
//   ] = [
//     sutVariations,
//     scopeVariations,
//     bindVariations,
//     locationVariations,
//     mountVariations,
//     attachVariations,
//     releaseVariations,
//     lifecycleVariations,
//     detachVariations,
//     unbindFlagsVariations,
//     unbindVariations
//   ];

//   eachCartesianJoinFactory(inputs, ([t01, t02, sut], [t2], [t3, bind], [t4], [t5, mount], [t7, attach], [t8, release], [t9], [t10, detach], [t11], [t12, unbind]) => {
//       it(`create(${t01}) -> ${t3}(${t2}) -> ${t5}(${t4}) -> ${t7}() -> ${t8}() -> ${t10}(${t9}) -> ${t12}(${t11})`, () => {
//         bind(sut);
//         mount(sut);
//         attach(sut);
//         release(sut);
//         detach(sut);
//         unbind(sut);
//       });
//     }
//   );
// });
