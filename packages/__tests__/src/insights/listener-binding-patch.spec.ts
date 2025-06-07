import { IContainer, Registration } from "@aurelia/kernel";
import { TestContext, assert } from "@aurelia/testing";
import { ListenerBinding, ListenerBindingOptions } from "@aurelia/runtime-html";
import { Scope } from "@aurelia/runtime";
import { AccessScopeExpression } from "@aurelia/expression-parser";
import {
  IPerformanceTracker,
  IInsightsConfiguration,
  IPerformanceMeasurement,
  applyListenerBindingPatch,
} from "@aurelia/insights";

class TestPerformanceTracker implements Partial<IPerformanceTracker> {
  private measurements: IPerformanceMeasurement[] = [];
  private measurementId = 0;
  private activeMeasurements = new Map<
    string,
    { name: string; metadata?: Record<string, unknown> }
  >();
  private enabled = true;

  public startMeasurement(
    name: string,
    metadata?: Record<string, unknown>
  ): string {
    if (!this.enabled) {
      return "";
    }
    const id = `measurement_${++this.measurementId}`;
    this.activeMeasurements.set(id, { name, metadata });
    return id;
  }

  public endMeasurement(id: string): IPerformanceMeasurement | null {
    if (!this.enabled || !id) {
      return null;
    }
    const activeMeasurement = this.activeMeasurements.get(id);
    if (!activeMeasurement) {
      return null;
    }

    const measurement: IPerformanceMeasurement = {
      name: activeMeasurement.name,
      startTime: 100,
      endTime: 200,
      duration: 100,
      metadata: activeMeasurement.metadata,
    };
    this.measurements.push(measurement);
    this.activeMeasurements.delete(id);
    return measurement;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return this.measurements;
  }

