import {
  CustomElementResource,
  CustomAttributeResource,
  BindingBehaviorResource,
  ValueConverterResource
} from '../../../runtime/src/index';
import {
  BindingCommandResource
} from '../../../jit/src/index';
import {
  RuntimeCompilationResources,
  Container
} from '../../src/index'
import { expect } from 'chai';

describe('RuntimeCompilationResources', () => {

  it('does not register while finding resource', () => {
    const container = new Container();
    const resources = new RuntimeCompilationResources(container as any);

    [
      CustomElementResource,
      CustomAttributeResource,
      BindingBehaviorResource,
      ValueConverterResource,
      BindingCommandResource
    ].forEach(r => {
      resources.find(r, 'a');
      expect(container.getResolver(r.keyFrom('a'), false)).to.be.null;
    });
  });
});
