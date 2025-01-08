import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe.serial('examples/hmr-webpack-e2e/app.spec.ts', function () {

  test.only('hmr does not cause memory leak', async function ({ page, baseURL }) {
    test.setTimeout(1_000_000_000);

    let serializedSnapshot = '';
    const client = await page.context().newCDPSession(page);
    // await client.send('HeapProfiler.enable');

    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    let snapshot = await takeSnapshot();
    console.log(findInSnapshot(snapshot, 'p-1'));
    // console.log(findDetachedDOMNodes(snapshot));

    // navigate to p-2
    await page.click('text=Page 2');
    await page.locator('text=p-2').waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);
    snapshot = await takeSnapshot();
    console.log(findInSnapshot(snapshot, 'p-2'));
    console.log(findInSnapshot(snapshot, 'p-1'));
    // console.log(findDetachedDOMNodes(snapshot));

    async function takeSnapshot(): Promise<any> {
      serializedSnapshot = '';
      client.on('HeapProfiler.addHeapSnapshotChunk', collectSnapshot);
      await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true });
      client.off('HeapProfiler.addHeapSnapshotChunk', collectSnapshot);
      return JSON.parse(serializedSnapshot);
    }
    function collectSnapshot({ chunk }: any): void {
      serializedSnapshot += chunk;
    }

    function findInSnapshot(snapshot: any, componentName: string): any {
      const result = { nodes: [] }
      const { nodes, edges, strings, snapshot: { meta: { node_fields, edge_fields } } } = snapshot;
      const nodeFieldIndexes = getFieldIndexes(node_fields);

      for (let i = 0; i < nodes.length; i += node_fields.length) {
        const nameIndex = nodes[i + nodeFieldIndexes.name];
        const name = strings[nameIndex];
        if (!name || !name.includes(componentName)) continue;

        const node = Object.create(null);
        for (const [key, value] of Object.entries(nodeFieldIndexes)) {
          node[key] = strings[nodes[i + value]];
        }
        result.nodes.push(node);
      }

      return result;
    }

    function findDetachedDOMNodes(snapshot: any): string[] {
      const { nodes, edges, strings, snapshot: { meta: { node_fields, edge_fields } } } = snapshot;
      const nodeFieldIndexes = getFieldIndexes(node_fields);
      const edgeFieldIndexes = getFieldIndexes(edge_fields);

      const detachedNodes = [];

      for (let i = 0; i < nodes.length; i += node_fields.length) {
        const type = nodes[i + nodeFieldIndexes.type];
        const name = nodes[i + nodeFieldIndexes.name];
        const detachedness = nodes[i + nodeFieldIndexes.detachedness];
        if (detachedness === 0) continue;
        // const detached = isDetachedDOMNode(i, nodes, edges, nodeFieldIndexes, edgeFieldIndexes);

        // if (type === 'object' && detached) {
        detachedNodes.push(strings[name]);
        // }
      }

      return detachedNodes;
    }

    function isDetachedDOMNode(
      nodeIndex: number,
      nodes: any[],
      edges: any[],
      nodeFieldIndexes: any,
      edgeFieldIndexes: any
    ): boolean {
      // Check if the node is a DOM element and has no references to active document
      const typeIndex = nodeIndex + nodeFieldIndexes.type;
      const type = nodes[typeIndex];
      if (type !== 'native') return false;

      const nameIndex = nodeIndex + nodeFieldIndexes.name;
      const name = nodes[nameIndex];
      if (!name.includes('Detached')) return false;

      // Optionally add further checks for DOM-related names, e.g., HTMLDivElement, etc.
      return true;
    }

    function getFieldIndexes(fields: string[]): { [key: string]: number } {
      return fields.reduce((map, field, index) => {
        map[field] = index;
        return map;
      }, {} as { [key: string]: number });
    }


  });
});

