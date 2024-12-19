import { nextTick } from '@aurelia/runtime';
import { createCommerceFixture } from './commerce/fixture.js';
import { assert } from '@aurelia/testing';
import { initDashboardState } from './commerce/data.js';
import { DashboardState } from './commerce/domain/dashboard-state.js';
import { Product } from './commerce/domain/product.js';
import { ForecastRecord, GlobalFilters, SaleRecord } from './commerce/domain/index.js';

describe('3-runtime-html/commerce.spec.ts', function () {
  it('works', async function () {
    const { start, stop, appShell } = createCommerceFixture();
    await start();

    appShell._assertViewsMatchState();

    await stop();
  });

  describe('with a single product', function () {
    function initState() {
      const state = new DashboardState(
        new GlobalFilters(
          new Date('2024-01-01'),
          new Date('2024-01-03'),
          new Set(['cat-electronics']),
          false,
          false
        )
      );

      const electronics = state.addCategory({
        id: 'cat-electronics',
        name: 'Electronics'
      });
      const laptopX = electronics.addProduct({
        id: 'prod-laptop-1',
        name: 'Laptop X',
        categoryId: 'cat-electronics',
        price: 1499.99,
        currentInventory: 20,
        reorderThreshold: 5,
        pendingPurchaseOrderQty: 0
      });

      return state;
    }

    it('updates displayed product names and prices when product properties change via property bindings', async function () {
      const { start, stop, appShell } = createCommerceFixture();
      appShell.state = initState();
      await start();

      const productItemView = appShell.categoryOverview.itemViews[0].productListView.itemViews[0];

      const originalName = productItemView.name;
      const newName = `${originalName} updated`;
      productItemView.nameInput.value = newName;
      productItemView.nameInput.dispatchEvent(new Event('change'));

      const originalPrice = productItemView.price;
      const newPrice = originalPrice + 1;
      productItemView.priceInput.value = newPrice.toString();
      productItemView.priceInput.dispatchEvent(new Event('change'));

      // note: the event handler does `callSource` synchronously which is why state is immediately updated
      // but the contentBinding is asynchronous which is why that one is only updated after awaiting nextTick
      assert.strictEqual(productItemView.name, newName, 'expected newName in state');
      assert.strictEqual(productItemView.price, newPrice, 'expected newPrice in state');
      assert.strictEqual(productItemView.nameLabel.textContent, originalName, 'expected originalName in ui');
      assert.strictEqual(productItemView.priceLabel.textContent, originalPrice.toString(), 'expected originalPrice in ui');

      await nextTick();

      assert.strictEqual(productItemView.name, newName, 'expected newName in state');
      assert.strictEqual(productItemView.price, newPrice, 'expected newPrice in state');
      assert.strictEqual(productItemView.nameLabel.textContent, newName, 'expected newName in ui');
      assert.strictEqual(productItemView.priceLabel.textContent, newPrice.toString(), 'expected newPrice in ui');

      appShell._assertViewsMatchState();

      await stop();
    });

    it('toggles low-inventory visual indicators through attribute bindings when product.lowInventoryAlert switches from false to true', async function () {
      const { start, stop, appShell } = createCommerceFixture();
      appShell.state = initState();
      await start();

      const state = appShell.state;
      state.globalFilters.enableAutoRestock = false;
      const now = new Date();
      state.globalFilters.endDate = now;
      const productItemView = appShell.categoryOverview.itemViews[0].productListView.itemViews[0];
      const product = productItemView.product;

      assert.strictEqual(productItemView.lowInventoryAlert, false, 'lowInventoryAlert pre-sale');
      product.recordSale(now, product.currentInventory);
      assert.strictEqual(productItemView.lowInventoryAlert, true, 'lowInventoryAlert post-sale');

      assert.strictEqual(productItemView.lowInventoryAlertDiv, undefined, 'lowInventoryAlertDiv');

      await nextTick();

      // TODO: this is just a domain model test. Use attribute class binding in the view with green/red marker instead
      assert.instanceOf(productItemView.lowInventoryAlertDiv, HTMLDivElement, 'lowInventoryAlertDiv');

      appShell._assertViewsMatchState();

      await stop();
    });

    it.only('handles complex update chains in inventory management scenario', async function () {
      const { start, stop, appShell } = createCommerceFixture();
      const state = initState();

      // Setup historical data spanning 3 months with increasing sales trend
      const laptop = state.searchProducts('laptop')[0];

      // Create sales data: 1 unit/day in month 1, 2 units/day in month 2, 3 units/day in month 3
      const startDate = new Date('2023-11-01');
      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const unitsSold = Math.floor(i / 30) + 1;
        laptop.historicalSalesData.push(new SaleRecord(date, unitsSold));
      }

      // Add some forecast data showing continued growth
      const forecastStart = new Date('2024-01-04');
      for (let i = 0; i < 30; i++) {
        const date = new Date(forecastStart);
        date.setDate(date.getDate() + i);
        laptop.forecastedSalesData.push(new ForecastRecord(date, 4)); // Projecting 4 units/day
      }

      appShell.state = state;
      await start();

      // Initial state check
      assert.strictEqual(laptop.computedSalesTrend, 2, 'Expected average of 2 units/day without projections');

      // Enable projected trends - should trigger recomputation including forecast data
      state.globalFilters.showProjectedTrends = true;
      await nextTick();
      assert.strictEqual(laptop.computedSalesTrend, 3, 'Expected average of 3 units/day with projections');

      // Record a large sale that triggers low inventory
      laptop.recordSale(new Date(), 15);
      await nextTick();
      assert.strictEqual(laptop.lowInventoryAlert, true, 'Should trigger low inventory alert');

      // Enable auto-restock
      state.globalFilters.enableAutoRestock = true;
      await nextTick();
      // Should see increased recommendedRestockLevel due to 10% buffer
      // and pendingPurchaseOrderQty should be updated due to auto-restock

      // Commit the restock
      laptop.commitRestock();
      await nextTick();
      assert.strictEqual(laptop.lowInventoryAlert, false, 'Alert should clear after restock');

      appShell._assertViewsMatchState();
      await stop();
    });
  });

  it.skip('recomputes and displays recommended restock levels in the UI after enabling auto restock (enableAutoRestock) and updating product inventory', function () {
    // Changing globalFilters.enableAutoRestock and product.currentInventory should trigger computed properties and update bound elements
  });

  it.skip('updates filtered historical sales displays inside repeated templates when global date filters (startDate/endDate) change', function () {
    // A `repeat.for` over product.filteredHistoricalSales should re-render items as the filters cause updates
  });

  it.skip('reflects changes in computedSalesTrend in a bound progress bar or trend indicator when showProjectedTrends toggles', function () {
    // Binding computedSalesTrend to a graphical element should cause it to re-render as the filter changes the underlying data set
  });

  it.skip('triggers attribute-bound conditional UI elements (e.g., using if.bind) when categories are added or removed from selectedCategoryIds', function () {
    // Adding/removing a category in globalFilters.selectedCategoryIds should update category/product lists shown in the UI
  });

  it.skip('ensures event handlers for user actions (e.g., clicking a "Recalculate Trends" button) cause asynchronous property updates and rebindings throughout nested components', function () {
    // A click event handler triggers a recomputation of forecastedSalesData, which should propagate through computed properties and reflected bindings
  });

  it.skip('maintains stable UI updates under rapid consecutive changes (e.g., user toggling showProjectedTrends repeatedly) without inconsistent intermediate states', function () {
    // Quickly changing showProjectedTrends on/off multiple times should still ensure the final state of computed fields and their bound elements stabilizes correctly
  });

  it.skip('re-evaluates aggregated category-level computed properties after modifying a single product’s sales data, ensuring category headers and summaries update asynchronously', function () {
    // Adjusting a product’s sales records causes an asynchronous cascade that updates category.aggregatedSalesTrend, displayed in category-level bindings
  });

  it.skip('synchronizes user-driven input changes in text fields or checkboxes (bound two-way) with complex computed dependencies, ensuring correct UI reflow and no stale values', function () {
    // A two-way binding from a checkbox to showProjectedTrends or enableAutoRestock should cause computed fields and their UI representations to update reactively
  });

  it.skip('reflects inline edits to product name and price fields (two-way bound inputs) in the main dashboard view without needing a manual refresh', function () {
    // Editing fields in an `<input value.two-way="product.name">` or `<input value.two-way="product.price">` should propagate changes back to the dashboard’s displayed product list
  });

  it.skip('updates category-level summaries immediately after changing a product’s reorderThreshold in the edit screen, ensuring computed properties in parent components rebind', function () {
    // Adjusting product.reorderThreshold in an edit form should trigger recalculations in category.aggregatedRecommendedRestock and update any UI element bound to that value
  });

  it.skip('correctly re-renders repeated template lists when adding a new product via an edit screen, ensuring that computed categories and alerts update asynchronously', function () {
    // Inserting a new product into a category and saving from the edit modal should appear in the main list and update the category’s aggregated metrics, triggering all bound elements to refresh
  });

  it.skip('safely handles removal of a product in the edit screen, causing the dashboard to recompute aggregated values and remove associated alerts without leaving stale bindings behind', function () {
    // Deleting a product from within the edit screen should update repeat.for lists, and computed properties (like aggregatedSalesTrend), and remove any outdated inventory alerts automatically
  });

  it.skip('refreshes computedSalesTrend and recommendedRestockLevel when editing forecastedSalesData inline, verifying that computed fields and their bindings stay in sync under asynchronous updates', function () {
    // Directly editing forecast data via an inline editor (e.g. a `<textarea>` or `<input>` bound two-way) should immediately reflect changes in computedTrend visualizations in the dashboard
  });

  it.skip('applies globalFilters at the edit screen level to show/hide certain product details dynamically, testing complex asynchronous data flows triggered by filter changes while editing', function () {
    // Toggling global filters from within an edit context (perhaps a side panel) should still correctly influence which product attributes or related data points are displayed and bound
  });

  it.skip('maintains consistent state across nested components when a user updates product details, triggers a manual recompute event via a bound button, and rapidly toggles global filters', function () {
    // A combination of user actions (editing product details, clicking a “Recalculate” button with a click.delegate handler, and changing globalFilters) tests the stability and reactivity of all bindings in a complex, nested scenario
  });

  it.skip('correctly handles revert actions in the edit screen (bound to a "Cancel" button) that restore previous product values and reverts computed fields in the main view without stale references', function () {
    // Clicking a "Cancel" button bound to revert changes should restore original product attributes and ensure all computed fields and the dashboard’s UI immediately reflect the old data set
  });

  it.skip('domain model works', function () {
    const state = initDashboardState();
    const laptop = state.searchProducts('laptop')[0];

    laptop.recordSale(new Date('2024-01-01'), 5);
    log(state, laptop);

    laptop.recordSale(new Date('2024-01-02'), 5);
    log(state, laptop);

    laptop.recordSale(new Date('2024-01-03'), 5);
    log(state, laptop);

    // laptop.recordSale(new Date('2024-01-03'), 2);
    // log(state, laptop);

    // laptop.recordSale(new Date('2024-01-04'), 4);
    // laptop.recordSale(new Date('2024-01-10'), 6);
  });
});

const log = (state: DashboardState, product: Product) => {
  const category = product.category;

  console.log('---');
  console.log(`filteredHistoricalSales: ${product.filteredHistoricalSales.length}`);
  console.log(`computedSalesTrend: ${product.computedSalesTrend}`);
  console.log(`recommendedRestockLevel: ${product.recommendedRestockLevel}`);
  console.log(`lowInventoryAlert: ${product.lowInventoryAlert}`);
  console.log(`currentInventory: ${product.currentInventory}`);
  console.log(`reorderThreshold: ${product.reorderThreshold}`);
  console.log(`pendingPurchaseOrderQty: ${product.pendingPurchaseOrderQty}`);
};
