import { expect } from 'chai';
import {
  Hooks,
  LifecycleFlags as LF,
  Scope,
  State
} from '@aurelia/runtime';
import {
  createCustomElement,
  CustomElement
} from '../resources/custom-element._builder';
import { eachCartesianJoin } from '../../util';

//TODO: verify mount callbacks
describe('@customElement', function () {

  describe('$attach', function () {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) { return; }
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

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, function () {
        // Arrange
        const { sut } = createCustomElement('foo');
        const initState = sut.$state;
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(LF.none, sut, null);
        sut.$bindingHead = sut.$bindingTail = null;
        sut.$componentHead = sut.$componentTail = null;
        sut.$componentHead = sut.$componentTail = null;
        propsSpec.setProps(sut);
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        const nodes = sut.$nodes = {} as any;
        let projectCalled = false;
        let projectNodes;
        sut.$projector = {
          project(nodes2) {
            projectCalled = true;
            projectNodes = nodes2;
          },
          provideEncapsulationSource(parentEncapsulationSource) {
            return parentEncapsulationSource;
          }
        } as any;

        // Act
        sut.$attach(LF.none);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (hooks & Hooks.hasAttached) {
            sut.verifyAttachedCalled(LF.fromAttach);
          }
          if (hooks & Hooks.hasAttaching) {
            sut.verifyAttachingCalled(LF.fromAttach);
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

  describe('$detach', function () {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) { return; }
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

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, function () {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(LF.none, sut, null);
        sut.$bindingHead = sut.$bindingTail = null;
        sut.$componentHead = sut.$componentTail = null;
        sut.$componentHead = sut.$componentTail = null;
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
        sut.$detach(LF.none);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (hooks & Hooks.hasDetached) {
            sut.verifyDetachedCalled(LF.fromDetach | LF.parentUnmountQueued);
          }
          if (hooks & Hooks.hasDetaching) {
            sut.verifyDetachingCalled(LF.fromDetach | LF.parentUnmountQueued);
          }
        }
        sut.verifyNoFurtherCalls();

        expect(takeCalled).to.equal(false, 'takeCalled');
      });
    });
  });

  describe('$cache', function () {

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

      it(`${hooksSpec.expectation} if ${hooksSpec.description}`, function () {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= State.isBound;
        sut.$scope = Scope.create(LF.none, sut, null);
        sut.$bindingHead = sut.$bindingTail = null;
        sut.$componentHead = sut.$componentTail = null;
        sut.$componentHead = sut.$componentTail = null;
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        // Act
        sut.$cache(LF.none);

        // Assert
        if (hooks & Hooks.hasCaching) {
          sut.verifyCachingCalled(LF.fromCache);
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$mount', function () {
    it('calls $projector.project()', function () {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = {} as any;
      let projectCalled = false;
      let projectNodes;
      sut.$projector = {
        project(nodes2) {
          projectCalled = true;
          projectNodes = nodes2;
        }
      } as any;

      sut.$mount(LF.none);

      expect(projectCalled).to.equal(true, 'projectCalled');
      expect(projectNodes).to.equal(nodes, 'projectNodes');
    });
  });

  describe('$unmount', function () {
    it('calls $projector.take()', function () {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = {} as any;
      let takeCalled = false;
      let takeNodes;
      sut.$projector = {
        take(nodes2) {
          takeCalled = true;
          takeNodes = nodes2;
        }
      } as any;
      sut.$state |= State.isMounted;

      sut.$unmount(LF.none);

      expect(takeCalled).to.equal(true, 'takeCalled');
      expect(takeNodes).to.equal(nodes, 'takeNodes');
    });
  });
});
