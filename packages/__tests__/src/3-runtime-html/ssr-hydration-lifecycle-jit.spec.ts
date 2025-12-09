/**
 * SSR Hydration - Lifecycle Tests (JIT)
 *
 * Tests that lifecycle hooks fire correctly during SSR→hydrate flow.
 */

import { assert } from '@aurelia/testing';
import { testLifecycle } from './ssr-hydration-jit.helpers.js';

describe('3-runtime-html/ssr-hydration-lifecycle-jit.spec.ts', function () {

  describe('Root component lifecycle', function () {
    it('calls all activation hooks', async function () {
      const { tracker, stop } = await testLifecycle('<div>${msg}</div>', { msg: 'Hi' });
      assert.strictEqual(tracker.has('root', 'binding'), true, 'should have binding');
      assert.strictEqual(tracker.has('root', 'bound'), true, 'should have bound');
      assert.strictEqual(tracker.has('root', 'attaching'), true, 'should have attaching');
      assert.strictEqual(tracker.has('root', 'attached'), true, 'should have attached');
      await stop();
    });

    it('calls hooks in correct order', async function () {
      const { tracker, stop } = await testLifecycle('<div>X</div>');
      const { calls } = tracker;
      assert.strictEqual(calls.indexOf('root:binding') < calls.indexOf('root:bound'), true, 'binding before bound');
      assert.strictEqual(calls.indexOf('root:bound') < calls.indexOf('root:attaching'), true, 'bound before attaching');
      assert.strictEqual(calls.indexOf('root:attaching') < calls.indexOf('root:attached'), true, 'attaching before attached');
      await stop();
    });
  });

  describe('Teardown lifecycle', function () {
    it('calls detaching/unbinding on stop', async function () {
      const { tracker, stop } = await testLifecycle('<div>X</div>');
      tracker.clear();
      await stop();
      assert.strictEqual(tracker.has('root', 'detaching'), true, 'should have detaching');
      assert.strictEqual(tracker.has('root', 'unbinding'), true, 'should have unbinding');
    });
  });
});
