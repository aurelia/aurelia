import { AppTask, IEventTarget } from '@aurelia/runtime-html';

export const PreventFormActionlessSubmit = AppTask.creating(IEventTarget, appRoot => {
  appRoot.addEventListener('submit', (e: Event) => {
    const target = e.target as HTMLFormElement;
    const action = target.action;

    if (target.tagName.toLowerCase() === 'form' && !action) {
      e.preventDefault();
    }
  }, false);
});
