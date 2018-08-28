import { getAureliaMeasurements } from './browser';

export async function processMeasurements() {
  const measurements = await getAureliaMeasurements();
  const lifecycles = [];
  const actions = [];
  for (const { name, duration, startTime } of measurements) {
    let parts = name.split('_to_');
    if (parts.length === 2) {
      const lifecycle = parts[0].slice(8); // e.g. aurelia-app-bound, remove "aurelia-"
      lifecycles.push({ lifecycle, startTime, duration });
    } else {
      parts = name.split('-');
      if (parts.length === 5) {
        // e.g. aurelia-action-app-addTodo-10
        const action = parts[3];
        const count = parts[4];
        actions.push({ action, count, startTime, duration });
      }
    }
  }
  for (const { lifecycle, duration } of lifecycles) {
    console.log(`${lifecycle} took ${duration}ms`);
  }
  const firstLifecycle = lifecycles.shift();
  const lastLifecycle = lifecycles.pop();
  console.log(`total app startup took ${((lastLifecycle.startTime - firstLifecycle.startTime) + 0.5) | 0}ms`);
  for (const { action, count, duration } of actions) {
    console.log(`${action} (x${count}) took ${duration}ms`);
  }
}
