/* eslint-disable no-await-in-loop */
/* eslint-disable max-lines-per-function */
import { test, expect, Page } from '@playwright/test';

test.describe.serial('examples/ui-virtualization-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  const getItemAndDivCount = async (page: Page) => {
    const repeatContainer = await page.$("#repeat-container");
    if (!repeatContainer) throw new Error();

    await page.waitForTimeout(16);

    return {
      items: parseInt((await page.getByTestId("items-count").textContent()) ?? "", 10),
      divs: (await repeatContainer.$$("div") ?? []).length,
    };
  };

  const scrollHorizontally = async (page: Page, px: number) => {
    await page.$eval('#repeat-container', (el, v) => (el as HTMLElement).scrollLeft = v, px);
    await page.waitForTimeout(16);
  };

  test('test virtual-repeat, check rendered div counts when adding and removing items from array (incl empty array)', async ({ page }) => {

    // expectation of item/div count in virtual-repeat
    // 1 x start-buffer, 1 x end-buffer + (500 container height / 50 item height)*2
    // minimal divs 2
    // maximal divs 22
    await test.step('check basic usage test is loaded', async () => {
      await page.getByTestId("load-basic-usage").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 500, divs: 22 });
    });

    await test.step('check after removing items from array above max views count', async () => {
      await page.getByTestId("remove-475").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 25, divs: 22 });
    });

    await test.step('check after removing items from array below max views count', async () => {
      const remove10Button = page.getByTestId("remove-10");
      await remove10Button.click();
      await remove10Button.click();
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 2, divs: 2 + 2 });
    });

    await test.step('check after adding one item to array below max views count', async () => {
      await page.getByTestId("add-1").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 3, divs: 2 + 3 });
    });

    await test.step('check after removing all items from array', async () => {
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 0, divs: 2 + 0 });
    });

    await test.step('check after array is filled again after being empty', async () => {
      await page.getByTestId("add-1").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 1, divs: 2 + 1 });
    });

    await test.step('check after array is filled again but below max views count', async () => {
      await page.getByTestId("add-10").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 11, divs: 2 + 11 });
    });

    await test.step('check after array is filled again above max views count', async () => {
      await page.getByTestId("add-100").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({ items: 111, divs: 22 });
    });
  });

  test('horizontal variable width', async ({ page }) => {
    // Load the variable width horizontal test
    await test.step('check variable width horizontal test is loaded', async () => {
      await page.getByTestId("load-variable-width-horizontal").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(500);
      // Because widths vary, expect min 2, max 22 divs
      expect(counts.divs).toBeGreaterThanOrEqual(2);
      expect(counts.divs).toBeLessThanOrEqual(22);
    });

    // Test horizontal scrolling and div count stability
    await test.step('scroll right 1000px and verify div count stable and no blank spaces', async () => {
      const initialCounts = await getItemAndDivCount(page);

      // Scroll right 1000px
      await scrollHorizontally(page, 1000);

      const countsAfterScroll = await getItemAndDivCount(page);
      expect(countsAfterScroll.items).toBe(500);
      expect(countsAfterScroll.divs).toBeGreaterThanOrEqual(2);
      expect(countsAfterScroll.divs).toBeLessThanOrEqual(22);

      // Verify no blank spaces by checking that the last visible item has valid text content
      const repeatContainer = await page.$('#repeat-container');
      const visibleDivs = await repeatContainer?.$$('div');
      if (visibleDivs && visibleDivs.length > 0) {
        // Check a few visible items to ensure they have proper content
        // start with 1 since 0 is the buffer div
        for (let i = 1; i < Math.min(3, visibleDivs.length); i++) {
          const divText = await visibleDivs[i].textContent();
          // Should match pattern like "item-0-123 @ index 123"
          expect(divText).toMatch(/item-\d+-\d+ @ \S*\s?\d+/);
        }
      }
    });

    // Test scrolling down (vertical scroll within the horizontal container)
    await test.step('scroll down and verify div count stable', async () => {
      // Note: The container has height:100px and items have height:50px, so vertical scrolling is limited
      // But we test to ensure the virtual repeat handles any potential vertical scroll gracefully
      await page.$eval('#repeat-container', (el) => (el as HTMLElement).scrollTop = 50);
      await page.waitForTimeout(16);

      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(500);
      expect(counts.divs).toBeGreaterThanOrEqual(2);
      expect(counts.divs).toBeLessThanOrEqual(22);
    });

    // Test removing items from array above max views count
    await test.step('check after removing items from array above max views count', async () => {
      await page.getByTestId("remove-475").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(25);
      expect(counts.divs).toBeGreaterThanOrEqual(2);
      expect(counts.divs).toBeLessThanOrEqual(22);
    });

    // Test removing items from array below max views count
    await test.step('check after removing items from array below max views count', async () => {
      const remove10Button = page.getByTestId("remove-10");
      await remove10Button.click();
      await remove10Button.click();
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(2);
      // With only 2 items, we expect 2 buffer divs + 2 item divs = 4 total
      expect(counts.divs).toBe(4);
    });

    // Test adding one item to verify still responsive
    await test.step('check after adding one item to verify still responsive', async () => {
      await page.getByTestId("add-1").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(3);
      // With 3 items, we expect 2 buffer divs + 3 item divs = 5 total
      expect(counts.divs).toBe(5);
    });

    // Test removing all items from array
    await test.step('check after removing all items from array', async () => {
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(0);
      // With 0 items, we expect only 2 buffer divs
      expect(counts.divs).toBe(2);
    });

    // Test array filled again after being empty to verify view recycling works
    await test.step('check after array is filled again after being empty', async () => {
      await page.getByTestId("add-1").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(1);
      expect(counts.divs).toBe(3); // 2 buffer + 1 item
    });

    // Test array filled again but below max views count
    await test.step('check after array is filled again but below max views count', async () => {
      await page.getByTestId("add-10").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(11);
      expect(counts.divs).toBe(13); // 2 buffer + 11 items
    });

    // Test array filled again above max views count to ensure no crashes
    await test.step('check after array is filled again above max views count', async () => {
      await page.getByTestId("add-100").click();
      const counts = await getItemAndDivCount(page);
      expect(counts.items).toBe(111);
      expect(counts.divs).toBeGreaterThanOrEqual(2);
      expect(counts.divs).toBeLessThanOrEqual(22);

      // Final scroll test to ensure everything is still working after all operations
      await scrollHorizontally(page, 2000);
      const finalCounts = await getItemAndDivCount(page);
      expect(finalCounts.items).toBe(111);
      expect(finalCounts.divs).toBeGreaterThanOrEqual(2);
      expect(finalCounts.divs).toBeLessThanOrEqual(22);
    });
  });
});

