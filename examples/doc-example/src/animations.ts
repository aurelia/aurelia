export function promiseAnimation(element: Element, animation: any, duration: number) {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  const anim = element.animate(animation, duration);
  anim.onfinish = () => resolve();
  return promise;
}

export function slideIn(element: Element, duration: number, from: 'left' | 'right' = 'right') {
  return promiseAnimation(element, { transform: [`translateX(${from === 'left' ? '-' : ''}100%)`, 'translateX(0)'] }, duration);
}

export function slideOut(element: Element, duration: number, to: 'left' | 'right' = 'left') {
  return promiseAnimation(element, { transform: ['translateX(0)', `translateX(${to === 'left' ? '-' : ''}100%)`] }, duration);
}

