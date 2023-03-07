import { AppTask, IEventTarget } from '@aurelia/runtime-html';

/**
 * A registration that will enable the default form submission behavior of form without a valid action.
 *
 * The default behavior of <form> without action attribute is normally not desirable for SPA applications.
 */
export const PreventFormActionlessSubmit = AppTask.creating(IEventTarget, appRoot => {
  appRoot.addEventListener('submit', (e: Event) => {
    const target = e.target as HTMLFormElement;
    const action = target.action;

    if (target.tagName.toLowerCase() === 'form' && !action) {
      e.preventDefault();
    }
  }, false);
});
