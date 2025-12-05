---
description: Outcome-based recipes for @aurelia/dialog to help you build confirmations, wizards, and guarded modals quickly.
---

# Dialog Outcome Recipes

## 1. Simple confirmation dialog that resolves a boolean

**Goal:** Ask the user to confirm a destructive action and return `true` or `false` without additional glue code.

### Steps

1. Create the dialog view-model that exposes a message and resolves when buttons are clicked:
   ```typescript
   import { IDialogController } from '@aurelia/dialog';

   export class ConfirmDialog {
     constructor(private readonly controller: IDialogController) {}

     activate(model: { message: string }) {
       this.message = model.message;
     }

     approve() {
       this.controller.ok(true);
     }

     cancel() {
       this.controller.cancel(false);
     }
   }
   ```
2. Invoke the dialog from any service or component:
   ```typescript
   import { IDialogService } from '@aurelia/dialog';
   import { resolve } from '@aurelia/kernel';

   export class TodoList {
     private readonly dialogs = resolve(IDialogService);

     async deleteItem(item: Todo) {
       const { wasCancelled } = await this.dialogs.open({
         component: () => import('./confirm-dialog'),
         model: { message: `Delete ${item.title}?` },
       });

       if (!wasCancelled) {
         await api.delete(item.id);
       }
     }
   }
   ```

### Checklist

- The `open` call resolves with `wasCancelled` set correctly.
- Keyboard shortcuts (Enter/Escape) map to `ok` and `cancel` automatically.
- The caller awaits the promise and branches on `wasCancelled` without extra ceremony.

## 2. Multi-step wizard inside a dialog

**Goal:** Guide users through several steps (for example, shipping and billing) while keeping the dialog open and showing a progress indicator.

### Steps

1. Create a parent wizard component that tracks the current step and exposes `next()` and `previous()` methods.
2. Each step is a child component registered as dependencies of the wizard and conditionally rendered in the dialog template.
3. Use the dialog model to pass initial data and return the final payload via `controller.ok(finalState)`.

```html
<!-- wizard-dialog.html -->
<div class="wizard">
  <ol class="steps">
    <li repeat.for="step of steps" class.bind="{ active: step === current }">${step.title}</li>
  </ol>
  <component :component.bind="current.component" :model.bind="state"></component>
  <footer>
    <button click.trigger="previous()" disabled.bind="!hasPrevious">Back</button>
    <button click.trigger="next()">${isLast ? 'Finish' : 'Next'}</button>
  </footer>
</div>
```

### Checklist

- Navigation buttons enable or disable appropriately.
- The final call to `controller.ok` returns all collected state to the opener.
- Dismissing the dialog mid-process triggers `controller.cancel`, so the opener can discard partial data.

## 3. Guard dialog close until async work finishes

**Goal:** Prevent users from closing a dialog while a save operation is in progress, even if they click outside or press Escape.

### Steps

1. Inside the dialog view-model, set `controller.settings.canCancel = false` while the save runs.
2. Re-enable cancel once the async operation completes or fails.

```typescript
export class EditProfileDialog {
  saving = false;

  constructor(private readonly controller: IDialogController) {}

  async save() {
    this.saving = true;
    this.controller.settings.canCancel = false;

    try {
      await api.saveProfile(this.model);
      this.controller.ok(this.model);
    } catch (err) {
      notifications.error('Save failed');
    } finally {
      this.saving = false;
      this.controller.settings.canCancel = true;
    }
  }
}
```

### Checklist

- Clicking the backdrop or pressing Escape does nothing while `saving` is true.
- Once the save finishes, the dialog can be cancelled again.
- The caller receives either `ok` with the payload or `cancel` after an explicit user action.

## 4. Slide-in drawer using the Standard renderer

**Goal:** Use the `<dialog>` based renderer but make it feel like a non-modal drawer that animates in from the side.

### Steps

1. Customize the Standard configuration at startup:
   ```typescript
   Aurelia.register(DialogConfigurationStandard.customize(settings => {
     settings.options.modal = false; // drawer, not modal
     settings.options.overlayStyle = 'background: transparent';
     settings.options.show = dom => dom.root.classList.add('drawer-open');
     settings.options.hide = dom => dom.root.classList.remove('drawer-open');
   }));
   ```
