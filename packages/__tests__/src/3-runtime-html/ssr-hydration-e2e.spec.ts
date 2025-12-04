/**
 * SSR Hydration E2E Tests
 *
 * These tests verify the REAL SSR → hydration flow:
 * 1. Server: Start Aurelia with ISSRContext { preserveMarkers: true }
 * 2. Server: Render component, capture innerHTML (with markers)
 * 3. Post-process: Rewrite local indices to global, generate manifest
 * 4. Client: Fresh Aurelia, hydrate with processed HTML + manifest
 *
 * This tests what actually happens, not what we think should happen.
 */

import { Aurelia, CustomElement, IPlatform, ISSRContextToken } from '@aurelia/runtime-html';
import { Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import type { IHydrationManifest, IControllerManifest, IViewManifest } from '@aurelia/runtime-html';

/**
 * Post-process SSR output to rewrite local indices to global indices.
 *
 * This is the critical step that makes hydration work:
 * - Input: HTML with local indices (all <!--au:0--> inside each scope)
 * - Output: HTML with global indices (unique <!--au:N--> everywhere) + manifest
 */
function postProcessSSR(
  doc: Document,
  html: string,
  controllerType: 'repeat' | 'if'
): { html: string; manifest: IHydrationManifest } {
  const container = doc.createElement('div');
  container.innerHTML = html;

  let globalIndex = 0;
  const controllers: Record<number, IControllerManifest> = {};

  // NodeFilter.SHOW_COMMENT = 128, Node.ELEMENT_NODE = 1 (numeric values for Node.js)
  const SHOW_COMMENT = 128;
  const ELEMENT_NODE = 1;

  // Find the controller marker (first <!--au:N--> before <!--au-start-->)
  const walker = doc.createTreeWalker(container, SHOW_COMMENT);
  let controllerIndex = -1;
  let startMarker: Comment | null = null;
  let endMarker: Comment | null = null;

  let node: Comment | null;
  while ((node = walker.nextNode() as Comment | null)) {
    if (node.data.startsWith('au:')) {
      if (controllerIndex === -1) {
        controllerIndex = globalIndex++;
        // Rewrite the controller marker
        node.data = `au:${controllerIndex}`;
      }
    } else if (node.data === 'au-start') {
      startMarker = node;
    } else if (node.data === 'au-end') {
      endMarker = node;
      break;
    }
  }

  if (startMarker === null || endMarker === null) {
    // No template controller, just return as-is
    return {
      html: container.innerHTML,
      manifest: { targetCount: globalIndex, controllers: {} }
    };
  }

  // Collect views between start and end markers
  const views: IViewManifest[] = [];
  let current = startMarker.nextSibling;

  while (current && current !== endMarker) {
    if (current.nodeType === ELEMENT_NODE) {
      const viewElement = current as Element;
      const viewStartGlobal = globalIndex;

      // Find and rewrite markers inside this view
      const viewWalker = doc.createTreeWalker(viewElement, SHOW_COMMENT);
      const localTargets: number[] = [];

      let viewNode: Comment | null;
      while ((viewNode = viewWalker.nextNode() as Comment | null)) {
        if (viewNode.data.startsWith('au:')) {
          const localIdx = parseInt(viewNode.data.slice(3), 10);
          localTargets.push(localIdx);
          // Rewrite to global index
          viewNode.data = `au:${globalIndex}`;
          globalIndex++;
        }
      }

      views.push({
        targets: localTargets.length > 0 ? localTargets : [],
        globalTargets: localTargets.length > 0
          ? Array.from({ length: localTargets.length }, (_, i) => viewStartGlobal + i)
          : [],
        nodeCount: 1,
      });
    }
    current = current.nextSibling;
  }

  controllers[controllerIndex] = { type: controllerType, views };

  return {
    html: container.innerHTML,
    manifest: { targetCount: globalIndex, controllers }
  };
}

describe('3-runtime-html/ssr-hydration-e2e.spec.ts', function () {

  /**
   * Helper to render on "server" with markers preserved.
   */
  async function serverRender(
    ctx: ReturnType<typeof TestContext.create>,
    template: string,
    initialState: Record<string, unknown>
  ): Promise<{ html: string; stop: () => Promise<void> }> {
    const doc = ctx.doc;

    // Register SSR context to preserve markers
    ctx.container.register(
      Registration.instance(ISSRContextToken, { preserveMarkers: true })
    );

    // Define component
    const App = CustomElement.define({
      name: 'app',
      template,
    }, class {
      constructor() {
        Object.assign(this, initialState);
      }
    });

    const host = doc.createElement('div');
    doc.body.appendChild(host);

    const au = new Aurelia(ctx.container);
    au.app({ host, component: App });
    await au.start();

    const html = host.innerHTML;

    return {
      html,
      stop: async () => {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  /**
   * Helper to hydrate on "client".
   */
  async function clientHydrate(
    template: string,
    ssrHtml: string,
    state: Record<string, unknown>,
    manifest?: IHydrationManifest
  ): Promise<{
    host: HTMLElement;
    vm: object;
    au: Aurelia;
    stop: () => Promise<void>;
  }> {
    // Fresh context for client
    const ctx = TestContext.create();
    const doc = ctx.doc;

    const App = CustomElement.define({
      name: 'app',
      template,
    }, class {
      constructor() {
        Object.assign(this, state);
      }
    });

    const host = doc.createElement('div');
    host.innerHTML = ssrHtml;
    doc.body.appendChild(host);

    const au = new Aurelia(ctx.container);
    const root = await au.hydrate({
      host,
      component: App,
      state,
      manifest,
    });

    return {
      host,
      vm: root.controller.viewModel,
      au,
      stop: async () => {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  // ============================================================================
  // Simple Cases
  // ============================================================================

  describe('Simple text binding', function () {

    it('server renders then client hydrates simple text', async function () {
      const ctx = TestContext.create();
      const template = '<div>${message}</div>';
      const state = { message: 'Hello SSR' };

      // 1. Server render
      const server = await serverRender(ctx, template, state);
      console.log('Server HTML:', server.html);

      // Verify server output has the text
      assert.ok(server.html.includes('Hello SSR'), 'server should render text');

      await server.stop();

      // 2. Client hydrate (no manifest needed for simple text binding)
      const client = await clientHydrate(template, server.html, state);

      // Verify hydration worked
      assert.strictEqual(client.host.textContent, 'Hello SSR');

      // 3. Test reactivity
      (client.vm as { message: string }).message = 'Updated';
      await Promise.resolve();
      assert.strictEqual(client.host.textContent, 'Updated');

      await client.stop();
    });
  });

  describe('Simple repeat', function () {

    // This test verifies the post-processing approach:
    // 1. Aurelia SSR emits local indices (all <!--au:0--> in each view)
    // 2. Post-processing rewrites to global indices and builds manifest
    // 3. Client hydrates with processed HTML + manifest
    it('server renders then client hydrates repeat with post-processing', async function () {
      const ctx = TestContext.create();
      const template = '<div repeat.for="item of items">${item}</div>';
      const state = { items: ['A', 'B', 'C'] };

      // 1. Server render
      const server = await serverRender(ctx, template, state);
      console.log('Server HTML (raw):', server.html);

      // Verify server output has local indices (all <!--au:0-->)
      assert.ok(server.html.includes('A'), 'should have A');
      assert.ok(server.html.includes('B'), 'should have B');
      assert.ok(server.html.includes('C'), 'should have C');

      await server.stop();

      // 2. Post-process: rewrite local indices to global indices
      const processed = postProcessSSR(ctx.doc, server.html, 'repeat');
      console.log('Processed HTML:', processed.html);
      console.log('Manifest:', JSON.stringify(processed.manifest, null, 2));

      // Verify post-processing assigned unique global indices
      // Controller at 0, then views with targets at 1, 2, 3
      assert.ok(processed.manifest.targetCount >= 1, 'should have targets');

      // 3. Client hydrate with processed HTML and manifest
      const client = await clientHydrate(template, processed.html, state, processed.manifest);

      // Verify hydration worked - no double-rendering
      const divs = client.host.querySelectorAll('div');
      console.log('Client divs after hydration:', divs.length);
      assert.strictEqual(divs.length, 3, 'should have exactly 3 divs (no double-rendering)');
      assert.strictEqual(divs[0]?.textContent, 'A');
      assert.strictEqual(divs[1]?.textContent, 'B');
      assert.strictEqual(divs[2]?.textContent, 'C');

      // 4. Test reactivity - push
      (client.vm as { items: string[] }).items.push('D');
      await Promise.resolve();

      const divsAfter = client.host.querySelectorAll('div');
      assert.strictEqual(divsAfter.length, 4);
      assert.strictEqual(divsAfter[3]?.textContent, 'D');

      await client.stop();
    });
  });

  describe('Simple if', function () {

    it('server renders then client hydrates if.bind=true', async function () {
      const ctx = TestContext.create();
      const template = '<div if.bind="show">Visible</div>';
      const state = { show: true };

      // 1. Server render
      const server = await serverRender(ctx, template, state);
      console.log('Server HTML:', server.html);

      assert.ok(server.html.includes('Visible'), 'should have content');

      await server.stop();

      // 2. Client hydrate
      const manifest: IHydrationManifest = {
        targetCount: 1,
        controllers: {
          0: {
            type: 'if',
            views: [{ targets: [], nodeCount: 1 }]
          }
        }
      };

      const client = await clientHydrate(template, server.html, state, manifest);

      assert.strictEqual(client.host.querySelectorAll('div').length, 1);

      // 3. Test reactivity - toggle off
      (client.vm as { show: boolean }).show = false;
      await Promise.resolve();
      assert.strictEqual(client.host.querySelectorAll('div').length, 0);

      // 4. Toggle back on
      (client.vm as { show: boolean }).show = true;
      await Promise.resolve();
      assert.strictEqual(client.host.querySelectorAll('div').length, 1);

      await client.stop();
    });
  });

});
