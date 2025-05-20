import { DI } from '@aurelia/kernel';

export interface ICallerContext {
  [key: string]: unknown;

  /** The binding target (DOM element, custom attribute, etc.) */
  target: unknown;

  /** The associated component/view-model (if any) */
  component?: unknown;

  /** The binding instance itself */
  binding?: unknown;

  /** The actual DOM element (useful when target is a custom attribute) */
  element?: Element;

  /** Whether the conversion is being called in toView or fromView mode */
  direction?: 'toView' | 'fromView';

  /** The controller instance */
  controller?: unknown;

  /** The DI container */
  container?: unknown;
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
}

/**
 * Service that provides access to the current value converter caller context
 */
export class CallerContextResolver implements ICallerContextResolver {
  private currentContext: ICallerContext | null = null;

  public resolve(): ICallerContext | null {
    return this.currentContext;
  }

  public set(context: ICallerContext | null): void {
    this.currentContext = context;
  }
}
