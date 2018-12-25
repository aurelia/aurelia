import { Hooks, INode,  ICustomElementType, IRenderingEngine, ITemplate, RuntimeBehavior, DOM } from '../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomElement, createCustomElement } from './custom-element._builder';

const dom = new DOM(<any>document);

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
        };
        let host: INode = <any>{};

        // Act
        sut.$hydrate(dom, renderingEngine, host);

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
