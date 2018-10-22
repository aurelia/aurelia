import { LifecycleHooks, INode,  ICustomElementType, IRenderingEngine, ITemplate, IRuntimeBehavior } from '../../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomElement, createCustomElement } from './custom-element._builder';

describe('@customElement', () => {

  describe('$hydrate', () => {

    const behaviorSpecs = [
      {
        description: '$behavior.hasCreated: true',
        expectation: 'calls created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasCreated }; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyCreatedCalled();
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasCreated: false',
        expectation: 'does NOT call created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([behaviorSpecs],
      (behaviorSpec) => {

      it(`sets properties, applies runtime behavior and ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { Type, sut } = createCustomElement('foo');

        let renderCalled = false;
        let renderRenderable;
        let renderHost;
        let renderParts;
        const template: ITemplate = <any>{
          renderContext: <ITemplate['renderContext']>{},
          render: <ITemplate['render']>((renderable, host, parts) => {
            renderCalled = true;
            renderRenderable = renderable;
            renderHost = host;
            renderParts = parts;
          })
        };
        let appliedType: ICustomElementType;
        let appliedInstance: CustomElement;
        let getElementTemplateCalled = false;
        let getElementTemplateDescription;
        let getElementTemplateType;
        const renderingEngine: IRenderingEngine = <any>{
          applyRuntimeBehavior(type: ICustomElementType, instance: CustomElement) {
            instance.$behavior = behaviorSpec.getBehavior();
            appliedType = type;
            appliedInstance = instance;
          },
          getElementTemplate(description: ICustomElementType['description'], type: ICustomElementType) {
            getElementTemplateCalled = true;
            getElementTemplateDescription = description;
            getElementTemplateType = type;
            return template;
          }
        };
        let host: INode = <any>{};

        // Act
        sut.$hydrate(renderingEngine, host);

        // Assert
        expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
        expect(sut).to.not.have.$state.isBound();
        expect(sut.$scope.bindingContext).to.equal(sut, 'sut.$scope');

        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
        behaviorSpec.verifyBehaviorInvocation(sut);
      });
    });
  });


});
