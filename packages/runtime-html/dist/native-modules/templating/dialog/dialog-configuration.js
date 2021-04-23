import { IContainer, noop, Registration } from '../../../../../kernel/dist/native-modules/index.js';
import { IDialogGlobalSettings } from './dialog-interfaces.js';
import { DefaultDialogGlobalSettings, DefaultDialogDomRenderer } from './dialog-default-impl.js';
import { AppTask } from '../../app-task.js';
import { DialogService } from './dialog-service.js';
function createDialogConfiguration(settingsProvider, registrations) {
    return {
        settingsProvider: settingsProvider,
        register: (ctn) => ctn.register(...registrations, AppTask
            .with(IContainer)
            .beforeCreate()
            .call(c => settingsProvider(c.get(IDialogGlobalSettings)))),
        customize(cb, regs) {
            return createDialogConfiguration(cb, regs !== null && regs !== void 0 ? regs : registrations);
        },
    };
}
/**
 * A noop configuration for Dialog, should be used as:
```ts
DialogConfiguration.customize(settings => {
  // adjust default value of the settings
}, [all_implementations_here])
```
 */
export const DialogConfiguration = createDialogConfiguration(() => {
    throw new Error('Invalid dialog configuration. ' +
        'Specify the implementations for ' +
        '<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
        'or use the DialogDefaultConfiguration export.');
}, [class NoopDialogGlobalSettings {
        static register(container) {
            container.register(Registration.singleton(IDialogGlobalSettings, this));
        }
    }]);
export const DialogDefaultConfiguration = createDialogConfiguration(noop, [
    DialogService,
    DefaultDialogGlobalSettings,
    DefaultDialogDomRenderer,
]);
//# sourceMappingURL=dialog-configuration.js.map