import { TestBuilder } from './test-builder';

describe.only('runtime', () => {
  it('1', () => {

    const c = TestBuilder.app({
        items: ['a', 'b', 'c']
      },
      def => def.repeat(
        def => def.interpolation('item'),
        ins => ins.iterator('item', 'items')
      )
    ).build();

    c.startAndAssertTextContentEquals('abc');

    c.stopAndAssertTextContentEmpty();

    c.dispose();
  });
});
