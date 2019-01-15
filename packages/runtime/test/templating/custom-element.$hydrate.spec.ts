import { expect } from 'chai';
import { Hooks, ICustomElementType,  INode, IRenderingEngine, ITemplate } from '../../src/index';
import { createCustomElement, CustomElement } from '../resources/custom-element._builder';
import { eachCartesianJoin } from '../util';

describe('@customElement', () => {

  describe('$hydrate', () => {

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

      it(`sets properties, applies runtime behavior and ${hooksSpec.expectation} if ${hooksSpec.description}`, () => {
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
          applyRuntimeBehavior(type: ICustomElementType, instance: CustomElement) {
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

        // Act
        sut.$hydrate(
          {} as any,
          { getElementProjector() { return null; }} as any,
          renderingEngine,
          host,
          null
        );

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
