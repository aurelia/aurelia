import { IContainer, IServiceLocator } from '@aurelia/kernel';
import { ListenerBinding } from '@aurelia/runtime-html';
import { IPerformanceTracker } from '../performance-tracker';
import { IInsightsConfiguration } from '../configuration';

type PatchableType<T> = T & { __au_insights_patched__?: boolean };
type ListenerBindingWithLocator = ListenerBinding & { l: IServiceLocator };

const getTargetDescription = (target: Node): string => {
  if (target.nodeType === Node.ELEMENT_NODE) {
    const element = target as Element;
    return element.tagName.toLowerCase();
  }
  if (target.nodeType === Node.TEXT_NODE) {
    return '#text';
  }
  if (target.nodeType === Node.COMMENT_NODE) {
    return '#comment';
  }
  if (target.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    return '#document-fragment';
  }
  return Object.prototype.toString.call(target);
};

export function applyListenerBindingPatch(container: IContainer): void {
  const config = container.get(IInsightsConfiguration);

  const PatchableListenerBinding = ListenerBinding as PatchableType<typeof ListenerBinding>;

  // Ensure patching occurs only once
  if (config.enabled && !PatchableListenerBinding.__au_insights_patched__) {
    const originalCallSource = ListenerBinding.prototype.callSource;
    ListenerBinding.prototype.callSource = function (this: ListenerBindingWithLocator, event: Event): void {
      const tracker = this.l.get(IPerformanceTracker);
      if (!tracker.isEnabled()) {
        originalCallSource.call(this, event);
        return;
      }
      const measurementId = tracker.startMeasurement(`ListenerBinding.callSource`, {
        eventType: event.type,
        targetEvent: this.targetEvent,
        target: getTargetDescription(this.target),
      });
      try {
        originalCallSource.call(this, event);
      } finally {
        if (measurementId) {
          tracker.endMeasurement(measurementId);
        }
      }
    };

    PatchableListenerBinding.__au_insights_patched__ = true;
  }
}
