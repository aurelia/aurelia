import { assert } from '@aurelia/testing';
import { createCommerceFixture } from './commerce/fixture.js';
import { Category } from './commerce/domain/category.js';
import { Product } from './commerce/domain/product.js';

describe('3-runtime-html/commerce.spec.ts', function () {
  it('works', async function () {
    const { start, stop, appShell } = createCommerceFixture();
    await start();
    assert.strictEqual(appShell.globalFiltersPanel.state, appShell.state);

    const category = new Category();
    const product = new Product();
    category.products.push(product);

    appShell.state.categories.push(category);

    appShell.state.globalFilters.selectedCategoryIds.add(category.id);
    await stop();
  });
});
