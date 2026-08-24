export function completeApplicationStart(au, onResolve, tasksSettled) {
  // Begin observing queued work in the lifecycle completion callback. This keeps synchronous and
  // asynchronous starts on the same observable boundary without leaving a turn between them.
  return onResolve(au.start(), () => onResolve(tasksSettled(), () => au));
}
