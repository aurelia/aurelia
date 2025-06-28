---
description: The basics of the dialog plugin for Aurelia.
---

# Dialog

## Introduction

This article covers the dialog plugin for Aurelia. This plugin is created for showing dialogs (sometimes referred to as modals) in our application. The plugin supports the use of dynamic content for all aspects and is easily configurable / overridable.

{% hint style="success" %}
**Here's what you'll learn...**

* How to install & configure the plugin
* How to use default dialog service
* How to enhance & replace parts of the default implementations
* The lifeycle of a dialog
{% endhint %}

## Installing The Plugin

There are two main interfaces of the dialog plugin, which includes:

* `IDialogService`: an interface mainly used by application components
* `IDialogGlobalOptions`: an interface for specifying default options for all dialog rendering.
    This is the interface that is used to configure/retrieve information about default renderer, options, etc...
    for dialogs.

Aurelia provides some out of the box implementations for the mentioned above interfaces. They are `DialogConfigurationStandard` and `DialogConfigurationClassic`.
An example usage of the `DialogConfigurationStandard` is as follow:

```typescript
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { Aurelia } from 'aurelia';

Aurelia.register(DialogConfigurationStandard).app(MyApp).start();
```

`DialogConfigurationStandard` is a set of implementations that will render dialogs using the standard html `<dialog>` element,
which is described at https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog.
`DialogConfigurationClassic` is a set of implementations that will render dialogs using a traditional way: a combination of multiple html elements
with some specific CSS that produces the look and feel of dialogs/modals.

While some applications may want to stay with the standard `<dialog>` elements, the classic configuration provides an easier path for migration from v1,
and sometimes more flexibility over styling & functionalities. It's thus up to applications to decide which implementation they want to use.

### Configuring the Plugin

The dialog plugin can be configured both on a global level and individual dialog level. This section deals with configuring the dialog plugin on the global level.

To configure the dialog plugin, call `.customize` on the provided configuration of your choice, like the following examples:

{% tabs %}
{% tab title="Standard" %}

```ts
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { Aurelia } from 'aurelia';

Aurelia
  .register(DialogConfigurationStandard.customize((settings) => {
    // treat dialog cancelation as promise rejection
    settings.rejectOnCancel = true;
    // default enter animation for all dialogs
    settings.options.show = (dom) => dom.root.animate(...);
    // default exit animation for all dialogs
    settings.options.hide = (dom) => dom.root.animate(...);
  })
  .app(MyApp)
  .start();
```
{% endtab %}
{% tab title="Classic" %}

```ts
import { DialogConfigurationClassic } from '@aurelia/dialog';
import { Aurelia } from 'aurelia';

Aurelia
  .register(DialogConfigurationClassic.customize((settings) => {
    // treat dialog cancelation as promise rejection
    settings.rejectOnCancel = true;
    // change the default behavior to not dismiss the dialog when clicking on the overlay
    settings.options.overlayDismiss = false;
    // any more
    // default enter animation for all dialogs
    settings.options.show = (dom) => dom.root.animate(...);
    // default exit animation for all dialogs
    settings.options.hide = (dom) => dom.root.animate(...);
  })
  .app(MyApp)
  .start();
```
{% endtab %}
{% endtabs %}

If it's desirable to change some of the default implementations, we can **instead** use the export named `DialogConfiguration` and pass in the list of implementation for the main interfaces:

```typescript
import { DialogConfiguration } from '@aurelia/dialog';

Aurelia
  .register(DialogConfiguration.customize(
    settings => {
      // customize settings here if needed
    }))
  .app(MyApp)
  .start();
```

## Using The Default Implementations

### The Dialog Settings

There are two levels where dialog behaviors can be configured:

* Global level via `IDialogGlobalSettings`
* Single dialog level via dialog service `.open()` call, or the property `settings` on a dialog controller.

Normally, the global settings would be changed during the app startup/or before, while the single dialog settings would be changed during the contruction of the dialog view model, via the `open` method.

