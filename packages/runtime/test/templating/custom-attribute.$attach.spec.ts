import { State, ILifecycle, INode, Hooks, LifecycleFlags } from '../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomAttribute, createCustomAttribute } from './custom-attribute._builder';

describe('@customAttribute', () => {

  describe('$attach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound | State.isAttached;
        }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasAttaching',
        expectation: 'calls attaching(), does NOT call attached()',
        getHooks() { return Hooks.hasAttaching }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call attaching(), does NOT call attached()',
        getHooks() { return Hooks.none }
      },
      {
        description: 'Hooks.hasAttaching | Hooks.hasAttached',
        expectation: 'calls attaching(), calls attached()',
        getHooks() { return Hooks.hasAttaching | Hooks.hasAttached }
      },
      {
        description: 'Hooks.hasAttached',
        expectation: 'does NOT call attaching(), calls attached()',
        getHooks() { return Hooks.hasAttached }
      }
    ];

    eachCartesianJoin([propsSpecs, hooksSpecs],
      (propsSpec, hooksSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        propsSpec.setProps(sut);
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

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
      });
    });
  });

  describe('$detach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound | State.isAttached;
        }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasDetaching',
        expectation: 'calls detaching(), does NOT call detached()',
        getHooks() { return Hooks.hasDetaching }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call detaching(), does NOT call detached()',
        getHooks() { return Hooks.none }
      },
      {
        description: 'Hooks.hasDetaching | Hooks.hasDetached',
        expectation: 'calls detaching(), calls detached()',
        getHooks() { return Hooks.hasDetaching | Hooks.hasDetaching }
      },
      {
        description: 'Hooks.hasDetached',
        expectation: 'does NOT call detaching(), calls detached()',
        getHooks() { return Hooks.hasDetached }
      }
    ];

    eachCartesianJoin([propsSpecs, hooksSpecs],
      (propsSpec, hooksSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        propsSpec.setProps(sut);
        const hooks = hooksSpec.getHooks();
        sut.$hooks = hooks;

        // Act
        sut.$detach(LifecycleFlags.none);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (hooks & Hooks.hasDetached) {
            sut.verifyDetachedCalled(LifecycleFlags.fromDetach);
          }
          if (hooks & Hooks.hasDetaching) {
            sut.verifyDetachingCalled(LifecycleFlags.fromDetach);
          }
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$cache', () => {

    const hooksSpecs = [
      {
        description: '$behavior.hasCaching: true',
        expectation: 'calls hasCaching()',
        getHooks() { return Hooks.hasCaching }
      },
      {
        description: '$behavior.hasCaching: false',
        expectation: 'does NOT call hasCaching()',
        getHooks() { return Hooks.none }
      }
    ];

    eachCartesianJoin([hooksSpecs],
      (hooksSpec) => {

      it(`${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
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
});
