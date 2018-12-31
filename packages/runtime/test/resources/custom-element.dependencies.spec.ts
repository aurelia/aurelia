import { expect } from 'chai';
import { CustomElementResource } from '../../src/index';
import { AuDOMTest } from '../au-dom';

describe('CustomElementResource', () => {
  describe(`define`, () => {
    it(`registers local dependencies`, () => {
      const { au, host } = AuDOMTest.setup();

      const fooDef = AuDOMTest.createTextDefinition('msg', 'foo');
      const Foo = CustomElementResource.define(fooDef, class { public msg = 'asdf1'; });

      //@ts-ignore
      const barDef = AuDOMTest.createElementDefinition([[AuDOMTest.createElementInstruction('foo', [['msg', 'msg']])]], 'bar');
      barDef.dependencies = [Foo];
      const Bar = CustomElementResource.define(barDef, class { public msg = 'asdf2'; });

      au.app({ host, component: new Bar() });
      au.start();
      expect(host.textContent).to.equal('asdf2');
    });
  });
});
