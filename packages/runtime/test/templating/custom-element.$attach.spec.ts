import { expect } from 'chai';
import {
  Hooks,
  LifecycleFlags,
  Scope,
  State
} from '../../src/index';
import {
  createCustomElement,
  CustomElement
} from '../resources/custom-element._builder';
import { eachCartesianJoin } from '../util';

//TODO: verify mount callbacks
describe('@customElement', () => {

  describe('$attach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) { }
      },
      {
        description: '$isAttached: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state |= State.isAttached;
        }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasAttaching',
        expectation: 'calls attaching(), does NOT call attached()',
        getHooks() { return Hooks.hasAttaching; }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call attaching(), does NOT call attached()',
        getHooks() { return Hooks.none; }
      },
      {
        description: 'Hooks.hasAttaching | Hooks.hasAttached',
        expectation: 'calls attaching(), calls attached()',
        getHooks() { return Hooks.hasAttaching | Hooks.hasAttached; }
      },
      {
        description: 'Hooks.hasAttached',
        expectation: 'does NOT call attaching(), calls attached()',
        getHooks() { return Hooks.hasAttached; }
      }
    ];

    eachCartesianJoin([propsSpecs, hooksSpecs],
                      (propsSpec, hooksSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        const initState = sut.$state;
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        const nodes = sut.$nodes = {} as any;
        let projectCalled = false;
        let projectNodes;
        sut.$projector = {
          project(nodes) {
            projectCalled = true;
            projectNodes = nodes;
          },
          provideEncapsulationSource(parentEncapsulationSource) {
            return parentEncapsulationSource;
          }
        } as any;

        // Act
        sut.$attach(LifecycleFlags.none);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (hooks & Hooks.hasAttached) {
            sut.verifyAttachedCalled(LifecycleFlags.fromAttach);
          }
          if (hooks & Hooks.hasAttaching) {
            sut.verifyAttachingCalled(LifecycleFlags.fromAttach);
          }
        }
        sut.verifyNoFurtherCalls();

        if (initState & State.isAttached) {
          expect(projectCalled).to.equal(true, 'projectCalled');
          expect(projectNodes).to.equal(nodes, 'projectNodes');
        }
      });
    });
  });

  describe('$detach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) { }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state |= State.isAttached;
        }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasDetaching',
        expectation: 'calls detaching(), does NOT call detached()',
        getHooks() { return Hooks.hasDetaching; }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call detaching(), does NOT call detached()',
        getHooks() { return Hooks.none; }
      },
      {
        description: 'Hooks.hasDetaching | Hooks.hasDetached',
        expectation: 'calls detaching(), calls detached()',
        getHooks() { return Hooks.hasDetaching | Hooks.hasDetaching; }
      },
      {
        description: 'Hooks.hasDetached',
        expectation: 'does NOT call detaching(), calls detached()',
        getHooks() { return Hooks.hasDetached; }
      }
    ];

    eachCartesianJoin([propsSpecs, hooksSpecs],
                      (propsSpec, hooksSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        let takeCalled = false;
        sut.$projector = {
          take(nodes) {
            takeCalled = true;
          }
        } as any;

        // Act
        sut.$detach(LifecycleFlags.none);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (hooks & Hooks.hasDetached) {
            sut.verifyDetachedCalled(LifecycleFlags.fromDetach | LifecycleFlags.parentUnmountQueued);
          }
          if (hooks & Hooks.hasDetaching) {
            sut.verifyDetachingCalled(LifecycleFlags.fromDetach | LifecycleFlags.parentUnmountQueued);
          }
        }
        sut.verifyNoFurtherCalls();

        expect(takeCalled).to.equal(false, 'takeCalled');
      });
    });
  });

  describe('$cache', () => {

    const hooksSpecs = [
      {
        description: '$behavior.hasCaching: true',
        expectation: 'calls hasCaching()',
        getHooks() { return Hooks.hasCaching; }
      },
      {
        description: '$behavior.hasCaching: false',
        expectation: 'does NOT call hasCaching()',
        getHooks() { return Hooks.none; }
      }
    ];

    eachCartesianJoin([hooksSpecs],
                      (hooksSpec) => {

      it(`${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        // Act
        sut.$cache(LifecycleFlags.none);

        // Assert
        if (hooks & Hooks.hasCaching) {
          sut.verifyCachingCalled(LifecycleFlags.fromCache);
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$mount', () => {
    it('calls $projector.project()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = {} as any;
      let projectCalled = false;
      let projectNodes;
      sut.$projector = {
        project(nodes) {
          projectCalled = true;
          projectNodes = nodes;
        }
      } as any;

      sut.$mount(LifecycleFlags.none);

      expect(projectCalled).to.equal(true, 'projectCalled');
      expect(projectNodes).to.equal(nodes, 'projectNodes');
    });
  });

  describe('$unmount', () => {
    it('calls $projector.take()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = {} as any;
      let takeCalled = false;
      let takeNodes;
      sut.$projector = {
        take(nodes) {
          takeCalled = true;
          takeNodes = nodes;
        }
      } as any;
      sut.$state |= State.isMounted;

      sut.$unmount(LifecycleFlags.none);

      expect(takeCalled).to.equal(true, 'takeCalled');
      expect(takeNodes).to.equal(nodes, 'takeNodes');
    });
  });
});
