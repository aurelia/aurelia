---
description: The basics of the dialog plugin for Aurelia.
---

## Introduction

This article covers the dialog plugin for Aurelia. This plugin is created for showing dialogs (sometimes referred to as modals) in your application. The plugin supports the use of dynamic content for all aspects and is easily configurable / overridable.

{% hint style="success" %}
**Here's what you'll learn...**

* todo...
* todo...
* todo...
* todo...
{% endhint %}

... Placeholder & link to advanced examples with:

## Installing The Plugin
There's a set of default implementations for the main interfaces of the Dialog plugin, which includes:

- `IDialogService`
- `IDialogGlobalSettings`
- `IDialogDomRenderer`
- `IDialogAnimator`

These default implementation are grouped in the export named `DefaultDialogConfiguration` of the dialog plugin, which can be used per the following:
```ts
import { DefaultDialogConfiguration } from '@aurelia/runtime-html';
import { Aurelia } from 'aurelia';

Aurelia.register(DefaultDialogConfiguration).app(MyApp).start();
```

## Using The Default Implementation
### The Dialog Settings
There are two levels where dialog behavior can be configured:
- Global level via `IDialogGlobalSettings`
- Single dialog level via property `settings` on a dialog controller.

Normally, the global settings would be changed during the app startup/or before, while the single dialog settings would be changed during the contruction of the dialog view model, via the `open` method.

An example of configuring the global dialog settings:

Make all dialogs, by default:
- not dismissable by clicking outside of it, or hitting the ESC key
- have starting CSS `z-index` of 5
- if not locked, closable by hitting the `ESC` key
```typescript
Aurelia.register(DefaultDialogConfiguration.customize(settings => {
  settings.lock = true;
  settings.startingZIndex = 5;
  settings.keyboard = true;
})).app(MyApp).start()
```

An example of configuring a single dialog, via `open` method of the dialog service:

Displaying an alert dialog, which has `z-index` value as 10 to stay on top of all other dialogs, and will be dismissed when the user hits the `ESC` key.
```typescript
dialogService.open({
  component: () => Alert,
  lock: false,
  startingZIndex = 10,
})
```

The settings that are available in the `open` method of the dialog service:

- `component` can be class reference or instance, or a function that resolves to such, or a promise of such.
- `template` can be HTML elements, string or a function that resolves to such, or a promise of such.
- `model` the data to be passed to the `canActivate` and `activate` methods of the view model if implemented.
- `host` allows providing the element which will parent the dialog - if not provided the document body will be used.
- `container` allows specifying the DI Container instance to be used for the dialog. If not provided a new child container will be created from the root one.
- `lock` makes the dialog not dismissable via clicking outside, or using keyboard.
- `keyboard` allows configuring keyboard keys that close the dialog. To disable set to `false`. To cancel close a dialog when the *ESC* key is pressed set to `true`, `'Escape'` or and array containing `'Escape'` - `['Escape']`. To close with confirmation when the *ENTER* key is pressed set to `'Enter'` or an array containing `'Enter'` - `['Enter']`. To combine the *ESC* and *ENTER* keys set to `['Enter', 'Escape']` - the order is irrelevant. (takes precedence over `lock`)
- `overlayDismiss` if set to `true` cancel closes the dialog when clicked outside of it. (takes precedence over `lock`)
- `rejectOnCancel` is a boolean you must set to `true` if you want to handle cancellations as rejection. The reason will be an `IDialogCancelError` - the property `wasCancelled` will be set to `true` and if cancellation data was provided it will be set to the `value` property.

The default global settings has the following values, based on the above list:
- `lock` is true
- `startingZIndex` is `1000`
- `rejectOnCancel` is `false`

{% hint style="warning" %}
If `rejectOnCancel` behavior is desired, it should only be applied to individual dialog via `open` method of the dialog service.
{% endhint %}

### The Dialog Service APIs
The interface that a dialog service should follow:
```typescript
interface IDialogService {
  /**
   * An indicator of how many dialogs are being opened with this service
   */
  readonly count: number;
  readonly hasOpenDialog: boolean;

  /**
   * Opens a new dialog.
   *
   * @param settings - Dialog settings for this dialog instance.
   * @returns Promise A promise that settles when the dialog is closed.
   */
  open(settings?: IDialogSettings): IDialogOpenPromise;

  /**
   * Closes all open dialogs at the time of invocation.
   *
   * @returns Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  closeAll(): Promise<IDialogController[]>;
}
```

