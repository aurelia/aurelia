import { test, expect, Page, ElementHandle } from '@playwright/test';

test.describe.serial('examples/ui-virtualization-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  const getItemAndDivCount = async (page: Page) =>{
    const repeatContainer = await page.$("#repeat-container");
    if (!repeatContainer) throw new Error();

    await page.waitForTimeout(16);

    return {
      items: parseInt((await page.getByTestId("items-count").textContent()) ?? "", 10),
      divs: (await repeatContainer.$$("div") ?? []).length,
    };
  };

  test('test virtual-repeat, check rendered div counts when adding and removing items from array (incl empty array)', async ({ page }) => {

    // expectation of item/div count in virtual-repeat
    // 1 x start-buffer, 1 x end-buffer + (500 container height / 50 item height)*2
    // minimal divs 2
    // maximal divs 22
    await test.step('check basic usage test is loaded', async () => {
      await page.getByTestId("load-basic-usage").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 500, divs: 22});
    });

    await test.step('check after removing items from array above max views count', async () => {
      await page.getByTestId("remove-475").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 25, divs: 22});
    });

    await test.step('check after removing items from array below max views count', async () => {
      const remove10Button = page.getByTestId("remove-10");
      await remove10Button.click();
      await remove10Button.click();
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 2, divs: 2 + 2});
    });

    await test.step('check after adding one item to array below max views count', async () => {
      await page.getByTestId("add-1").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 3, divs: 2 + 3});
    });

    await test.step('check after removing all items from array', async () => {
      const remove1Button = page.getByTestId("remove-1");
      await remove1Button.click();
      await remove1Button.click();
      await remove1Button.click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 0, divs: 2 + 0});
    });

    await test.step('check after array is filled again after being empty', async () => {
      await page.getByTestId("add-1").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 1, divs: 2 + 1});
    });

    await test.step('check after array is filled again but below max views count', async () => {
      await page.getByTestId("add-10").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 11, divs: 2 + 11});
    });

    await test.step('check after array is filled again above max views count', async () => {
      await page.getByTestId("add-100").click();
      expect(await getItemAndDivCount(page)).toStrictEqual({items: 111, divs: 22});
    });
  });
});

