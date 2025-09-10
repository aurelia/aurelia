import { IPerformanceTracker } from './performance-tracker';

/**
 * Activity source for custom tracing
 * Inspired by .NET Core's ActivitySource
 */
export interface IActivitySource {
  /**
   * Starts a new activity with the given name
   */
  startActivity(name: string, attributes?: Record<string, string | number | boolean>): IActivity | null;

  /**
   * The name of this activity source
   */
  readonly name: string;

  /**
   * The version of this activity source
   */
  readonly version: string;
}

/**
 * Activity interface for tracing operations
 */
export interface IActivity {
  /**
   * The name of this activity
   */
  readonly name: string;

  /**
   * Sets a tag/attribute on this activity
   */
  setTag(key: string, value: string | number | boolean): IActivity;

  /**
   * Sets multiple tags/attributes on this activity
   */
  setTags(attributes: Record<string, string | number | boolean>): IActivity;

  /**
   * Adds an event to this activity
   */
  addEvent(name: string, attributes?: Record<string, string | number | boolean>): IActivity;

  /**
   * Ends this activity (called automatically when disposed)
   */
  end(): void;

  /**
   * Disposes this activity (ends it)
   */
  dispose(): void;

  /**
   * Returns true if this activity is recording
   */
  readonly isRecording: boolean;
}

/**
 * Activity source implementation
 */
export class ActivitySource implements IActivitySource {
  public constructor(
    public readonly name: string,
    public readonly version: string = '1.0.0',
    private readonly tracker: IPerformanceTracker
  ) {}

  public startActivity(
    name: string,
    attributes?: Record<string, string | number | boolean>
  ): IActivity | null {
    if (!this.tracker.isEnabled()) {
      return null;
    }

    return new Activity(name, this.name, attributes, this.tracker);
  }
}

/**
 * Activity implementation
 */
class Activity implements IActivity {
  private readonly measurementId: string;
  private readonly tags = new Map<string, string | number | boolean>();
  private readonly events: { name: string; timestamp: number; attributes?: Record<string, string | number | boolean> }[] = [];
  private ended = false;

  public constructor(
    public readonly name: string,
    private readonly sourceName: string,
    initialAttributes?: Record<string, string | number | boolean>,
    private readonly tracker?: IPerformanceTracker
  ) {
    // Set initial attributes
    if (initialAttributes) {
      Object.entries(initialAttributes).forEach(([key, value]) => {
        this.tags.set(key, value);
      });
    }

    // Start the measurement
    this.measurementId = this.tracker?.startMeasurement(
      `${this.sourceName}.${this.name}`,
      {
        activitySource: this.sourceName,
        activityName: this.name,
        type: 'activity',
        ...this.getTagsAsRecord()
      }
    ) ?? '';
  }

  public get isRecording(): boolean {
    return !this.ended && !!this.tracker?.isEnabled();
  }

  public setTag(key: string, value: string | number | boolean): IActivity {
    if (this.isRecording) {
      this.tags.set(key, value);
    }
    return this;
  }

  public setTags(attributes: Record<string, string | number | boolean>): IActivity {
    if (this.isRecording) {
      Object.entries(attributes).forEach(([key, value]) => {
        this.tags.set(key, value);
      });
    }
    return this;
  }

  public addEvent(
    name: string,
    attributes?: Record<string, string | number | boolean>
  ): IActivity {
    if (this.isRecording) {
      this.events.push({
        name,
        timestamp: performance.now(),
        attributes
      });

      // Create an instant measurement for the event
      this.tracker?.addInstantMeasurement(`${this.sourceName}.${this.name}.${name}`, {
        activitySource: this.sourceName,
        activityName: this.name,
        eventName: name,
        type: 'activity-event',
        ...attributes
      });
    }
    return this;
  }

  public end(): void {
    if (!this.ended && this.measurementId) {
      const measurement = this.tracker?.endMeasurement(this.measurementId);

      // Add final metadata about the activity
      if (measurement && this.tracker) {
        this.tracker.addInstantMeasurement(`${this.sourceName}.${this.name}.completed`, {
          activitySource: this.sourceName,
          activityName: this.name,
          duration: measurement.duration,
          eventCount: this.events.length,
          tagCount: this.tags.size,
          type: 'activity-summary',
          ...this.getTagsAsRecord()
        });
      }

      this.ended = true;
    }
  }

  public dispose(): void {
    this.end();
  }

  private getTagsAsRecord(): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    this.tags.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
}

/**
 * Helper function to create a disposable activity that automatically ends when the scope exits
 */
export const withActivity = async <T>(
  activitySource: IActivitySource,
  name: string,
  operation: (activity: IActivity | null) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> => {
  const activity = activitySource.startActivity(name, attributes);

  try {
    const result = await operation(activity);
    activity?.setTag('success', true);
    return result;
  } catch (error) {
    activity?.setTag('success', false);
    activity?.setTag('error', String(error));
    activity?.addEvent('error', {
      message: error instanceof Error ? error.message : String(error),
      ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
    });
    throw error;
  } finally {
    activity?.dispose();
  }
};
