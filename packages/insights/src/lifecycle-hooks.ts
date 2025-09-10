import { lifecycleHooks, IController } from '@aurelia/runtime-html';
import { IPerformanceTracker } from './performance-tracker';
import { resolve } from '@aurelia/kernel';

/**
 * Lifecycle hooks for performance measurement
 * This class hooks into Aurelia's lifecycle methods to measure their performance
 */
@lifecycleHooks()
export class PerformanceLifecycleHooks {
  private readonly performanceTracker: IPerformanceTracker = resolve(IPerformanceTracker);

  // Store active measurements for each phase
  private readonly activeHydratingMeasurements = new WeakMap<object, string>();
  private readonly activeHydratedMeasurements = new WeakMap<object, string>();
  private readonly activeCreatedMeasurements = new WeakMap<object, string>();
  private readonly activeBindingMeasurements = new WeakMap<object, string>();
  private readonly activeAttachingMeasurements = new WeakMap<object, string>();
  private readonly activeDetachingMeasurements = new WeakMap<object, string>();

  // Store comprehensive measurements
  private readonly activeInitializationMeasurements = new WeakMap<object, string>();
  private readonly activeCleanupMeasurements = new WeakMap<object, string>();

  public hydrating(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      const componentName = this.getComponentName(vm, initiator);

      // Start phase measurement: Hydrating → Hydrated
      const hydratingMeasurementName = `${componentName} • Hydrating → Hydrated`;
      const hydratingMetadata = {
        componentName,
        phase: 'hydrating-to-hydrated',
        controllerId: this.getControllerId(initiator),
        vmType: this.getVmType(vm),
        async: false
      };
      const hydratingMeasurementId = this.performanceTracker.startMeasurement(hydratingMeasurementName, hydratingMetadata);

      // Start comprehensive measurement: Hydrating → Attached
      const initMeasurementName = `${componentName} • Complete Initialization (Hydrating → Attached)`;
      const initMetadata = {
        componentName,
        phase: 'complete-initialization',
        controllerId: this.getControllerId(initiator),
        vmType: this.getVmType(vm),
        async: false
      };
      const initMeasurementId = this.performanceTracker.startMeasurement(initMeasurementName, initMetadata);

      if (vm != null && typeof vm === 'object') {
        this.activeHydratingMeasurements.set(vm, hydratingMeasurementId);
        this.activeInitializationMeasurements.set(vm, initMeasurementId);
      }
    }
  }

  public hydrated(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        // End hydrating measurement
        const hydratingMeasurementId = this.activeHydratingMeasurements.get(vm);
        if (hydratingMeasurementId != null) {
          this.performanceTracker.endMeasurement(hydratingMeasurementId);
          this.activeHydratingMeasurements.delete(vm);
        }

        // Start next phase measurement: Hydrated → Created
        const componentName = this.getComponentName(vm, initiator);
        const hydratedMeasurementName = `${componentName} • Hydrated → Created`;
        const hydratedMetadata = {
          componentName,
          phase: 'hydrated-to-created',
          controllerId: this.getControllerId(initiator),
          vmType: this.getVmType(vm),
          async: false
        };
        const hydratedMeasurementId = this.performanceTracker.startMeasurement(hydratedMeasurementName, hydratedMetadata);
        this.activeHydratedMeasurements.set(vm, hydratedMeasurementId);
      }
    }
  }

  public created(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        // End hydrated measurement
        const hydratedMeasurementId = this.activeHydratedMeasurements.get(vm);
        if (hydratedMeasurementId != null) {
          this.performanceTracker.endMeasurement(hydratedMeasurementId);
          this.activeHydratedMeasurements.delete(vm);
        }

        // Start next phase measurement: Created → Binding
        const componentName = this.getComponentName(vm, initiator);
        const createdMeasurementName = `${componentName} • Created → Binding`;
        const createdMetadata = {
          componentName,
          phase: 'created-to-binding',
          controllerId: this.getControllerId(initiator),
          vmType: this.getVmType(vm),
          async: false
        };
        const createdMeasurementId = this.performanceTracker.startMeasurement(createdMeasurementName, createdMetadata);
        this.activeCreatedMeasurements.set(vm, createdMeasurementId);
      }
    }
  }

  public binding(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        // End created measurement
        const createdMeasurementId = this.activeCreatedMeasurements.get(vm);
        if (createdMeasurementId != null) {
          this.performanceTracker.endMeasurement(createdMeasurementId);
          this.activeCreatedMeasurements.delete(vm);
        }

        // Start binding measurement: Binding → Bound
        const componentName = this.getComponentName(vm, initiator);
        const bindingMeasurementName = `${componentName} • Binding → Bound`;
        const bindingMetadata = {
          componentName,
          phase: 'binding-to-bound',
          controllerId: this.getControllerId(initiator),
          vmType: this.getVmType(vm),
          async: false
        };
        const bindingMeasurementId = this.performanceTracker.startMeasurement(bindingMeasurementName, bindingMetadata);
        this.activeBindingMeasurements.set(vm, bindingMeasurementId);
      }
    }
  }

  public bound(vm: unknown, _initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        const measurementId = this.activeBindingMeasurements.get(vm);
        if (measurementId != null) {
          this.performanceTracker.endMeasurement(measurementId);
          this.activeBindingMeasurements.delete(vm);
        }
      }
    }
  }

  public attaching(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      const componentName = this.getComponentName(vm, initiator);
      const measurementName = `${componentName} • Attaching → Attached`;

      const metadata = {
        componentName,
        phase: 'attaching-to-attached',
        controllerId: this.getControllerId(initiator),
        vmType: this.getVmType(vm),
        async: false
      };

      const measurementId = this.performanceTracker.startMeasurement(measurementName, metadata);
      if (vm != null && typeof vm === 'object') {
        this.activeAttachingMeasurements.set(vm, measurementId);
      }
    }
  }

  public attached(vm: unknown, _initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        // End attaching measurement
        const attachingMeasurementId = this.activeAttachingMeasurements.get(vm);
        if (attachingMeasurementId != null) {
          this.performanceTracker.endMeasurement(attachingMeasurementId);
          this.activeAttachingMeasurements.delete(vm);
        }

        // End comprehensive initialization measurement
        const initMeasurementId = this.activeInitializationMeasurements.get(vm);
        if (initMeasurementId != null) {
          this.performanceTracker.endMeasurement(initMeasurementId);
          this.activeInitializationMeasurements.delete(vm);
        }
      }
    }
  }

  public detaching(vm: unknown, initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      const componentName = this.getComponentName(vm, initiator);

      // Start phase measurement: Detaching → Unbinding
      const detachingMeasurementName = `${componentName} • Detaching → Unbinding`;
      const detachingMetadata = {
        componentName,
        phase: 'detaching-to-unbinding',
        controllerId: this.getControllerId(initiator),
        vmType: this.getVmType(vm),
        async: false
      };
      const detachingMeasurementId = this.performanceTracker.startMeasurement(detachingMeasurementName, detachingMetadata);

      // Start comprehensive cleanup measurement: Detaching → Cleanup Complete
      const cleanupMeasurementName = `${componentName} • Complete Cleanup (Detaching → Unbinding)`;
      const cleanupMetadata = {
        componentName,
        phase: 'complete-cleanup',
        controllerId: this.getControllerId(initiator),
        vmType: this.getVmType(vm),
        async: false
      };
      const cleanupMeasurementId = this.performanceTracker.startMeasurement(cleanupMeasurementName, cleanupMetadata);

      if (vm != null && typeof vm === 'object') {
        this.activeDetachingMeasurements.set(vm, detachingMeasurementId);
        this.activeCleanupMeasurements.set(vm, cleanupMeasurementId);
      }
    }
  }

  public unbinding(vm: unknown, _initiator: IController): void {
    if (this.performanceTracker.isEnabled()) {
      if (vm != null && typeof vm === 'object') {
        // End detaching measurement
        const detachingMeasurementId = this.activeDetachingMeasurements.get(vm);
        if (detachingMeasurementId != null) {
          this.performanceTracker.endMeasurement(detachingMeasurementId);
          this.activeDetachingMeasurements.delete(vm);
        }

        // End comprehensive cleanup measurement
        const cleanupMeasurementId = this.activeCleanupMeasurements.get(vm);
        if (cleanupMeasurementId != null) {
          this.performanceTracker.endMeasurement(cleanupMeasurementId);
          this.activeCleanupMeasurements.delete(vm);
        }
      }
    }
  }

  private getComponentName(vm: unknown, initiator: IController): string {
    // Priority 1: Get name from the actual view model constructor (most accurate)
    if (vm != null) {
      const constructorName = vm.constructor?.name;
      if (constructorName && constructorName !== 'Object') {
        return constructorName;
      }
    }

    // Priority 2: Try to get component name from initiator definition as fallback
    if (initiator.definition && 'name' in initiator.definition) {
      return initiator.definition.name;
    }

    return 'UnknownComponent';
  }

  private getControllerId(controller: IController): string {
    // Generate a semi-unique identifier for the controller
    return `ctrl_${Object.prototype.toString.call(controller).slice(8, -1)}_${Date.now()}`;
  }

  private getVmType(vm: unknown): string {
    if (vm === null) return 'null';
    if (vm === undefined) return 'undefined';

    const type = typeof vm;
    if (type === 'object') {
      return vm.constructor?.name || 'Object';
    }

    return type;
  }
}