2. Provide CSS for the drawer animation:
   ```css
   dialog.drawer-open {
     width: 420px;
     height: 100vh;
     position: fixed;
     right: 0;
     top: 0;
     border: none;
     transform: translateX(0);
     transition: transform 200ms ease;
   }

   dialog:not(.drawer-open) {
     transform: translateX(100%);
   }
   ```
3. Open dialogs as usual. Because `modal` is false, the drawer behaves like a panel but still benefits from the dialog lifecycle.

### Checklist

- Drawer slides in and out using the custom classes defined by `options.show` and `options.hide`.
- Because the Standard renderer still manages the `<dialog>` semantics, focus trapping continues to work.
- Multiple drawers share the same configuration without repeating the animation code.

## 5. Locked modal with Classic renderer options

**Goal:** Require users to finish or cancel a workflow before returning to the page, with full control over keyboard and overlay behavior.

### Steps

1. Register the Classic configuration and customize the options:
   ```typescript
   Aurelia.register(DialogConfigurationClassic.customize(settings => {
     settings.options.lock = true;               // disable overlay dismiss
     settings.options.overlayDismiss = false;    // extra safety
     settings.options.keyboard = ['Escape'];     // allow ESC to cancel via pipeline
     settings.options.startingZIndex = 2000;     // keep above other overlays
   }));
   ```
2. When opening a dialog you can still override per-instance options:
   ```typescript
   dialogService.open({
     component: CreateUserDialog,
     rejectOnCancel: true, // throw when cancelled
     options: { keyboard: ['Escape', 'Enter'] } // allow Enter to submit
   });
   ```
3. The Classic renderer works without `<dialog>`, so it is ideal for browsers that lack native support or when you need finer control of z-index stacking.

### Checklist

- Clicking the backdrop no longer dismisses the modal (because `lock` and `overlayDismiss` are enforced).
- ESC and Enter behave exactly as configured through the `keyboard` option.
- Stacking multiple dialogs honors the `startingZIndex`, preventing overlap issues with other libraries.

## 6. Mix renderers per dialog

**Goal:** Use the Standard renderer globally but switch to Classic (or a custom renderer) for specific dialogs.

### Steps

1. Keep your global registration on the Standard configuration:
   ```typescript
   Aurelia.register(DialogConfigurationStandard);
   ```
2. When opening a dialog that needs Classic behavior, pass the renderer explicitly:
   ```typescript
   import { DialogDomRendererClassic } from '@aurelia/dialog';

   dialogService.open({
     component: LegacyDialog,
     renderer: DialogDomRendererClassic,
     options: { lock: false, overlayDismiss: true }
   });
   ```

### Checklist

- Only the targeted dialog uses the alternate renderer; other dialogs still use the default.
- Renderer-specific options become available for that call (for example `lock` for Classic).
- TypeScript enforces option compatibility because `options` matches the renderer you provide.

## 7. Global defaults versus per-open overrides

**Goal:** Understand when to customize `DialogConfiguration*` and when to override settings on a single `open` call.

### Steps

1. Use `DialogConfiguration*.customize` for broad defaults (reject-on-cancel behavior, animation hooks, overlay styling):
   ```typescript
   Aurelia.register(DialogConfigurationStandard.customize(settings => {
     settings.rejectOnCancel = true;
     settings.options.modal = true;
   }));
   ```
2. Override per open when only one dialog needs a tweak:
   ```typescript
   dialogService.open({
     component: TermsDialog,
     rejectOnCancel: false,            // one-off change
     options: { modal: false }         // temporary non-modal behavior
   });
   ```

### Checklist

- Defaults set through configuration affect every dialog unless overridden.
- Per-open overrides win for that call only, leaving global behavior intact.
- Choosing the right level prevents accidental regressions when new dialogs are introduced.

## Reference material

- [Dialog docs](./dialog.md)
- [API reference](https://docs.aurelia.io/packages/dialog)
