import { DI } from '@aurelia/kernel';

export interface ICallerContext {
  [key: string]: unknown;

  /**
   * The binding target (DOM element, custom attribute, etc.)
   * This is one of the primary context properties.
   */
  target: unknown;

  /**
   * The binding instance itself, acting as the bridge
   */
  binding: unknown;

  /**
   * The associated component/view-model (if any) - the "source"
   */
  component?: unknown;
}

export const ICallerContextResolver = /*@__PURE__*/DI.createInterface<ICallerContextResolver>('ICallerContextResolver', x => x.singleton(CallerContextResolver));

export interface ICallerContextResolver {
  /**
   * Get the current caller context for a value converter
   */
  resolve(): ICallerContext | null;

  /**
   * Set the current caller context (internal use only)
   */
  set(context: ICallerContext | null): void;

  /**
   * Create a lazy context for a converter execution
   * @param contextFactory - Function that creates the context when needed
   * @param callback - The callback to execute with the lazy context
   */
  createLazyContext<T>(contextFactory: () => ICallerContext, callback: () => T): T;
}

/**
 * Service that provides access to the current value converter caller context
 */
export class CallerContextResolver implements ICallerContextResolver {
  private currentContext: ICallerContext | null = null;
  private contextFactory: (() => ICallerContext) | null = null;

  public resolve(): ICallerContext | null {
    // If we have a context factory but no current context, create it on demand
    if (this.contextFactory !== null && this.currentContext === null) {
      this.currentContext = this.contextFactory();
    }
    return this.currentContext;
  }

  public set(context: ICallerContext | null): void {
    this.currentContext = context;
    this.contextFactory = null;
  }

  public createLazyContext<T>(contextFactory: () => ICallerContext, callback: () => T): T {
    const previousContext = this.currentContext;
    const previousFactory = this.contextFactory;

    // Set up the lazy context factory but don't create the context yet
    this.currentContext = null;
    this.contextFactory = contextFactory;

    try {
      return callback();
    } finally {
      this.currentContext = previousContext;
      this.contextFactory = previousFactory;
    }
  }
}
