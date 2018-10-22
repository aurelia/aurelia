import {
  LifecycleHooks, INode, IAttachLifecycle, Scope,
  IRuntimeBehavior, IElementProjector, LifecycleState, IDetachLifecycle
} from '../../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomElement, createCustomElement } from './custom-element._builder';

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
          sut.$state |= LifecycleState.isAttached;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasAttaching: true, $behavior.hasAttached: false',
        expectation: 'calls attaching(), does NOT call attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttaching }; }
      },
      {
        description: '$behavior.hasAttaching: false, $behavior.hasAttached: false',
        expectation: 'does NOT call attaching(), does NOT call attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      },
      {
        description: '$behavior.hasAttaching: true, $behavior.hasAttached: true',
        expectation: 'calls attaching(), calls attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttaching | LifecycleHooks.hasAttached }; }
      },
      {
        description: '$behavior.hasAttaching: false, $behavior.hasAttached: true',
        expectation: 'does NOT call attaching(), calls attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttached }; }
      }
    ];

    eachCartesianJoin([propsSpecs, behaviorSpecs],
      (propsSpec, behaviorSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let provideEncapsulationSourceCalled = false;
        const projector: IElementProjector = <any> {
          provideEncapsulationSource($encapsulationSource: INode) {
            provideEncapsulationSourceCalled = true;
            return $encapsulationSource;
          }
        };
        sut.$projector = projector;
        let queueAttachedCallbackCalled = false;
        let queueAttachedCallbackRequestor;
        let queueMountCalled = false;
        let queueMountRequestor;
        const lifecycle: IAttachLifecycle = <any>{
          queueAttachedCallback(requestor: CustomElement) {
            queueAttachedCallbackCalled = true;
            queueAttachedCallbackRequestor = requestor;
            requestor.attached();
          },
          queueMount(requestor: CustomElement) {
            queueMountCalled = true;
            queueMountRequestor = requestor;
            requestor.$mount();
          }
        };
        let addNodesCalled = false;
        sut.$mount = () => {
          addNodesCalled = true;
        };

        // Act
        sut.$attach(encapsulationSource, lifecycle);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (behavior.hooks & LifecycleHooks.hasAttached) {
            sut.verifyAttachedCalled();
            expect(queueAttachedCallbackCalled).to.equal(true, 'queueAttachedCallbackCalled');
            expect(queueAttachedCallbackRequestor).to.equal(sut, 'queueAttachedCallbackRequestor')
          }
          if (behavior.hooks & LifecycleHooks.hasAttaching) {
            sut.verifyAttachingCalled(encapsulationSource, lifecycle);
          }
        } else {
          expect(queueAttachedCallbackCalled).to.equal(false, 'queueAttachedCallbackCalled');
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
        setProps(sut: CustomElement) { }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state |= LifecycleState.isAttached;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasDetaching: true, $behavior.hasDetached: false',
        expectation: 'calls detaching(), does NOT call detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetaching }; }
      },
      {
        description: '$behavior.hasDetaching: false, $behavior.hasDetached: false',
        expectation: 'does NOT call detaching(), does NOT call detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      },
      {
        description: '$behavior.hasDetaching: true, $behavior.hasDetached: true',
        expectation: 'calls detaching(), calls detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetaching | LifecycleHooks.hasDetaching }; }
      },
      {
        description: '$behavior.hasDetaching: false, $behavior.hasDetached: true',
        expectation: 'does NOT call detaching(), calls detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetached }; }
      }
    ];

    eachCartesianJoin([propsSpecs, behaviorSpecs],
      (propsSpec, behaviorSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let queueDetachedCallbackCalled = false;
        let queueDetachedCallbackRequestor;
        let queueUnmountCalled = false;
        let queueUnmountRequestor;
        const lifecycle: IDetachLifecycle = <any>{
          queueDetachedCallback(requestor: CustomElement) {
            queueDetachedCallbackCalled = true;
            queueDetachedCallbackRequestor = requestor;
            requestor.detached();
          },
          queueUnmount(requestor: CustomElement) {
            queueUnmountCalled = true;
            queueUnmountRequestor = requestor;
            requestor.$unmount();
          }
        };
        let removeNodesCalled = false;
        sut.$unmount = () => {
          removeNodesCalled = true;
        };

        // Act
        sut.$detach(lifecycle);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (behavior.hooks & LifecycleHooks.hasDetached) {
            sut.verifyDetachedCalled();
            expect(queueDetachedCallbackCalled).to.equal(true, 'queueDetachedCallbackCalled');
            expect(queueDetachedCallbackRequestor).to.equal(sut, 'queueDetachedCallbackRequestor')
          }
          if (behavior.hooks & LifecycleHooks.hasDetaching) {
            sut.verifyDetachingCalled(lifecycle);
          }
        } else {
          expect(queueDetachedCallbackCalled).to.equal(false, 'queueDetachedCallbackCalled');
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$cache', () => {

    const behaviorSpecs = [
      {
        description: '$behavior.hasCaching: true',
        expectation: 'calls hasCaching()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasCaching }; }
      },
      {
        description: '$behavior.hasCaching: false',
        expectation: 'does NOT call hasCaching()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      }
    ];

    eachCartesianJoin([behaviorSpecs],
      (behaviorSpec) => {

      it(`${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;

        // Act
        sut.$cache();

        // Assert
        if (behavior.hooks & LifecycleHooks.hasCaching) {
          sut.verifyCachingCalled();
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$mount', () => {
    it('calls $projector.project()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = <any>{};
      let projectCalled = false;
      let projectNodes;
      sut.$projector = <any> {
        project(nodes) {
          projectCalled = true;
          projectNodes = nodes;
        }
      };

      sut.$mount();

      expect(projectCalled).to.equal(true, 'projectCalled');
      expect(projectNodes).to.equal(nodes, 'projectNodes');
    });
  });

  describe('$unmount', () => {
    it('calls $projector.take()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = <any>{};
      let takeCalled = false;
      let takeNodes;
      sut.$projector = <any> {
        take(nodes) {
          takeCalled = true;
          takeNodes = nodes;
        }
      };

      sut.$unmount();

      expect(takeCalled).to.equal(true, 'takeCalled');
      expect(takeNodes).to.equal(nodes, 'takeNodes');
    });
  });
});
