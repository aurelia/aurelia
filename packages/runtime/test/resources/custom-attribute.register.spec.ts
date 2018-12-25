import { expect } from 'chai';
import { Container } from '../../../../kernel/src';
import { createCustomAttribute } from './custom-attribute._builder';

describe('@customAttribute', () => {
  describe('register', () => {
    it('registers the custom attribute as transient', () => {
      const { Type } = createCustomAttribute();
      const container = new Container();

      Type.register(container);

      const resolved1 = container.get('custom-attribute:foo');
      const resolved2 = container.get('custom-attribute:foo');
      expect(resolved1).not.to.equal(resolved2);
    });

    it('registers the custom attribute with aliases that are transient', () => {
      const { Type } = createCustomAttribute({
        name: 'foo',
        aliases: ['bar', 'baz']
      });
      const container = new Container();

      Type.register(container);

      const resolved1 = container.get('custom-attribute:foo');
      const resolved2 = container.get('custom-attribute:bar');
      const resolved3 = container.get('custom-attribute:bar');
      const resolved4 = container.get('custom-attribute:baz');
      const resolved5 = container.get('custom-attribute:baz');
      expect(resolved1.constructor).to.equal(resolved2.constructor);
      expect(resolved1.constructor).to.equal(resolved4.constructor);
      expect(resolved2).not.to.equal(resolved3);
      expect(resolved4).not.to.equal(resolved5);
    });
  });
});
