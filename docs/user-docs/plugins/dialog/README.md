---
description: The basics of the dialog plugin for Aurelia.
---

## Introduction

This article covers the dialog plugin for Aurelia. This plugin is created for showing dialogs (sometimes referred to as modals) in your application. The plugin supports the use of dynamic content for all aspects and is easily configurable / overridable.

{% hint style="success" %}
**Here's what you'll learn...**

* How to install & configure the plugin
* How to use default dialog service
* How to enhance & replace parts of the default implementations
* The lifeycle of a dialog
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

### Configuring the Plugin
The export `DefaultDialogConfiguration` is a preset of default behaviors & implementations that are done in a way suitable to most common scenarios.

* If it's desirable to change some of the behaviors or implementations of, we can either change the first or the 2nd parameter of the `customize` function on this object.

  An example of changing the behavior for configuring the global settings is:
  ```typescript
  Aurelia.register(DefaultDialogConfiguration.customize(globalSettings => {
    // change global settings ...
  })).app(MyApp).start()
  ```

* If it's desirable to change some of the default implementations, we can **instead** use the export named `DialogConfiguration` and pass in the list of implementation for the main interfaces:
  ```typescript
  import { DialogConfiguration } from '@aurelia/runtime-html';

  Aurelia.register(DialogConfiguration.customize(settings => {

  }, [
    // all custom implementation
    MyDialogService,
    MyDialogRenderer,
    MyDialogGlobalSettings,
    MyDialogAnimator,
  ]))
  ```
  If there's a need to only swap some implementation, say `IDialogDomRenderer` for example, then the default implementation can be imported and mixed like the following example:
  ```typescript
  import { DialogConfiguration, DialogService, DefaultDialogAnimator, DefaultGlobalSettings } from '@aurelia/runtime-html';

  Aurelia.register(DialogConfiguration.customize(settings => {

  }, [
    // use default dialog service
    DialogService,
    // BYO dialog dom renderer
    MyDialogRenderer,
    // use default dialog global settings
    DefaultGlobalSettings,
    // use default dialog animator
    DefaultDialogAnimator,
  ]))
  ```

## Using The Default Implementation
### The Dialog Settings
There are two levels where dialog behavior can be configured:
- Global level via `IDialogGlobalSettings`
- Single dialog level via property `settings` on a dialog controller.

Normally, the global settings would be changed during the app startup/or before, while the single dialog settings would be changed during the contruction of the dialog view model, via the `open` method.

An example of configuring the **global** dialog settings:

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

The default global settings has the following values:
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

### The Default Dialog Renderer
By default, the dialog DOM structure is rendered as follow:
```text
> (1) Dialog host element
  > (2) Dialog Wrapper Element
    > (3) Dialog Overlay Element
    > (4) Dialog Content Host Element
```

The Dialog host element is the target where an application chooses to add the dialog to, this is normally the document body, if not supplied in the settings of the `open` method of the dialog service.

An example of the html structure when document body is the dialog host:
```html
<body>
  <au-dialog-container> <!-- wrapper -->
    <au-dialog-overlay> <!-- overlay -->
    <div> <!-- dialog content host -->
```

By default, the dialog content host is centered horizontally and vertically. You can change this via `IDialogDom` injection:
```ts
import { IDialogDom, DefaultDialogDom } from '@aurelia/runtime-html';

@inject(IDialogDom)
export class MyDialog {
  public constructor(dialogDom: DefaultDialogDom) {
    dialogDom.host.style.margin = "0 auto"; // only center horizontally
  }
}
```

#### BYO Dialog Renderer
... todo
### The Default Dialog Animator
... todo
### Component Lifecycles With The Dialog Plugin
In adition to the lifecycle hooks defined in the core templating, the `dialog` defines additional ones. All dialog specific hooks can return a `Promise`, that resolves to the appropriate value for the hook, and will be awaited.

#### `.canActivate()`

With this hook you can cancel the opening of a dialog. It is invoked with one parameter - the value of the `model` setting passed to `.open()`. To cancel the opening of the dialog return `false` - `null` and `undefined` will be coerced to `true`.

#### `.activate()`

This hook can be used to do any necessary init work. The hook is invoked with one parameter - the value of the `model` setting passed to `.open()`.

#### `.canDeactivate(result: IDialogCloseResult)`

With this hook you can cancel the closing of a dialog. To do so return `false` - `null` and `undefined` will be coerced to `true`.
The passed in result parameter has a property `status`, indicating if the dialog was closed or cancelled, or the deactivation process itself has been aborted, and an `value` property with the dialog result which can be manipulated before dialog deactivation.

The `IDialogCloseResult` has the following interface (simplified):
```ts
interface IDialogCloseResult {
  readonly status: 'Ok' | 'Cancel' | 'Abort' | 'Error';
  readonly value?: unknown;
}
```

> Warning
> When the `error` method of a `DialogController` is called this hook will be skipped.

#### `.deactivate(result: IDialogCloseResult)`

This hook can be used to do any clean up work. The hook is invoked with one result parameter that has a property `status`, indicating if the dialog was closed (`Ok`) or cancelled (`Cancel`), and an `value` property with the dialog result.

#### Order of Invocation

Each dialog instance goes through the full lifecycle once.

--- activation phase:
1. `constructor()`
2. `.canActivate()` - `dialog` *specific*
3. `.activate()` - `dialog` *specific*
4. `define`
5. `hydrating`
6. `hydrated`
7. `.created()`
8. `.binding()`
9. `.bound()`
10. `attaching`
11. `attached`
--- deactivation phase:
12. `.canDeactivate()` - `dialog` *specific*
13. `.deactivate()` - `dialog` *specific*
14. `.detaching()`
15. `.unbinding()`
