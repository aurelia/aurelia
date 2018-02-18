export const PLATFORM = {
  global: window,
  location: window.location,
  history: window.history,
  addEventListener(eventName: string, callback: Function, capture: boolean): void {
    this.global.addEventListener(eventName, callback, capture);
  },
  removeEventListener(eventName: string, callback: Function, capture: boolean): void {
    this.global.removeEventListener(eventName, callback, capture);
  },
  performance: window.performance,
  requestAnimationFrame(callback: Function): number {
    return this.global.requestAnimationFrame(callback);
  }
};
