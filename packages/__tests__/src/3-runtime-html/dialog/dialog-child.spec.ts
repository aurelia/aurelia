import {
    DialogConfigurationStandard,
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
                    settings => {
                        settings.options.modal = false;
                        settings.renderer = {
                            render(dialogHost) {
                                dialogHost.classList.add('custom-alert-renderer');
                                return {
                                    contentHost: dialogHost,
                                    dispose() {

                                    }
                                };
                            },
                        };
                    }
                )
            ]
        );

        component.alert.open({
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
                    settings => {
                        settings.options.modal = false;
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
                    }
                ).withChild(
                    'confirm',
                    settings => {
                        setting2 = settings;
                    }
                )
            ]
        );

        assert.notStrictEqual(component.alert, component.confirm);
        assert.notStrictEqual(setting1, setting2);
    });
});