1. An example of configuring the **global** dialog settings:
    - For the standard implementation:
        Make all dialogs, by default:
        * show as modal
        * has some basic animation in & out

        ```ts
        Aurelia
          .reigster(DialogConfigurationStandard.customize((settings) => {
            settings.options.modal = true;
            settings.options.show = (dom) => dom.root.animate(...);
            settings.options.hide = (dom) => dom.root.animate(...);
          }))
          .app(MyApp)
          .start();
        ```
    - For the classic implementation:
        Make all dialogs, by default:
        * not dismissable by clicking outside of it, or hitting the ESC key
        * have starting CSS `z-index` of 5
        *   if not locked, closable by hitting the `ESC` key

            ```ts
            Aurelia
              .register(DialogConfigurationClassic.customize((settings) => {
                settings.options.lock = true;
                settings.options.startingZIndex = 5;
                settings.options.keyboard = true;
              }))
              .app(MyApp)
              .start();
            ```

2. An example of configuring a single dialog, via `open` method of the dialog service:
    - For the standard implementation:
        Displaying an alert dialog

        ```ts
        dialogService.open({
          component: Alert,
          options: {
            // block the entire screen with this alert box
            modal: true,
            show: dom => dom.root.animate(...),
            hide: dom => dom.root.animate(...)
          }
        })
        ```

    - For the classic implementation:
        Displaying an alert dialog, which has `z-index` value as 10 to stay on top of all other dialogs, and will be dismissed when the user hits the `ESC` key.

        ```typescript
        dialogService.open({
          component: Alert,
          options: {
            lock: false,
            startingZIndex: 10,
          }
        });
        ```

The main settings that are available in the `open` method of the dialog service:

* `component` can be class reference or instance, or a function that resolves to such, or a promise of such.
* `template` can be HTML elements, string or a function that resolves to such, or a promise of such.
* `model` the data to be passed to the `canActivate` and `activate` methods of the view model if implemented.
* `host` allows providing the element which will parent the dialog - if not provided the document body will be used.
* `renderer` allows providing a custom renderer to be used, instead of the pre-registered one. This allows a single dialog service to be able to use multiple renderers for different purposes: default for modals, and a different one for notifications, alert etc...
* `container` allows specifying the DI Container instance to be used for the dialog. If not provided a new child container will be created from the root one.
* `rejectOnCancel` is a boolean that must be set to `true` if cancellations should be treated as rejection. The reason will be an `IDialogCancelError` - the property `wasCancelled` will be set to `true` and if cancellation data was provided it will be set to the `value` property.
* `options` options passed to the renderer.

#### Render options

Beside the main settings above, each renderer may require different set of options. Below is the options for the default implementations of Aurelia dialog plugin:
1. For the standard implementation:
    * **modal**: open the dialog as modal, read more on https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
    * **overlayStyle**: a css string or a css style declaration for styling the overlay. This is only effective when `modal` option is true. The overlay can also be styled from the dialog dom for this renderer.
    * **show**: can be given a callback that will run when the dialog is shown
    * **hide**: can be given a callback that will run when the dialog is hidden
    * **closedby**: specifies the types of user actions that can be used to close the &lt;dialog&gt; element

    The default global settings has the following values:
    * `modal` is true
    * `rejectOnCancel` is false

2. For the classic implementation:
    * `lock` makes the dialog not dismissable via clicking outside, or using keyboard.
    * `keyboard` allows configuring keyboard keys that close the dialog. To disable set to an empty array `[]`. To cancel close a dialog when the _ESC_ key is pressed set to an array containing `'Escape'` - `['Escape']`. To close with confirmation when the _ENTER_ key is pressed set to an array containing `'Enter'` - `['Enter']`. To combine the _ESC_ and _ENTER_ keys set to `['Enter', 'Escape']` - the order is irrelevant. (takes precedence over `lock`)
    * `overlayDismiss` if set to `true` cancel closes the dialog when clicked outside of it. (takes precedence over `lock`)

    The default global settings has the following values:

    * `lock` is true
    * `startingZIndex` is `1000`
    * `rejectOnCancel` is `false`

