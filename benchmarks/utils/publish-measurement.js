export function publishMeasurement(name, startMark, endMark, usedJSHeapSizeBytes) {
  if (usedJSHeapSizeBytes !== undefined) window.usedJSHeapSizeBytes = usedJSHeapSizeBytes;
  // Tachometer polls both metrics independently, so publish the performance entry only after every
  // expression value is available. It can never observe a half-published sample this way.
  performance.measure(name, startMark, endMark);
}
