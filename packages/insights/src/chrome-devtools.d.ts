/**
 * Chrome DevTools extended console methods and Performance API extensibility
 * These extend the standard Console and Performance interfaces with Chromium-specific functionality
 */

import type { DevToolsColor } from './interfaces';

/**
 * DevTools extensibility API types
 */
export type DevToolsColor =
  "primary" | "primary-light" | "primary-dark" |
  "secondary" | "secondary-light" | "secondary-dark" |
  "tertiary" | "tertiary-light" | "tertiary-dark" |
  "error";

export interface ExtensionTrackEntryPayload {
  dataType?: "track-entry"; // Defaults to "track-entry"
  color?: DevToolsColor;    // Defaults to "primary"
  track: string;            // Required: Name of the custom track
  trackGroup?: string;      // Optional: Group for organizing tracks
  properties?: [string, string][]; // Key-value pairs for detailed view
  tooltipText?: string;     // Short description for tooltip
}

export interface ExtensionMarkerPayload {
  dataType: "marker";       // Required: Identifies as a marker
  color?: DevToolsColor;    // Defaults to "primary"
  properties?: [string, string][]; // Key-value pairs for detailed view
  tooltipText?: string;     // Short description for tooltip
}

declare global {
  interface Console {
    /**
     * Chrome DevTools extended timeStamp method
     * @param label - The label for the timestamp
     * @param start - Optional start time or marker
     * @param end - Optional end time or marker
     * @param trackName - Optional track name for grouping
     * @param trackGroup - Optional track group for organization
     * @param color - Optional color for the DevTools display
     */
    timeStamp(
      label: string,
      start?: string | number,
      end?: string | number,
      trackName?: string,
      trackGroup?: string,
      color?: DevToolsColor
    ): void;
  }

  interface Performance {
    /**
     * Creates a performance mark with optional DevTools extensibility data
     */
    mark(markName: string, markOptions?: {
      startTime?: number;
      detail?: {
        [key: string]: any;
        devtools?: ExtensionMarkerPayload;
      };
    }): PerformanceMark;

    /**
     * Creates a performance measure with optional DevTools extensibility data
     */
    measure(measureName: string, measureOptions?: {
      start?: string | number;
      end?: string | number;
      detail?: {
        [key: string]: any;
        devtools?: ExtensionTrackEntryPayload;
      };
    }): PerformanceMeasure;
  }
}

export {};