The interface that a dialog controller should follow:
```ts
interface IDialogController {
  readonly settings: Readonly<ILoadedDialogSettings>;
  /**
   * A promise that will be fulfilled once this dialog has been closed
   */
  readonly closed: Promise<IDialogCloseResult>;

  ok(value?: unknown): Promise<IDialogCloseResult<DialogDeactivationStatuses.Ok>>;
  cancel(value?: unknown): Promise<IDialogCloseResult<DialogDeactivationStatuses.Cancel>>;
  error(value?: unknown): Promise<void>;
}
```

An important feature of the dialog plugin is that it is possible to resolve and close (using `cancel`/`ok`/`error` methods) a dialog in the same context where you open it.

* If you want to control the opening and closing of a dialog in promise style:
  ```typescript
  import { EditPerson } from './edit-person';
  import { IDialogService, DialogDeactivationStatuses } from '@aurelia/runtime-html';

  export class Welcome {
    static inject = [IDialogService];

    person = { firstName: 'Wade', middleName: 'Owen', lastName: 'Watts' };
    constructor(dialogService) {
      this.dialogService = dialogService;
    }

    submit() {
      this.dialogService
        .open({ component: () => EditPerson, model: this.person })
        .then(openDialogResult => {
          // Note:
          // you get here when the dialog is opened,
          // and you are able to close dialog
          setTimeout(() => {
            openDialogResult.controller.cancel('Failed to finish editing after 3 seconds');
          }, 3000);

          // each dialog controller should expose a promise for attaching callbacks
          // to be executed for when it has been closed
          return openDialogResult.controller.closed;
        })
        .then((response) => {
          if (response.status === DialogDeactivationStatuses.Ok) {
            console.log('good');
          } else {
            console.log('bad');
          }
          console.log(response);
        });
    }
  }
  ```
* If you want to control the opening and closing of a dialog using `async/await`:
  ```typescript
  import { EditPerson } from './edit-person';
  import { IDialogService, DialogDeactivationStatuses } from '@aurelia/runtime-html';

  export class Welcome {
    static inject = [IDialogService];

    person = { firstName: 'Wade', middleName: 'Owen', lastName: 'Watts' };
    constructor(dialogService) {
      this.dialogService = dialogService;
    }

    async submit() {
      const { controller } = await this.dialogService.open({
        component: () => EditPerson,
        model: this.person
      });
      // Note:
      // you get here when the dialog is opened,
      // and you are able to close dialog
      setTimeout(() => {
        openDialogResult.controller.cancel('Failed to finish editing after 3 seconds');
      }, 3000);

      const response = await openDialogResult.closed;
      if (response.status === DialogDeactivationStatuses.Ok) {
        console.log('good');
      } else {
        console.log('bad');
      }
      console.log(response);
    }
  }
  ```

By default, when an application is destroyed, the dialog service of that application will also try to close all the open dialogs that are registered with it via `closeAll` method. It can also be used whenever there's a need to forcefully close all open dialogs, as per following example:

Given an error list, open a dialog for each error, and close all of them after 5 seconds.

```typescript
import { Alert } from './dialog-alert';
import { IDialogService, DialogDeactivationStatuses } from '@aurelia/runtime-html';

export class Welcome {
  static inject = [IDialogService];

  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  notifyErrors(errors) {
    // for each of the error in the given error
    errors.forEach(error => {
      this.dialogService.open({ component: () => Alert, model: error });
    });

    setTimeout(() => this.dialogService.closeAll(), 5000);
  }
}
```

If you only care about the response when a dialog has been closed, and ignore the opening result of it, there's a `whenClosed` method exposed on the returned promise of the `open` method of the dialog service, that should help you reduce some boilerplate code, per following example:

```typescript
import { EditPerson } from './edit-person';
import { IDialogService, DialogDeactivationStatuses } from '@aurelia/runtime-html';

export class Welcome {
  static inject = [IDialogService];

  person = { firstName: 'Wade', middleName: 'Owen', lastName: 'Watts' };
  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  submit() {
    this.dialogService
      .open({ component: () => EditPerson, model: this.person })
      .whenClosed(response => {
        console.log('The edit dialog has been closed');
        if (response.status === DialogDeactivationStatuses.Ok) {
          console.log('good');
        } else {
          console.log('bad');
        }
        console.log(response);
      })
      .catch(err => {
        console.log('Failed to edit person information');
      });
  }
}
```

### The Default Dialog Animator
### The Default Dialog Renderer
#### BYO Dialog Renderer
#### Component Lifecycles With The Dialog Plugin