### The Dialog Service APIs

The interface that a dialog service should follow:

```typescript
interface IDialogService {
  readonly controllers: IDialogController[];

  /**
   * Opens a new dialog.
   *
   * @param settings - Dialog settings for this dialog instance.
   * @returns Promise A promise that settles when the dialog is closed.
   */
  open(settings?: IDialogSettings): DialogOpenPromise;

  /**
   * Closes all open dialogs at the time of invocation.
   *
   * @returns Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  closeAll(): Promise<IDialogController[]>;
}
```

The interface that a dialog controller should follow:

```typescript
interface IDialogController {
  readonly settings: Readonly<ILoadedDialogSettings>;
  /**
   * A promise that will be fulfilled once this dialog has been closed
   */
  readonly closed: Promise<DialogCloseResult>;

  ok(value?: unknown): Promise<DialogCloseResult<'ok'>>;
  cancel(value?: unknown): Promise<DialogCloseResult<'cancel'>>;
  error(value?: unknown): Promise<void>;
}
```

An important feature of the dialog plugin is that it is possible to resolve and close a dialog (using `cancel`/`ok`/`error` methods on the controller) in the same context where it's open.

*   Example of controlling the opening and closing of a dialog in promise style:

    ```typescript
    import { EditPerson } from './edit-person';
    import { IDialogService, DialogDeactivationStatuses } from '@aurelia/dialog';

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
            // We get here when the dialog is opened,
            // and we are able to close dialog
            setTimeout(() => {
              openDialogResult.dialog.cancel('Failed to finish editing after 3 seconds');
            }, 3000);

            // each dialog controller should expose a promise for attaching callbacks
            // to be executed for when it has been closed
            return openDialogResult.dialog.closed;
          })
          .then((response) => {
            if (response.status === 'ok') {
              console.log('good');
            } else {
              console.log('bad');
            }
            console.log(response);
          });
      }
    }
    ```
