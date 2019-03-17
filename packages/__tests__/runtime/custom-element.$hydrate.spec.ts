import { IServiceLocator } from '@aurelia/kernel';
import { expect } from 'chai';
import { Hooks, ICustomElementType,  IDOM, INode, IProjectorLocator, IRenderingEngine, ITemplate, LifecycleFlags as LF } from '@aurelia/runtime';
import { createCustomElement, CustomElement, eachCartesianJoin } from '@aurelia/testing';

describe('@customElement', function () {

  describe('$hydrate', function () {

    const hooksSpecs = [
      {
        description: 'hooks.hasCreated',
        expectation: 'calls created()',
        getHooks() { return Hooks.hasCreated; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyCreatedCalled();
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call created()',
        getHooks() { return Hooks.none; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([hooksSpecs],
                      (hooksSpec) => {

      it(`sets properties, applies runtime behavior and ${hooksSpec.expectation} if ${hooksSpec.description}`, function () {
        // Arrange
        const { Type, sut } = createCustomElement('foo');

        let renderCalled = false;
        let renderRenderable;
        let renderHost;
        let renderParts;
        const template: ITemplate = {
          renderContext: {},
          render: ((renderable, host2, parts) => {
            renderCalled = true;
            renderRenderable = renderable;
            renderHost = host2;
            renderParts = parts;
          }) as ITemplate['render']
        } as any;
        let appliedType: ICustomElementType;
        let appliedInstance: CustomElement;
        let getElementTemplateCalled = false;
        let getElementTemplateDescription;
        let getElementTemplateType;
        const renderingEngine: IRenderingEngine = {
          applyRuntimeBehavior(flags: LF, type: ICustomElementType, instance: CustomElement) {
            instance.$hooks = hooksSpec.getHooks();
            appliedType = type;
            appliedInstance = instance;
          },
          getElementTemplate(description: ICustomElementType['description'], type: ICustomElementType) {
            getElementTemplateCalled = true;
            getElementTemplateDescription = description;
            getElementTemplateType = type;
            return template;
          }
        } as any;
        const host: INode = {} as any;
        const context: IServiceLocator = {
          get(key: unknown): unknown {
            switch (key) {
              case IDOM:
                return {};
              case IProjectorLocator:
                return {
                  getElementProjector() {
                    return null;
                  }
                } as any;
              case IRenderingEngine:
                return renderingEngine;
            }
          }
        } as any;

        // Act
        sut.$hydrate(LF.none, context, host);

        // Assert
        expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
        expect(sut).to.not.have.$state.isBound();
        expect(sut.$scope.bindingContext).to.equal(sut, 'sut.$scope');

        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
        hooksSpec.verifyBehaviorInvocation(sut);
      });
    });
  });

});
