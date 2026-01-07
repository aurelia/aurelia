import { expect, Locator, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

for (const useUrlFragmentHash of [true, false]) {
  test.describe(`router.animation - direction detection (useUrlFragmentHash=${useUrlFragmentHash})`, () => {
    addCoverage();

    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/?useUrlFragmentHash=${useUrlFragmentHash}`);
    });

    test.skip('forward and backward navigation use correct translateX directions for both entry and exit animations', async ({ page }) => {
      // Helper function to extract translateX from transform matrix
      const getTranslateX = async (element: Locator) => {
        const transform = await element.evaluate((el: any) => {
          const style = window.getComputedStyle(el);
          return style.transform;
        });

        if (transform === 'none') return 0;

        const matrixRegex = /matrix\([^)]+\)/;
        const matrix = matrixRegex.exec(transform);
        if (matrix) {
          const numberRegex = /[-\d.]+/g;
          const values = matrix[0].match(numberRegex);
          if (values && values.length >= 6) {
            return parseFloat(values[4]); // translateX is the 5th value (index 4)
          }
        }
        return 0;
      };

      // Helper function to capture translateX at two consecutive animation frames
      const captureAnimationDirection = async (element: Locator) => {
        // Wait for router to settle and animation to begin
        await page.waitForTimeout(100);

        // Capture multiple samples to be more robust
        const samples = [];

        // Sample 1
        let x = await getTranslateX(element);
        samples.push(x);
        await page.waitForTimeout(50);

        // Sample 2
        x = await getTranslateX(element);
        samples.push(x);
        await page.waitForTimeout(50);

        // Sample 3
        x = await getTranslateX(element);
        samples.push(x);

        let direction: 'left' | 'right' | 'none' = 'none';

        // Analyze trend across samples
        if (samples.length >= 2) {
          let leftCount = 0;
          let rightCount = 0;

          for (let i = 1; i < samples.length; i++) {
            if (Math.abs(samples[i]) > 1 && Math.abs(samples[i - 1]) > 1) {
              if (samples[i] < samples[i - 1]) {
                leftCount++;
              } else if (samples[i] > samples[i - 1]) {
                rightCount++;
              }
            }
          }

          if (leftCount > rightCount) {
            direction = 'left';
          } else if (rightCount > leftCount) {
            direction = 'right';
          }
        }

        return { samples, direction };
      };

      // Navigate to one page first to set up for testing
      await page.click('#page-one-link');
      await expect(page.locator('#root-vp')).toContainText('One page');

      // Test 1: Forward navigation (one -> two)
      console.log('Testing forward navigation ENTRY and EXIT animations...');

      const oneElement = page.locator('#root-vp one');

      // Start navigation to two page
      const forwardNavPromise = page.click('#page-two-link');

      // Capture EXIT animation movement: 'one' page should move LEFT (x2 < x1)
      const forwardExit = await captureAnimationDirection(oneElement);

      // Wait for the new page element to appear and capture ENTRY animation
      const twoElement = page.locator('#root-vp two');
      await twoElement.waitFor({ state: 'attached', timeout: 2000 });

      // Capture ENTRY animation movement: 'two' page should move LEFT (from right towards center, x2 < x1)
      const forwardEntry = await captureAnimationDirection(twoElement);

      await forwardNavPromise;
      await expect(page.locator('#root-vp')).toContainText('Two page');

      console.log(`Forward EXIT: samples=${JSON.stringify(forwardExit.samples)}, direction=${forwardExit.direction}`);
      console.log(`Forward ENTRY: samples=${JSON.stringify(forwardEntry.samples)}, direction=${forwardEntry.direction}`);

      // Test 2: Backward navigation (two -> one)
      console.log('Testing backward navigation ENTRY and EXIT animations...');

      // Start backward navigation
      const backNavPromise = page.goBack();

      // Capture EXIT animation movement: 'two' page should move RIGHT (x2 > x1)
      const backwardExit = await captureAnimationDirection(twoElement);

      // Wait for the one page element to appear again and capture ENTRY animation
      await oneElement.waitFor({ state: 'attached', timeout: 2000 });

      // Capture ENTRY animation movement: 'one' page should move RIGHT (from left towards center, x2 > x1)
      const backwardEntry = await captureAnimationDirection(oneElement);

      await backNavPromise;
      await expect(page.locator('#root-vp')).toContainText('One page');

      console.log(`Backward EXIT: samples=${JSON.stringify(backwardExit.samples)}, direction=${backwardExit.direction}`);
      console.log(`Backward ENTRY: samples=${JSON.stringify(backwardEntry.samples)}, direction=${backwardEntry.direction}`);

      let detectedMovement = false;
      // Assertions: Verify animation movement directions
      // Forward navigation: both exit and entry should move LEFT (towards decreasing translateX)
      if (forwardExit.direction !== 'none') {
        expect(forwardExit.direction, 'Forward EXIT direction').toBe('left'); // EXIT to left
        detectedMovement = true;
      }

      if (forwardEntry.direction !== 'none') {
        expect(forwardEntry.direction, 'Forward ENTRY direction').toBe('left'); // ENTRY from right, moving left towards center
        detectedMovement = true;
      }

      // Backward navigation: both exit and entry should move RIGHT (towards increasing translateX)
      if (backwardExit.direction !== 'none') {
        expect(backwardExit.direction, 'Backward EXIT direction').toBe('right'); // EXIT to right
        detectedMovement = true;
      }

      if (backwardEntry.direction !== 'none') {
        expect(backwardEntry.direction, 'Backward ENTRY direction').toBe('right'); // ENTRY from left, moving right towards center
        detectedMovement = true;
      }

      // At minimum, we should have detected some animation movement
      expect(detectedMovement).toBe(true);
    });
  });
}
