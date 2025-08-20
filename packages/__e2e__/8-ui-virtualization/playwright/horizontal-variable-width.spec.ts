import { test, expect, Page } from '@playwright/test';

test.describe('Horizontal Variable Width Virtual Repeat', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(30000);
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  });

  const getItemAndDivCount = async (page: Page) => {
    await page.waitForTimeout(100);

    const itemsCount = await page.getByTestId("items-count").textContent();
    const repeatContainer = await page.$('#repeat-container');
    const divs = await repeatContainer?.$$('div') || [];

    return {
      container: await repeatContainer?.boundingBox(),
      items: parseInt(itemsCount || '0', 10),
      divs: divs.length,
      d: await Promise.all(divs.map(d => d.textContent()))
    };
  };

  const scrollHorizontally = async (page: Page, px: number) => {
    await page.$eval('#repeat-container', (el, scrollValue) => {
      (el as HTMLElement).scrollLeft = scrollValue;
    }, px);
    await page.waitForTimeout(100);
  };

  test('horizontal variable width - load and basic checks', async ({ page }) => {
    // Load the variable width horizontal demo
    await page.getByTestId("load-variable-width-horizontal").click();
    await page.waitForTimeout(500);

    const counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(500);
    // Because widths vary, expect min 2, max 22 divs
    expect(counts.divs).toBeGreaterThanOrEqual(2);
    expect(counts.divs).toBeLessThanOrEqual(22);
  });

  test('horizontal variable width - scroll right and verify stability', async ({ page }) => {
    // Load the variable width horizontal demo
    await page.getByTestId("load-variable-width-horizontal").click();
    await page.waitForTimeout(500);

    // Scroll right 1000px
    await scrollHorizontally(page, 1000);

    const countsAfterScroll = await getItemAndDivCount(page);
    expect(countsAfterScroll.items).toBe(500);
    expect(countsAfterScroll.divs).toBeGreaterThanOrEqual(2);
    expect(countsAfterScroll.divs).toBeLessThanOrEqual(20);

    // Verify no blank spaces by checking that rendered items have valid text content
    const repeatContainer = await page.$('#repeat-container');
    const visibleDivs = await repeatContainer?.$$('div');
    if (visibleDivs && visibleDivs.length > 0) {
      // Check a few visible items to ensure they have proper content
      // start with 1 since 0 is the buffer div
      for (let i = 1; i < Math.min(3, visibleDivs.length); i++) {
        const divText = await visibleDivs[i].textContent();
        // Should match pattern like "item-0-123 @ 123"
        expect(divText).toMatch(/item-\d+-\d+ @ \d+/);
      }
    }
  });

  test('horizontal variable width - add and remove items responsiveness', async ({ page }) => {
    // Load the variable width horizontal demo
    await page.getByTestId("load-variable-width-horizontal").click();
    await page.waitForTimeout(500);

    // Remove many items to test below max views count
    await page.getByTestId("remove-475").click();
    await page.waitForTimeout(200);

    let counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(25);
    expect(counts.divs).toBeGreaterThanOrEqual(2);
    expect(counts.divs).toBeLessThanOrEqual(20);

    // Remove more to get to very few items
    await page.getByTestId("remove-10").click();
    await page.getByTestId("remove-10").click();
    await page.waitForTimeout(200);

    counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(5);
    expect(counts.divs).toBe(7); // 2 buffer + 5 items

    // Add items back
    await page.getByTestId("add-10").click();
    await page.waitForTimeout(200);

    counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(15);
    expect(counts.divs).toBe(17); // 2 buffer + 15 items

    // Add many items to exceed max views
    await page.getByTestId("add-100").click();
    await page.waitForTimeout(200);

    counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(115);
    expect(counts.divs).toBeGreaterThanOrEqual(2);
    expect(counts.divs).toBeLessThanOrEqual(22);

    // Final scroll test to ensure everything works after operations
    await scrollHorizontally(page, 2000);

    const finalCounts = await getItemAndDivCount(page);
    expect(finalCounts.items).toBe(115);
    expect(finalCounts.divs).toBeGreaterThanOrEqual(2);
    expect(finalCounts.divs).toBeLessThanOrEqual(22);
  });

  test('horizontal variable width - empty array handling', async ({ page }) => {
    // Load the variable width horizontal demo
    await page.getByTestId("load-variable-width-horizontal").click();
    await page.waitForTimeout(500);

    // Remove all items
    await page.getByTestId("remove-475").click();
    await page.waitForTimeout(100);

    // Remove remaining 25
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("remove-10").click();
      await page.waitForTimeout(50);
    }

    let counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(0);
    expect(counts.divs).toBe(2); // Only buffer divs

    // Add one item back to test recovery
    await page.getByTestId("add-1").click();
    await page.waitForTimeout(200);

    counts = await getItemAndDivCount(page);
    expect(counts.items).toBe(1);
    expect(counts.divs).toBe(3); // 2 buffer + 1 item
  });
});
