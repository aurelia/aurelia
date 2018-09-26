import {
  RenderingEngine,
  CompiledTemplate,
  RuntimeCompilationResources,
  View,
  ViewFactory,
  IRenderContext,
  ExposedContext,
  CustomElementResource,
  CustomAttributeResource,
  BindingBehaviorResource,
  ValueConverterResource,
  RenderStrategyResource
} from '../../../src/index';
import { expect } from 'chai';
import { Container } from '../../../../kernel/src';
import { BindingCommandResource } from '../../../../jit/src';


describe('RenderingEngine', () => {

});

describe('CompiledTemplate', () => {

});

describe('RuntimeCompilationResources', () => {

  it('does not register while finding resource', () => {
    const container = new Container();
    const resources = new RuntimeCompilationResources((container as any) as ExposedContext);

    [
      CustomElementResource,
      CustomAttributeResource,
      BindingBehaviorResource,
      ValueConverterResource,
      RenderStrategyResource,
      BindingCommandResource
    ].forEach(r => {
      resources.find(r, 'a');
      expect(container.getResolver(r.keyFrom('a'), false)).to.be.null;
    });
  });
});

describe('View', () => {

});

describe('ViewFactory', () => {

});