*   Example of controlling the opening and closing of a dialog using `async/await`:

    ```typescript
    import { EditPerson } from './edit-person';
    import { IDialogService, DialogDeactivationStatuses } from '@aurelia/dialog';

    export class Welcome {
      static inject = [IDialogService];

      person = { firstName: 'Wade', middleName: 'Owen', lastName: 'Watts' };
      constructor(dialogService) {
        this.dialogService = dialogService;
      }

      async submit() {
        const { dialog } = await this.dialogService.open({
          component: () => EditPerson,
          model: this.person
        });
        // Note:
        // We get here when the dialog is opened,
        // and we are able to close dialog
        setTimeout(() => {
          dialog.cancel('Failed to finish editing after 3 seconds');
        }, 3000);

        const response = await dialog.closed;
        if (response.status === 'ok') {
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
import { IDialogService, DialogDeactivationStatuses } from '@aurelia/dialog';

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

If there's no need for the opening result of a dialog, and only the response of it after the dialog has been closed, there is a `whenClosed` method exposed on the returned promise of the `open` method of the dialog service, that should help reduce some boilerplate code, per following example:

```typescript
import { EditPerson } from './edit-person';
import { IDialogService, DialogDeactivationStatuses } from '@aurelia/dialog';

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
        if (response.status === 'ok') {
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

**Template Only Dialogs**

The dialog service supports rendering dialogs with only template specified. A template only dialog can be open like the following examples:

```typescript
dialogService.open({
  template: () => fetch('https://some-server.com/alert-dialog.html').then(r => r.text()),
  template: () => '<div>Welcome to Aurelia</div>',
  template: '<div>Are you ready?</div>'
})
```

**Retrieving the dialog controller**

By default, the dialog controller of a dialog will be assigned automatically to the property `$dialog` on the component view model. To specify this in TypeScript, the component class can implement the interface `IDialogCustomElementViewModel`:

```typescript
import { IDialogController, IDialogCustomElementViewModel } from '@aurelia/dialog';

class MyDialog implements IDialogCustomElementViewModel {
  $dialog: IDialogController;

  closeDialog() {
    this.$dialog.ok('All good!');
  }
}
```

{% hint style="warning" %}
Note that the property `$dialog` will only be ready after the contructor.
{% endhint %}

If it's desirable to retrieve the associated dialog controller of a dialog during the constructor of the component, `IDialogController` can be inject to achieve the same effect:

```typescript
import { resolve } from 'aurelia';
import { IDialogController } from '@aurelia/dialog';

class MyDialog {
  constructor() {
    // change some settings
    resolve(IDialogController).settings.zIndex = 100;
  }
}
```

This means it's also possible to control the dialog from template only dialog via the `$dialog` property. An example of this is: Open an alert dialog, and display an "Ok" button to close it, without using any component:

```typescript
dialogService.open({
  template: `<div>
    Please check the oven!
    <button click.trigger="$dialog.ok()">Close and check</button>
  </div>`
})
```

### The Default Dialog Renderer

By default, the dialog DOM structure is rendered as follow:

```
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

#### Centering/Uncentering dialog position

By default, the dialog content host is centered horizontally and vertically. It can be changed via `IDialogDom` injection:

```typescript
import { resolve } from 'aurelia';
import { IDialogDom, DefaultDialogDom } from '@aurelia/dialog';

export class MyDialog {
  constructor(dialogDom: DefaultDialogDom = resolve(IDialogDom)) {
    dialogDom.contentHost.style.margin = "0 auto"; // only center horizontally
  }
}
```

{% hint style="info" %}
Note that the `contentHost` property on a `DefaultDialogDom` object is the same with the host element of a component. You can inject `IDialogDom` and retrieve the host element via `contentHost` property, or inject `INode`/`Element`/`HTMLElement` to retrieve it.
{% endhint %}

#### Styling the overlay

1. For the standard implementation

    The overlay of a `<dialog>` element is only "rendered" when it's shown as modal. Which means the following example will not "trigger" any overlay:

    ```ts
    dialogService.open({
      component: Alert,
      options: {
        overlayStyle: 'rgba(0,0,0,0.5)'
      }
    })
    ```
    as `options.modal` value is not `true`.

    When `options.modal` is `true`, the overlay can be specified using `options.overlayStyle` like the following example:

    ```ts
    dialogService.open({
      component: Alert,
      options: {
        modal: true,
        overlayStyle: 'rgba(0,0,0,0.5)'
      }
    })
    ```

    Note that the overlay of a modal dialog dom can also be configured from the dialog dom itself, like the following example:

    ```ts
    import { resolve } from 'aurelia';
    import { IDialogDom, DialogDomStandard } from '@aurelia/dialog';

    export class MyDialog {
      constructor(dialogDom = resolve(IDialogDom) as DialogDomStandard) {
        dialogDom.setOverlayStyle("rgba(0, 0, 0, 0.5)");
      }
    }
    ```

2. For the classic implementation

    By default, the overlay of a dialog is transparent. Though it's often desirable to add 50% opacity and a background color of black to the modal. To achieve this in dialog, retrieve the `IDialogDom` instance and modify the `overlay` element `style`:

    ```typescript
    import { resolve } from 'aurelia';
    import { IDialogDom, DefaultDialogDom } from '@aurelia/dialog';

    export class MyDialog {
      constructor(dialogDom: DefaultDialogDom = resolve(IDialogDom)) {
        dialogDom.overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      }
    }
    ```

#### Use your own Dialog Renderer

There are two ways to use your own dialog renderer: register your own default dialog renderer, or specify the renderer via `renderer` setting of dialog service `.open()`.

1. To register your own default dialog renderer, you can follow the below example:

    ```typescript
    import { Registration } from 'aurelia';
    import { IDialogRenderer } from '@aurelia/dialog';

    export class MyDialogRenderer {
      static register(container) {
        Registration.singleton(IDialogRenderer, MyDialogRenderer).register(container);
      }

      render(host, controller, options) {
        const overlay = document.createElement('dialog-overlay');
        const root = document.createElement('dialog-content-host');
        const contentHost = document.createElement('div');
        root.appendChild(contentHost);

        host.appendChild(overlay);
        host.appendChild(root);

        return {
          overlay,
          root: contentHost,
          contentHost,
          dispose() {
            host.removeChild(overlay);
            host.removeChild(root);
          }
        }
      }
    }
    ```
    Notice the returned object of the `render()` method, it should satisfy the interface of an `IDialogDom`:
    ```typescript
    interface IDialogDom extends IDisposable {
      readonly root: HTMLElement;
      readonly overlay: HTMLElement | null;
      readonly contentHost: HTMLElement;
      show?(): void | Promise<void>;
      hide?(): void | Promise<void>;
    }
    ```
2. To specify the renderer via `renderer` setting in the dialog service open call, you can follow the below example:

    ```typescript
    ...
    dialogService.open({
      template: '<div>hey there</div>',
      renderer: {
        render(host, controller, options) {
          const overlay = document.createElement('dialog-overlay');
          const root = document.createElement('dialog-content-host');
          const contentHost = document.createElement('div');
          root.appendChild(contentHost);

          host.appendChild(overlay);
          host.appendChild(root);

          return {
            root,
            overlay,
            contentHost,
            dispose() {
              host.removeChild(overlay);
              host.removeChild(root);
            }
          }
        }
      }
    })
    ```
    Notice the object given to the `renderer` property, it should satisfy the interface of an `IDialogDomRenderer`:
    ```typescript
    interface IDialogDomRenderer {
      render(dialogHost: Element, controller: IDialogController, options: unknown): IDialogDom;
    }
    ```

    {% hint style="info" %}
    the `options` object will be the combination of the global `options` and the `options` from the `dialogService.open()`
    {% endhint %}

### Animation

#### Using the `IDialogDomAnimator`

If you use either the default implementations of the interface `IDialogRenderer`, then the in/out animations of a dialog can be configured via `show`/`hide`
the options settings, like the following examples:

1. Global animations for all dialogs:

```typescript
Aurelia.register(DialogStandardConfiguration.customize(settings => {
  settings.options.show = (dom) => dom.root.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 150 });
}))
```

2. Different animation per dialog `.open()`

```typescript
dialogService.open({
  component: SuccessNotification,
  options: {
    show: dom => dom.root.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 150 }),
    hide: dom => dom.root.animate([{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 150 }),
  }
})
```

#### Using component lifecycles

The lifecycles `attaching` and `detaching` can be used to animate a dialog, as in those lifecycles, if a promise is returned, it will be awaited during the activation/deactivation phases.

An example of animating a dialog on attaching and detaching, with the animation duration of 200 milliseconds:

```typescript
import { resolve } from 'aurelia';

