export function addListener(el: EventTarget, evt: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
  el.addEventListener(evt, handler, options);
}

export function removeListener(el: EventTarget, evt: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
  el.removeEventListener(evt, handler, options);
}
