import { expect } from 'chai';
import { CustomElementResource } from '../../src/index';
import { AuDOMConfiguration, AuNode, AuDOM, AuDOMTest } from '../au-dom';

describe('CustomElementResource', () => {
  describe(`define`, () => {
    it(`creates a new class when applied to null`, () => {
      const { au, container, lifecycle, host } = AuDOMTest.setup();

      const fooDef = AuDOMTest.createTextDefinition('msg', 'foo');
      const Foo = CustomElementResource.define(fooDef, class { public msg = 'asdf'; });

      //@ts-ignore
      const barDef = AuDOMTest.createElementDefinition([[AuDOMTest.createElementInstruction('foo', [['msg', 'msg']])]], 'bar');
      barDef.dependencies = [Foo];
      const Bar = CustomElementResource.define(barDef, class { public msg = 'ssss'; });

      au.app({ host, component: new Bar() });
      au.start();
      expect(host.textContent).to.equal('asdf');
    });
  });
});
