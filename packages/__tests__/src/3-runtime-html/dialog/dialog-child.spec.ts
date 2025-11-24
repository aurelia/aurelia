import {
    DialogConfigurationStandard,
    DialogService,
    IDialogService
} from '@aurelia/dialog';
import { resolve } from '@aurelia/kernel';
import {
    assert,
    createFixture,
} from '@aurelia/testing';
import { isNode } from '../../util.js';

describe('3-runtime-html/dialog/dialog-child.spec.ts', function () {
    if (isNode()) return;

    it('throws when trying to create child dialog service with unknown key', function () {
        assert.throws(() => createFixture(
            '<div>',
            class App {
                alert = resolve(IDialogService.child('alert'));
            },
            [
                DialogConfigurationStandard
            ]
        ));
    });

    it('creates child dialog service with customized settings', function () {
        const { component, getBy, assertClass } = createFixture(
            '<div>',
            class App {

                alert = resolve(IDialogService.child('alert'));
            },
            [
                DialogConfigurationStandard.withChild(
                    'alert',
                    _settings => {
                        return {
                            options: { modal: false },
                            renderer: {
                                render(dialogHost) {
                                    dialogHost.classList.add('custom-alert-renderer');
                                    return {
                                        contentHost: dialogHost,
                                        dispose() {
                                        }
                                    };
                                },
                            }
                        };
                    }
                )
            ]
        );

        void component.alert.open({
            template: 'abc',
            host: getBy('div'),
        });

        assertClass('div', 'custom-alert-renderer');
    });

    it('resolves to a singleton child dialog service for the same key', function () {
        const { component } = createFixture(
            '<div>',
            class App {
                alert1 = resolve(IDialogService.child('alert'));
                alert2 = resolve(IDialogService.child('alert'));
            },
            [
                DialogConfigurationStandard.withChild(
                    'alert',
                    _settings => {
                        return { options: { modal: false } };
                    }
                )
            ]
        );

        assert.strictEqual(component.alert1, component.alert2);
    });

    it('creates different child dialog services for different keys', function () {
        let setting1: any = {};
        let setting2: any = setting1;
        const { component } = createFixture(
            '<div>',
            class App {
                alert = resolve(IDialogService.child('alert'));
                confirm = resolve(IDialogService.child('confirm'));
            },
            [
                DialogConfigurationStandard.withChild(
                    'alert',
                    settings => {
                        setting1 = settings;
                        return {};
                    }
                ).withChild(
                    'confirm',
                    settings => {
                        setting2 = settings;
                        return {};
                    }
                )
            ]
        );

        assert.notStrictEqual(component.alert, component.confirm);
        assert.notStrictEqual(setting1, setting2);
    });

    it('resolves child dialog using child static method on DialogService', function () {
        const { component } = createFixture(
            '<div>',
            class App {
                service = resolve(IDialogService);
                alert = resolve(DialogService.child('alert'));
            },
            [
                DialogConfigurationStandard.withChild(
                    'alert',
                    () => ({})
                )
            ]
        );

        assert.instanceOf(component.alert, DialogService);
    });
});
