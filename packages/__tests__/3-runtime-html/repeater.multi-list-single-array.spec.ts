import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/repeater.multi-list-single-array.spec.ts', function () {
  describe('2 repeaters sharing an array', function () {
    const baseTemplate = `
      <center>
        <div repeat.for="i of items">\${i.id}</div>
        <div repeat.for="i of items">\${i.id}</div>
      </center>
    `;

    it('renders 2 repeaters', async function () {
      const { getBy } = await createFixture
        .component({ items: [{ id: 1 }] })
        .html`${baseTemplate}`
        .build().started;

      assert.strictEqual(getBy('center').textContent.replace(/\s/g, ''), '11');
    });

    it('rerenders on mutation', async function () {
      const { component, getBy } = await createFixture
        .component({ items: [{ id: 1 }, { id: 2 }] })
        .html`${baseTemplate}`
        .build().started;

      component.items.splice(1, 0, { id: 3 });
      assert.strictEqual(getBy('center').textContent.replace(/\s/g, ''), '132132');
    });

    describe('sub repeat', function () {
      const subArray = [{ id: 11 }, { id: 12 }];
      const getItems = () => [
        { id: 1, subs: subArray },
        { id: 2, subs: subArray }
      ];
      const baseTemplate = `
        <center>
          <div repeat.for="i of items">
            <div repeat.for="j of i.subs">\${j.id}</div>
          </div>
          <div repeat.for="i of items">
            <div repeat.for="j of i.subs">\${j.id}</div>
          </div>
        </center>`;

      it('renders 2 child repeaters sharing the same array', async function () {
        const { getBy } = await createFixture
          .component({ items: getItems() })
          .html`${baseTemplate}`
          .build().started;

        assert.strictEqual(getBy('center').textContent.replace(/\s/g, ''), '1112'.repeat(4));
      });

      it('renders 2 child repeaters sharing the same array on mutation', async function () {
        const { component, getBy } = await createFixture
          .component({ items: getItems() })
          .html`${baseTemplate}`
          .build().started;

        component.items[0].subs.splice(1, 0, { id: 13 });
        assert.strictEqual(getBy('center').textContent.replace(/\s/g, ''), '111312'.repeat(4));
      });
    });
  });
});