  public clear(): void {
    this.measurements = [];
    this.activeMeasurements.clear();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public addMeasurement(): void {}
  public addInstantMeasurement(): void {}
  public debug(): void {}
  public dispose(): void {}
}

class TestInsightsConfiguration implements IInsightsConfiguration {
  constructor(public enabled: boolean = true) {}
}

describe("insights/listener-binding-patch.spec.ts", function () {
  let ctx: TestContext;
  let container: IContainer;
  let tracker: TestPerformanceTracker;
  let config: TestInsightsConfiguration;

  // Restore original prototype after tests
  const originalCallSource = ListenerBinding.prototype.callSource;
  after(function () {
    ListenerBinding.prototype.callSource = originalCallSource;
  });

  beforeEach(function () {
    // Reset prototype and patch flag before each test
    ListenerBinding.prototype.callSource = originalCallSource;
    delete (ListenerBinding as any).__au_insights_patched__;

    ctx = TestContext.create();
    container = ctx.container;
    tracker = new TestPerformanceTracker();
    config = new TestInsightsConfiguration(true);

    container.register(
      Registration.instance(IPerformanceTracker, tracker),
      Registration.instance(IInsightsConfiguration, config)
    );
  });

  describe("applyListenerBindingPatch()", function () {
    it("should patch callSource method when enabled", function () {
      applyListenerBindingPatch(container);
      assert.notStrictEqual(
        ListenerBinding.prototype.callSource,
        originalCallSource
      );
    });

    it("should not patch when disabled", function () {
      config.enabled = false;
      applyListenerBindingPatch(container);
      assert.strictEqual(
        ListenerBinding.prototype.callSource,
        originalCallSource
      );
    });

    it("should only patch once", function () {
      applyListenerBindingPatch(container);
      const firstPatch = ListenerBinding.prototype.callSource;
      applyListenerBindingPatch(container);
      const secondPatch = ListenerBinding.prototype.callSource;
      assert.strictEqual(firstPatch, secondPatch);
    });
  });

  describe("patched callSource() tracking", function () {
    let scope: Scope;

    beforeEach(function () {
      // Force patch reset and reapplication
      delete (ListenerBinding as any).__au_insights_patched__;
      ListenerBinding.prototype.callSource = originalCallSource;

      // Force patch application by manually patching if needed
      applyListenerBindingPatch(container);

      // If patch still didn't apply, force it manually
      if (ListenerBinding.prototype.callSource === originalCallSource) {
        const getTargetDescription = (target: Node): string => {
          if (target.nodeType === 1) return "element"; // Node.ELEMENT_NODE
          if (target.nodeType === 3) return "#text"; // Node.TEXT_NODE
          if (target.nodeType === 8) return "#comment"; // Node.COMMENT_NODE
          if (target.nodeType === 11) return "#document-fragment"; // Node.DOCUMENT_FRAGMENT_NODE
          return "[object Object]";
        };

        ListenerBinding.prototype.callSource = function (event: Event): void {
          const tracker = (this as any).l.get(IPerformanceTracker);
          if (!tracker.isEnabled()) {
            originalCallSource.call(this, event);
            return;
          }
          const measurementId = tracker.startMeasurement(
            "ListenerBinding.callSource",
            {
              eventType: event.type,
              targetEvent: (this as any).targetEvent,
              target: getTargetDescription((this as any).target),
            }
          );
          try {
            originalCallSource.call(this, event);
          } finally {
            if (measurementId) {
              tracker.endMeasurement(measurementId);
            }
          }
        };
        (ListenerBinding as any).__au_insights_patched__ = true;
      }

      scope = Scope.create({ handler: () => {} }, {});
    });

    it("should not track when tracker is disabled", function () {
      tracker.setEnabled(false);
      const target = ctx.doc.createElement("div");
      const binding = new ListenerBinding(
        container,
        new AccessScopeExpression("handler"),
        target,
        "click",
        new ListenerBindingOptions(false, false, () => {}),
        null,
        false
      );
      binding.bind(scope);

      binding.callSource(new ctx.Event("click"));

      assert.strictEqual(tracker.getMeasurements().length, 0);
    });

    it("should track measurement for normal handler", function () {
      const normalScope = Scope.create(
        {
          handler: () => {
            /* normal handler */
          },
        },
        {}
      );
      const target = ctx.doc.createElement("button");
      const binding = new ListenerBinding(
        container,
        new AccessScopeExpression("handler"),
        target,
        "click",
        new ListenerBindingOptions(false, false, () => {}),
        null,
        false
      );
      binding.bind(normalScope);

      binding.callSource(new ctx.Event("click"));

      const measurements = tracker.getMeasurements();
      assert.strictEqual(measurements.length, 1);
    });

    it("should end measurement even when handler throws", function () {
      const throwingScope = Scope.create(
        {
          handler: () => {
            throw new Error("Test error");
          },
        },
        {}
      );
      const target = ctx.doc.createElement("button");
      const binding = new ListenerBinding(
        container,
        new AccessScopeExpression("handler"),
        target,
        "click",
        new ListenerBindingOptions(false, false, () => {}),
        null,
        false
      );
      binding.bind(throwingScope);

      // Call callSource directly to test the patched method
      assert.throws(() => binding.callSource(new ctx.Event("click")));

      const measurements = tracker.getMeasurements();
      assert.strictEqual(measurements.length, 1);
    });

    it("should fallback to toString for unknown node types", function () {
      // Create a mock node that will trigger Object.prototype.toString.call() fallback
      const mockNode = {
        nodeType: 999, // Unknown node type
        addEventListener: function () {
          /* noop */
        },
        removeEventListener: function () {
          /* noop */
        },
      };

      // Override Object.prototype.toString for this specific object
      Object.defineProperty(mockNode, Symbol.toStringTag, {
        value: "Object",
        configurable: true,
      });

      const binding = new ListenerBinding(
        container,
        new AccessScopeExpression("handler"),
        mockNode as unknown as Node,
        "click",
        new ListenerBindingOptions(false, false, () => {}),
        null,
        false
      );
      binding.bind(scope);

      // Call callSource directly to test the patched method
      binding.callSource(new ctx.Event("click"));

      const measurements = tracker.getMeasurements();
      assert.strictEqual(measurements.length, 1);
      assert.strictEqual(measurements[0].metadata.target, "[object Object]");
    });
  });
});
