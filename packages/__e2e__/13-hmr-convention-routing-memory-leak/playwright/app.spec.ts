import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { parseSnapshot } from 'v8-heapsnapshot';

test.describe.serial('examples/hmr-webpack-e2e/app.spec.ts', function () {

  test('hmr does not cause memory leak', async function ({ page, baseURL }) {
    test.setTimeout(1_000_000_000);

    const client = await page.context().newCDPSession(page);
    await client.send('HeapProfiler.enable');

    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    let snapshot = await takeSnapshot('initial.heapsnapshot');
    let v8Snapshot = await parseSnapshot(snapshot);
    expect(v8Snapshot.nodes.filter(n => n.toString().includes('<p-1>')).length).toBeGreaterThan(0);
    expect(v8Snapshot.nodes.filter(n => n.toString().includes('<p-2>')).length).toBe(0);

    // navigate to p-2
    await page.click('text=Page 2');
    await page.locator('text=p-2').waitFor({ state: 'visible' });
    snapshot = await takeSnapshot('post-navigation.heapsnapshot');
    v8Snapshot = await parseSnapshot(snapshot);
    expect(v8Snapshot.nodes.filter(n => n.toString().includes('<p-2>')).length).toBeGreaterThan(0);
    expect(v8Snapshot.nodes.filter(n => n.toString().includes('<p-1>')).length).toBe(0);

    async function takeSnapshot(filename: string): Promise<any> {
      let serializedSnapshot = '';
      await client.send('HeapProfiler.collectGarbage');
      client.on('HeapProfiler.addHeapSnapshotChunk', collectSnapshot);
      await client.send('HeapProfiler.startSampling');
      await client.send('HeapProfiler.takeHeapSnapshot', { captureNumericValue: true, exposeInternals: true });
      client.off('HeapProfiler.addHeapSnapshotChunk', collectSnapshot);

      fs.writeFileSync(path.join(__dirname, '.artifacts', filename), serializedSnapshot);
      return JSON.parse(serializedSnapshot);

      function collectSnapshot({ chunk }: any): void {
        serializedSnapshot += chunk;
      }
    }
  });
});

