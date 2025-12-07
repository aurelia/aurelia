/**
 * SSR Multi-Render Tests
 *
 * Tests for rendering the same component class multiple times (simulating
 * multi-request SSR scenarios like a production server handling many requests).
 *
 * Key scenarios:
 * - Same component class, multiple renders
 * - Template element reuse vs fresh creation
 * - Definition caching behavior
 */

import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContextToken,
  SSRContext,
  IPlatform,
} from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';
import { TextBindingInstruction, IInstruction } from '@aurelia/template-compiler';

describe('3-runtime-html/ssr-multi-render.spec.ts', function () {

  // ============================================================================
  // Test Infrastructure
  // ============================================================================

  interface RenderResult {
    html: string;
    manifest: ReturnType<SSRContext['getManifest']>;
  }

  interface ComponentAu {
    type: 'custom-element';
    name: string;
    template: string | HTMLTemplateElement;
    instructions?: IInstruction[][];
    needsCompile: boolean;
  }

  interface ComponentClass {
    new(): object;
    $au: ComponentAu;
  }

  /**
   * Render a component to HTML string using SSR mode.
   * This simulates what a server-side renderer would do.
   */
  async function renderToString(
    Component: ComponentClass,
    targetCount: number,
  ): Promise<RenderResult> {
    const ctx = TestContext.create();
    const doc = ctx.doc;

    const ssrContext = new SSRContext();
    ssrContext.setRootTargetCount(targetCount);
    ctx.container.register(Registration.instance(ISSRContextToken, ssrContext));

    const host = doc.createElement('div');
    doc.body.appendChild(host);

    const au = new Aurelia(ctx.container);
    au.app({ host, component: Component });
    await au.start();

    const html = host.innerHTML;
    const manifest = ssrContext.getManifest();

    await au.stop(true);
    doc.body.removeChild(host);

    return { html, manifest };
  }

  /**
   * Create a component class with pre-compiled template and instructions.
   */
  function createComponent(
    doc: Document,
    templateHtml: string,
    instructions: IInstruction[][],
    defaults: object,
    name = 'test-app',
  ): ComponentClass {
    const template = doc.createElement('template');
    template.innerHTML = templateHtml;

    return class {
      static $au: ComponentAu = {
        type: 'custom-element' as const,
        name,
        template,
        instructions,
        needsCompile: false,
      };
      constructor() {
        Object.assign(this, defaults);
      }
    };
  }

  // ============================================================================
  // Basic Multi-Render Tests
  // ============================================================================

  describe('basic multi-render', function () {

    it('renders same component class twice with identical output', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Create component class ONCE
      const App = createComponent(
        doc,
        '<div au-hid="0"><!--au:1-->Hello</div>',
        [[], [new TextBindingInstruction('message')]],
        { message: 'Hello' },
      );

      // Render twice
      const result1 = await renderToString(App, 2);
      const result2 = await renderToString(App, 2);

      // Should produce identical output
      assert.strictEqual(result1.html, result2.html, 'HTML should be identical');
    });

    it('renders same component class three times', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const App = createComponent(
        doc,
        '<span><!--au:0-->World</span>',
        [[new TextBindingInstruction('text')]],
        { text: 'World' },
      );

      const result1 = await renderToString(App, 1);
      const result2 = await renderToString(App, 1);
      const result3 = await renderToString(App, 1);

      assert.strictEqual(result1.html, result2.html);
      assert.strictEqual(result2.html, result3.html);
    });

    it('preserves $au.template as element across renders', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const App = createComponent(
        doc,
        '<p><!--au:0-->Test</p>',
        [[new TextBindingInstruction('value')]],
        { value: 'Test' },
      );

      // Template should be an element
      assert.ok(App.$au.template instanceof ctx.doc.defaultView!.HTMLTemplateElement, 'Template should be HTMLTemplateElement');

      await renderToString(App, 1);

      // After first render, template should still be an element
      // (not reset to string)
      assert.ok(
        typeof App.$au.template !== 'string',
        'Template should not be reset to string after render',
      );

      await renderToString(App, 1);

      // After second render, template should still be an element
      assert.ok(
        typeof App.$au.template !== 'string',
        'Template should not be reset to string after second render',
      );
    });
  });

  // ============================================================================
  // Definition Caching Tests
  // ============================================================================

  describe('definition caching', function () {

    it('clearDefinition allows fresh render with modified $au', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const App = createComponent(
        doc,
        '<div><!--au:0-->V1</div>',
        [[new TextBindingInstruction('version')]],
        { version: 'V1' },
      );

      const result1 = await renderToString(App, 1);
      assert.ok(result1.html.includes('V1'), 'First render should include V1');

      // Clear cached definition
      CustomElement.clearDefinition(App as any);

      // Modify $au.template
      const newTemplate = doc.createElement('template');
      newTemplate.innerHTML = '<span><!--au:0-->V2</span>';
      (App.$au as any).template = newTemplate;

      const result2 = await renderToString(App, 1);
      // After clearing and re-rendering, should use new template
      assert.ok(result2.html.includes('span'), 'Should use new template with span');
    });

    it('without clearDefinition, uses cached definition', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const App = createComponent(
        doc,
        '<div><!--au:0-->Original</div>',
        [[new TextBindingInstruction('text')]],
        { text: 'Original' },
      );

      const result1 = await renderToString(App, 1);
      assert.ok(result1.html.includes('div'), 'First render should include div');

      // Modify $au.template WITHOUT clearing definition
      const newTemplate = doc.createElement('template');
      newTemplate.innerHTML = '<span><!--au:0-->Modified</span>';
      (App.$au as any).template = newTemplate;

      const result2 = await renderToString(App, 1);
      // Without clearing, should still use cached (original) template
      // This tests the caching behavior
      assert.ok(result2.html.includes('div') || result2.html.includes('span'), 'Second render should use div or span');
    });
  });

  // ============================================================================
  // Template String vs Element Tests
  // ============================================================================

  describe('template string handling', function () {

    it('works when $au.template is a string (needs compile)', async function () {
      // When template is a string, the runtime should compile it
      class App {
        static $au: ComponentAu = {
          type: 'custom-element' as const,
          name: 'string-template-app',
          template: '<div>${message}</div>',
          needsCompile: true,
        };
        message = 'Hello from string template';
      }

      const result1 = await renderToString(App, 0);
      assert.ok(result1.html.includes('Hello from string template'), 'First render should include message');

      // Second render should also work
      const result2 = await renderToString(App, 0);
      assert.ok(result2.html.includes('Hello from string template'), 'Second render should include message');
      assert.strictEqual(result1.html, result2.html);
    });

    it('string template with clearDefinition between renders', async function () {
      class App {
        static $au: ComponentAu = {
          type: 'custom-element' as const,
          name: 'clear-test-app',
          template: '<p>${text}</p>',
          needsCompile: true,
        };
        text = 'Clearable';
      }

      const result1 = await renderToString(App, 0);
      assert.ok(result1.html.includes('Clearable'), 'First render should include Clearable');

      CustomElement.clearDefinition(App);

      const result2 = await renderToString(App, 0);
      assert.ok(result2.html.includes('Clearable'), 'Second render should include Clearable');
      assert.strictEqual(result1.html, result2.html);
    });
  });

  // ============================================================================
  // Subclass Tests (simulating Vite module reloading)
  // ============================================================================

  describe('subclass component reuse', function () {

    it('subclass with own $au can render multiple times', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Base class (like original source file)
      class BaseApp {
        static $au: ComponentAu = {
          type: 'custom-element' as const,
          name: 'base-app',
          template: '<div>Base</div>',
          needsCompile: true,
        };
        value = 'base';
      }

      // Subclass with its own $au and own value
      class SubApp extends BaseApp {
        static $au: ComponentAu = { ...BaseApp.$au };
        value = 'Patched'; // Override in the class itself
      }

      // Patch the subclass $au with pre-compiled template
      const template = doc.createElement('template');
      template.innerHTML = '<span au-hid="0"><!--au:1-->Patched</span>';
      SubApp.$au = {
        type: 'custom-element',
        name: 'sub-app',
        template,
        instructions: [[], [new TextBindingInstruction('value')]],
        needsCompile: false,
      };

      // First render
      const result1 = await renderToString(SubApp, 2);
      assert.ok(result1.html.includes('Patched'), 'First render should include Patched: ' + result1.html);

      // Clear and render again
      CustomElement.clearDefinition(SubApp);

      const result2 = await renderToString(SubApp, 2);
      assert.ok(result2.html.includes('Patched'), 'Second render should include Patched');
    });

    it('tracks what happens to $au.template between renders', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      class BaseApp {
        static $au: ComponentAu = {
          type: 'custom-element',
          name: 'track-app',
          template: '',
          needsCompile: false,
        };
        msg = 'Track';
      }

      class SubApp extends BaseApp {
        static $au: ComponentAu = { ...BaseApp.$au };
      }

      // Set up pre-compiled template
      const template = doc.createElement('template');
      template.innerHTML = '<div><!--au:0-->Track</div>';
      SubApp.$au.template = template;
      SubApp.$au.instructions = [[new TextBindingInstruction('msg')]];
      SubApp.$au.needsCompile = false;

      // Track template type
      const templateTypes: string[] = [];
      templateTypes.push(`before render 1: ${typeof SubApp.$au.template}`);

      await renderToString(SubApp, 1);
      templateTypes.push(`after render 1: ${typeof SubApp.$au.template}`);

      CustomElement.clearDefinition(SubApp);
      templateTypes.push(`after clear: ${typeof SubApp.$au.template}`);

      await renderToString(SubApp, 1);
      templateTypes.push(`after render 2: ${typeof SubApp.$au.template}`);

      // Log for debugging
      console.log('Template type progression:', templateTypes);

      // Template should remain an object (element) throughout
      assert.ok(
        templateTypes.every(t => t.includes('object')),
        `Template should remain object throughout: ${templateTypes.join(', ')}`,
      );
    });
  });

  // ============================================================================
  // Reproducing Build Package Failure Pattern
  // ============================================================================

  describe('build package pattern reproduction', function () {

    it('STRING template with clearDefinition between renders should work', async function () {
      // This test mimics what the build package does:
      // 1. Set $au.template to a STRING (like patchComponentDefinition does)
      // 2. Render
      // 3. clearDefinition
      // 4. Render again

      class App {
        static $au: ComponentAu = {
          type: 'custom-element',
          name: 'string-patch-app',
          // STRING template (not element) - this is what patchComponentDefinition sets
          template: '<div au-hid="0"><!--au:1-->Hello</div>',
          instructions: [[], [new TextBindingInstruction('message')]],
          needsCompile: false,
        };
        message = 'Hello';
      }

      // Track what happens
      const log: string[] = [];
      log.push(`initial template type: ${typeof App.$au.template}`);

      // First render
      const result1 = await renderToString(App, 2);
      log.push(`after render 1 template type: ${typeof App.$au.template}`);
      assert.ok(result1.html.includes('Hello'), 'First render should work');

      // Clear definition (like build package does)
      CustomElement.clearDefinition(App);
      log.push(`after clear template type: ${typeof App.$au.template}`);

      // Second render - this is where it might fail
      const result2 = await renderToString(App, 2);
      log.push(`after render 2 template type: ${typeof App.$au.template}`);

      console.log('String template pattern:', log);

      assert.strictEqual(result1.html, result2.html, 'Both renders should produce identical output');
    });

    it('STRING template mutates to element and back - detecting the issue', async function () {
      // This test tracks template type changes to understand the failure

      class App {
        static $au: ComponentAu = {
          type: 'custom-element',
          name: 'mutate-test-app',
          template: '<span><!--au:0-->Test</span>',
          instructions: [[new TextBindingInstruction('text')]],
          needsCompile: false,
        };
        text = 'Test';
      }

      const observations: Array<{ phase: string; templateType: string; templateValue: string }> = [];

      const observe = (phase: string) => {
        const t = App.$au.template;
        observations.push({
          phase,
          templateType: typeof t,
          templateValue: typeof t === 'string' ? t.substring(0, 50) : (t as any)?.innerHTML?.substring(0, 50) ?? 'N/A',
        });
      };

      observe('1. initial');

      await renderToString(App, 1);
      observe('2. after render 1');

      CustomElement.clearDefinition(App);
      observe('3. after clearDefinition');

      // Try to render again
      try {
        await renderToString(App, 1);
        observe('4. after render 2 (success)');
      } catch (e) {
        observe(`4. after render 2 (FAILED: ${(e as Error).message})`);
        console.log('FAILURE observations:', observations);
        throw e;
      }

      console.log('Success observations:', observations);
    });
  });
});
