import { resolve } from '@aurelia/kernel';
import {
  queueTask,
  type Collection,
  type IndexMap,
} from '@aurelia/runtime';
import {
  Repeat,
  type IHydratedController,
  type IHydratedParentController,
  CustomAttributeStaticAuDefinition,
  IPlatform,
} from '@aurelia/runtime-html';
import { IPerformanceTracker } from './performance-tracker';
import { IInsightsConfiguration } from './configuration';

/**
 * Performance-tracking version of the Repeat template controller
 * Extends the original Repeat to add performance measurements without affecting functionality
 */
export class PerformanceRepeat<C extends Collection = unknown[]> extends Repeat<C> {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'repeat',
    isTemplateController: true,
    bindables: ['items'],
  };

  private readonly performanceTracker = resolve(IPerformanceTracker);
  private readonly config = resolve(IInsightsConfiguration);
  private readonly platform = resolve(IPlatform);

  // Active performance measurements
  private readonly activeMeasurements = new Map<string, string>();

  // Track comprehensive rendering measurements
  private comprehensiveRenderMeasurementId: string = '';

  // Configuration-based thresholds
  private get detailedTrackingThreshold(): number {
    return this.config.repeatPerformance?.detailedTrackingThreshold ?? 100;
  }

  private get batchOperationThreshold(): number {
    return this.config.repeatPerformance?.batchOperationThreshold ?? 10;
  }

  private get isRepeatTrackingEnabled(): boolean {
    return this.config.repeatPerformance?.enabled !== false && this.performanceTracker.isEnabled();
  }

  public binding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
  ): void | Promise<void> {
    const measurementId = this.startMeasurement('repeat-binding', {
      phase: 'binding',
      repeatId: this.getRepeatId(),
    });

    const result = super.binding(initiator, parent);

    // Handle both sync and async results
    if (result && typeof result.then === 'function') {
      return result.then(
        (value) => {
          this.endMeasurement(measurementId);
          return value;
        },
        (error) => {
          this.endMeasurement(measurementId, { error: (error as Error).message });
          throw error;
        }
      );
    } else {
      this.endMeasurement(measurementId);
      return result;
    }
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
  ): void | Promise<void> {
    const itemCount = this.getActualItemCount();

    // Start comprehensive measurement for complete rendering cycle
    this.comprehensiveRenderMeasurementId = this.startMeasurement('repeat-complete-render', {
      phase: 'complete-render',
      itemCount,
      repeatId: this.getRepeatId(),
      description: 'Complete rendering from view creation to DOM paint',
      isLargeCollection: itemCount > this.detailedTrackingThreshold,
    });

    // Also measure just the attaching phase
    const attachingMeasurementId = this.startMeasurement('repeat-attaching', {
      phase: 'attaching',
      itemCount,
      repeatId: this.getRepeatId(),
      viewsCreated: itemCount,
      isLargeCollection: itemCount > this.detailedTrackingThreshold,
    });

    const result = super.attaching(initiator, parent);

    if (result && typeof result.then === 'function') {
      return result.then(
        (value) => {
          this.endMeasurement(attachingMeasurementId, {
            completed: true,
            finalItemCount: this.getItemCount(),
          });
          // Complete rendering will be finished in attached()
          return value;
        },
        (error: Error) => {
          this.endMeasurement(attachingMeasurementId, {
            error: error.message,
            finalItemCount: this.getItemCount(),
          });
          this.endComprehensiveRenderMeasurement({ error: error.message });
          throw error;
        }
      );
    } else {
      this.endMeasurement(attachingMeasurementId, {
        completed: true,
        finalItemCount: this.getItemCount(),
      });
      // Complete rendering will be finished in attached()
      return result;
    }
  }

  public attached(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    // End the comprehensive measurement after views are attached and DOM is ready
    // Use platform.domQueue to ensure browser has had chance to paint
    if (this.comprehensiveRenderMeasurementId) {
      queueTask(() => {
        this.endComprehensiveRenderMeasurement({
          totalViews: this.getItemCount(),
          renderingComplete: true,
        });
      });
    }
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
  ): void | Promise<void> {
    const itemCount = this.getItemCount();
    const measurementId = this.startMeasurement('repeat-detaching', {
      phase: 'detaching',
      itemCount,
      repeatId: this.getRepeatId(),
      viewsToDestroy: itemCount,
      isLargeCollection: itemCount > this.detailedTrackingThreshold,
    });

    const result = super.detaching(initiator, parent);

    if (result && typeof result.then === 'function') {
      return result.then(
        (value) => {
          this.endMeasurement(measurementId, { completed: true });
          return value;
        },
        (error: Error) => {
          this.endMeasurement(measurementId, { error: error.message });
          throw error;
        }
      );
    } else {
      this.endMeasurement(measurementId, { completed: true });
      return result;
    }
  }

  public unbinding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
  ): void | Promise<void> {
    const measurementId = this.startMeasurement('repeat-unbinding', {
      phase: 'unbinding',
      repeatId: this.getRepeatId(),
    });

    const result = super.unbinding(initiator, parent);

    if (result && typeof result.then === 'function') {
      return result.then(
        (value) => {
          this.endMeasurement(measurementId);
          return value;
        },
        (error: Error) => {
          this.endMeasurement(measurementId, { error: error.message });
          throw error;
        }
      );
    } else {
      this.endMeasurement(measurementId);
      return result;
    }
  }

  public itemsChanged(): void {
    const oldItemCount = this.getItemCount();

    // Start comprehensive measurement for items changed
    const comprehensiveMeasurementId = this.startMeasurement('repeat-items-update', {
      phase: 'items-update',
      oldItemCount,
      repeatId: this.getRepeatId(),
      changeType: 'full-refresh',
      description: 'Complete update cycle including DOM updates',
    });

    const measurementId = this.startMeasurement('repeat-items-changed', {
      phase: 'items-changed',
      oldItemCount,
      repeatId: this.getRepeatId(),
      changeType: 'full-refresh',
    });

    super.itemsChanged();

    const newItemCount = this.getActualItemCount();
    this.endMeasurement(measurementId, {
      newItemCount,
      itemDelta: newItemCount - oldItemCount,
      isSignificantChange: Math.abs(newItemCount - oldItemCount) > this.batchOperationThreshold,
    });

    // End comprehensive measurement after DOM updates
    queueTask(() => {
      this.endMeasurement(comprehensiveMeasurementId, {
        newItemCount,
        itemDelta: newItemCount - oldItemCount,
        updateComplete: true,
      });
    });
  }

  public handleCollectionChange(collection: Collection, indexMap: IndexMap | undefined): void {
    const itemCount = this.getActualItemCount();
    const changeInfo = this.analyzeCollectionChange(indexMap);

    // Start comprehensive measurement for collection changes
    const comprehensiveMeasurementId = this.startMeasurement('repeat-collection-update', {
      phase: 'collection-update',
      itemCount,
      repeatId: this.getRepeatId(),
      changeType: changeInfo.type,
      itemsAdded: changeInfo.added,
      itemsRemoved: changeInfo.removed,
      itemsMoved: changeInfo.moved,
      isLargeChange: changeInfo.isLarge,
      description: 'Complete collection change including DOM updates',
    });

    const measurementId = this.startMeasurement('repeat-collection-change', {
      phase: 'collection-change',
      itemCount,
      repeatId: this.getRepeatId(),
      changeType: changeInfo.type,
      itemsAdded: changeInfo.added,
      itemsRemoved: changeInfo.removed,
      itemsMoved: changeInfo.moved,
      isLargeChange: changeInfo.isLarge,
    });

    super.handleCollectionChange(collection, indexMap);

    this.endMeasurement(measurementId, {
      finalItemCount: this.getActualItemCount(),
      operationCompleted: true,
    });

    // End comprehensive measurement after DOM updates
    queueTask(() => {
      this.endMeasurement(comprehensiveMeasurementId, {
        finalItemCount: this.getActualItemCount(),
        updateComplete: true,
      });
    });
  }

  private endComprehensiveRenderMeasurement(additionalMetadata?: Record<string, unknown>): void {
    if (this.comprehensiveRenderMeasurementId) {
      this.endMeasurement(this.comprehensiveRenderMeasurementId, additionalMetadata);
      this.comprehensiveRenderMeasurementId = '';
    }
  }

  private startMeasurement(name: string, metadata: Record<string, unknown>): string {
    if (!this.isRepeatTrackingEnabled) {
      return '';
    }

    // Create a descriptive name that won't spam the performance tab
    const displayName = this.createDisplayName(name, metadata);
    return this.performanceTracker.startMeasurement(displayName, metadata);
  }

  private endMeasurement(measurementId: string, additionalMetadata?: Record<string, unknown>): void {
    if (measurementId) {
      this.performanceTracker.endMeasurement(measurementId);
      if (additionalMetadata) {
        // Store additional metadata for analysis
        // This would be useful for the insights dashboard
      }
    }
  }

  private createDisplayName(baseName: string, metadata: Record<string, unknown>): string {
    const itemCount = metadata.itemCount as number;
    const repeatId = metadata.repeatId as string;

    // Special formatting for comprehensive measurements
    if (baseName.includes('complete-render')) {
      return `Repeat • Complete Render (${itemCount} items) • ${repeatId}`;
    } else if (baseName.includes('items-update')) {
      return `Repeat • Items Update (${itemCount} items) • ${repeatId}`;
    } else if (baseName.includes('collection-update')) {
      const changeType = metadata.changeType as string;
      return `Repeat • Collection Update (${changeType}) • ${repeatId}`;
    }

    if (itemCount !== undefined) {
      // if (itemCount > this.detailedTrackingThreshold) {
      // } else {
      // }
      return `Repeat • ${this.formatPhaseName(baseName)} (${itemCount} items) • ${repeatId}`;
    } else {
      return `Repeat • ${this.formatPhaseName(baseName)} • ${repeatId}`;
    }
  }

  private formatPhaseName(baseName: string): string {
    return baseName
      .replace('repeat-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getItemCount(): number {
    return this.views?.length ?? 0;
  }

  private getActualItemCount(): number {
    // Try to get count from views first (most reliable if they exist)
    if (this.views !== undefined && this.views.length > 0) {
      return this.views.length;
    }

    // Get count from the items property directly
    if (this.items !== undefined && this.items !== null) {
      if (Array.isArray(this.items)) {
        return this.items.length;
      }
      // Handle Set and Map
      if (typeof (this.items as unknown as { size?: number }).size === 'number') {
        return (this.items as unknown as { size: number }).size;
      }
      // Handle array-like objects with length
      if (typeof (this.items as unknown as { length?: number }).length === 'number') {
        return (this.items as unknown as { length: number }).length;
      }
      // Handle numbers (repeat.for="i of 1000")
      if (typeof this.items === 'number') {
        return this.items;
      }
    }

    return 0;
  }

  private getRepeatId(): string {
    // Create a short identifier for this repeat instance
    const controllerId = this.$controller?.definition?.name ?? 'repeat';
    const timestamp = Date.now().toString(36).slice(-4);
    return `${controllerId}_${timestamp}`;
  }

  private analyzeCollectionChange(indexMap: IndexMap | undefined): {
    type: string;
    added: number;
    removed: number;
    moved: number;
    isLarge: boolean;
  } {
    if (!indexMap) {
      return {
        type: 'full-refresh',
        added: 0,
        removed: 0,
        moved: 0,
        isLarge: false,
      };
    }

    const added = indexMap.filter(index => index === -2).length;
    const removed = indexMap.deletedIndices?.length ?? 0;
    const moved = indexMap.length - added;
    const totalChanges = added + removed + moved;

    return {
      type: this.determineChangeType(added, removed, moved),
      added,
      removed,
      moved,
      isLarge: totalChanges > this.batchOperationThreshold,
    };
  }

  private determineChangeType(added: number, removed: number, moved: number): string {
    if (added > 0 && removed === 0 && moved === 0) {
      return 'add';
    } else if (added === 0 && removed > 0 && moved === 0) {
      return 'remove';
    } else if (added === 0 && removed === 0 && moved > 0) {
      return 'reorder';
    } else if (added > 0 && removed > 0) {
      return 'replace';
    } else {
      return 'mixed';
    }
  }
}