export class MyDialog {
  host: Element = resolve(Element);
  constructor(host: Element) {
    this.host = host;
  }

  attaching() {
    const animation = this.host.animate(
      [{ transform: 'translateY(0px)' }, { transform: 'translateY(-300px)' }],
      { duration: 200 },
    );
    return animation.finished;
  }

  detaching() {
    const animation = this.host.animate(
      [{ transform: 'translateY(-300px)' }, { transform: 'translateY(0)' }],
      { duration: 200 },
    );
    return animation.finished;
  }
}
```

### Component Lifecycles With The Dialog Plugin

In adition to the lifecycle hooks defined in the core templating, the `dialog` defines additional ones. All dialog specific hooks can return a `Promise`, that resolves to the appropriate value for the hook, and will be awaited.

#### `.canActivate()`

This hook can be used to cancel the opening of a dialog. It is invoked with one parameter - the value of the `model` setting passed to `.open()`. To cancel the opening of the dialog return `false` - `null` and `undefined` will be coerced to `true`.

#### `.activate()`

This hook can be used to do any necessary init work. The hook is invoked with one parameter - the value of the `model` setting passed to `.open()`.

#### `.canDeactivate(result: DialogCloseResult)`

This hook can be used to cancel the closing of a dialog. To do so return `false` - `null` and `undefined` will be coerced to `true`. The passed in result parameter has a property `status`, indicating if the dialog was closed or cancelled, or the deactivation process itself has been aborted, and an `value` property with the dialog result which can be manipulated before dialog deactivation.

The `DialogCloseResult` has the following interface (simplified):

```typescript
interface DialogCloseResult {
  readonly status: 'Ok' | 'Cancel' | 'Abort' | 'Error';
  readonly value?: unknown;
}
```

> Warning When the `error` method of a `DialogController` is called this hook will be skipped.

#### `.deactivate(result: DialogCloseResult)`

This hook can be used to do any clean up work. The hook is invoked with one result parameter that has a property `status`, indicating if the dialog was closed (`Ok`) or cancelled (`Cancel`), and an `value` property with the dialog result.

#### Order of Invocation

Each dialog instance goes through the full lifecycle once.

\--- activation phase:

1. `constructor()`
2. `.canActivate()` - `dialog` _specific_
3. `.activate()` - `dialog` _specific_
4. `hydrating`
5. `hydrated`
6. `.created()`
7. `.binding()`
8. `.bound()`
9. `attaching`
10. `attached`

\--- deactivation phase:

1. `.canDeactivate()` - `dialog` _specific_
2. `.deactivate()` - `dialog` _specific_
3. `.detaching()`
4. `.unbinding()`

## V1 Dialog Migration

* The v1 dialog implementation is now available as classic implementation. It can be accessed via export `DialogClassicConfiguration` from the `@aurelia/dialog` plugin
* Beside `viewModel`/`template`/`model`/`container`/`host`/`rejectOnCancel`, all other configuration have been moved to `options` on the dialog settings/global settings. The properties are: `lock`, `keyboard`, `mouseEvent`, `overlayDismiss` and `startingZIndex`.
* Design wise, the v2 dialog plugin is rendering agnostic, it only requires the result of the render satisfy the `IDialogDom` interface
* `viewModel` setting in `DialogService.prototype.open` is changed to `component`.
* `view` setting in `DialogService.prototype.open` is changed to `template`.
* `keyboard` setting in `DialogService.prototype.open` is changed to accept an array of `Enter`/`Escape` only. Boolean variants are no longer valid. In the future, the API may become less strict.
*   The resolved of `DialogService.prototype.open` is changed from:

    ```typescript
      interface DialogOpenResult {
        wasCancelled: boolean;
        controller: DialogController;
        closeResult: Promise<DialogCloseResult>;
      }
    ```

    to:

    ```typescript
      interface DialogOpenResult {
        wasCancelled: boolean;
        dialog: IDialogController;
      }
    ```
*   `closeResult` is removed from the returned object. Uses `closed` property on the dialog controller instead, example of open a dialog with hello world text, and automaticlly close after 2 seconds:

    ```typescript
      dialogService
        .open({ template: 'hello world' })
        .then(({ dialog }) => {
          setTimeout(() => { dialog.ok() }, 2000)
          return dialog.closed
        });
    ```
*   The interface of dialog close results is changed from:

    ```typescript
      interface DialogCloseResult {
        wasCancelled: boolean;
        output?: unknown;
      }
    ```

    to:

    ```typescript
      interface DialogCloseResult {
        status: DialogDeactivationStatus;
        value?: unknown;
      }
    ```
* The dialog controller is assigned to property `$dialog` (v2) on the view model, instead of property `controller` (v1)

TODO: links to advanced examples/playground
