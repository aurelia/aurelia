export const addListener = (target: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void => {
  target.addEventListener(event, handler);
};

export const removeListener = (target: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void => {
  target.removeEventListener(event, handler);
};
