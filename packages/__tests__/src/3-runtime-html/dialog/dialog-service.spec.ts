import { delegateSyntax } from '@aurelia/compat-v1';
import { resolve } from '@aurelia/kernel';
import {
  INode,
  customElement,
  CustomElement,
} from '@aurelia/runtime-html';
import {
  IDialogService,
  IDialogSettings,
  IDialogGlobalSettings,
  DialogConfiguration,
  DialogConfigurationClassic,
  DialogCancelError,
  IDialogDom,
  IDialogController,
  DialogController,
  DialogDomClassic,
  DialogService,
  DialogRenderOptionsClassic,
} from '@aurelia/dialog';
import {
  createFixture,
  assert,
  createSpy,
} from '@aurelia/testing';
import { isNode } from '../../util.js';

describe('3-runtime-html/dialog/dialog-service.spec.ts', function () {
  describe('configuration', function () {
    it('throws on empty configuration', async function () {
      let error: unknown = void 0;
      try {
        const { startPromise } = createFixture('', class App { }, [DialogConfiguration]);
        await startPromise;
      } catch (err) {
        error = err;
      }
      assert.notStrictEqual(error, void 0);
      // assert.includes((error as Error).message, 'Invalid dialog configuration.');
      assert.includes((error as Error).message, 'AUR0904');
    });

    it('allows injection of both IDialogService and DialogService', function () {
      const { container } = createFixture('', class { }, [DialogConfigurationClassic]);
      assert.strictEqual(
        container.get(IDialogService),
        container.get(DialogService)
      );
    });
  });

  describe('on deactivation', function () {
    it('throws when it fails to cleanup', async function () {
      const { ctx, startPromise, tearDown } = createFixture('', class App { }, [DialogConfigurationClassic]);

      await startPromise;
      const dialogService = ctx.container.get(IDialogService);

      let canDeactivate = false;
      await dialogService.open<DialogRenderOptionsClassic>({
        component: () => ({
          canDeactivate: () => canDeactivate
        }),
        template: () => '<div>Hello world</div>'
      });

      let err: Error;
      try {
        await tearDown();
      } catch(ex) {
        err = ex;
      }
      assert.notStrictEqual(err, undefined);
      assert.includes(err.message, 'AUR0901:1');
      // assert.includes(err.message, 'There are still 1 open dialog(s).');

      canDeactivate = true;
      await dialogService.closeAll();
    });
  });

  describe('.open()', function () {
    const testCases: IDialogServiceTestCase[] = [
      {
        title: 'throws on invalid configuration',
        afterStarted: async (_, dialogService) => {
          let error: DialogCancelError<unknown>;
          await dialogService.open<DialogRenderOptionsClassic>({}).catch(err => error = err);
          assert.includes(error.message, 'AUR0903');
          // assert.strictEqual(error.message, 'Invalid Dialog Settings. You must provide "component", "template" or both.');
        }
      },
      {
        title: 'works with @inject(IDialogController, IDialogDom, INode)',
        afterStarted: async (_, dialogService) => {
          await dialogService.open<DialogRenderOptionsClassic>({
            component: () => class {
              public static inject = [IDialogController, IDialogDom, INode];
              public constructor(
                controller: DialogController,
                dialogDom: DialogDomClassic,
                node: Element
              ) {
                assert.strictEqual(controller['dom'], dialogDom);
                assert.strictEqual(dialogDom.contentHost, node);
              }
            }
          });
        }
      },
      {
        title: 'allows both @inject(DialogController) and @inject(IDialogController)',
        afterStarted: async (_, dialogService) => {
          await dialogService.open<DialogRenderOptionsClassic>({
            component: () => class {
              public static inject = [DialogController, IDialogController];
              public constructor(
                controller: DialogController,
                controller2: IDialogController,
              ) {
                assert.strictEqual(controller, controller2);
              }
            }
          });
        }
      },
      {
        title: 'distinguishes between a custom element constructor and a normal function',
        afterStarted: async ({ ctx }, dialogService) => {
          const expected = 'hello world';
          const Klass = CustomElement.define({ name: 'any', template: 'hello world' }, class {
            public static inject = [IDialogController];
            public constructor(controller: IDialogController) {
              assert.strictEqual(controller.settings.component, this.constructor);
            }
          });
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            component: Klass,
          });
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), expected);
          void dialog.ok();
          await dialog.closed;
        }
      },
      {
        title: 'works with promise component',
        afterStarted: async (_, dialogService) => {
          let activated = false;
          await dialogService.open<DialogRenderOptionsClassic>({
            component: () => new Promise(r => {
              setTimeout(() => r({ activate: () => activated = true }), 0);
            })
          });
          assert.strictEqual(activated, true);
        }
      },
      {
        title: 'works with promise template',
        afterStarted: async ({ ctx }, dialogService) => {
          await dialogService.open<DialogRenderOptionsClassic>({
            template: () => new Promise(r => {
              setTimeout(() => r('<p>hello world 1234'), 0);
            })
          });
          assert.visibleTextEqual(ctx.doc.querySelector('p'), 'hello world 1234');
        }
      },
      {
        title: 'hasOpenDialog with 1 dialog',
        afterStarted: async (_, dialogService) => {
          const { dialog: controller } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          assert.strictEqual(dialogService.controllers.length, 1);
          void controller.ok();
          await controller.closed;
          assert.strictEqual(dialogService.controllers.length, 0);
        }
      },
      {
        title: 'hasOpenDialog with more than 1 dialog',
        afterStarted: async (_, dialogService) => {
          const { dialog: dialog1 } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          assert.strictEqual(dialogService.controllers.length, 1);
          const { dialog: dialog2 } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          assert.strictEqual(dialogService.controllers.length, 2);
          void dialog1.ok();
          await dialog1.closed;
          assert.strictEqual(dialogService.controllers.length, 1);
          void dialog2.ok();
          await dialog2.closed;
          assert.strictEqual(dialogService.controllers.length, 0);
        }
      },
      {
        title: 'should create new settings by merging the default options and the provided ones',
        afterStarted: async ({ ctx }, dialogService) => {
          const overrideSettings: IDialogSettings<DialogRenderOptionsClassic> = {
            rejectOnCancel: true,
            options: {
              lock: true,
              keyboard: ['Escape'],
              overlayDismiss: true,
            }
          };
          const { dialog: controller } = await dialogService.open<DialogRenderOptionsClassic>({
            ...overrideSettings,
            component: () => Object.create(null),
          });
          const expectedSettings = { ...ctx.container.get(IDialogGlobalSettings).options, ...overrideSettings.options };
          const actualOptions = { ...controller.settings.options as object };
          // delete actualSettings.component;
          assert.deepStrictEqual(actualOptions, expectedSettings);
        }
      },
      {
        title: 'should not modify the default settings',
        afterStarted: async ({ ctx }, dialogService) => {
          const overrideSettings = { component: () => ({}), model: 'model data' };
          const expectedSettings = { ...ctx.container.get(IDialogGlobalSettings) };
          await dialogService.open<DialogRenderOptionsClassic>(overrideSettings);
          const actualSettings = { ...ctx.container.get(IDialogGlobalSettings) };
          assert.deepStrictEqual(actualSettings, expectedSettings);
        }
      },
      ...[null, undefined, true].map<IDialogServiceTestCase>(canActivate => ({
        title: `invokes & resolves with [canActivate: ${canActivate}]`,
        afterStarted: async function ({ ctx }, dialogService) {
          let canActivateCallCount = 0;
          @customElement({
            name: 'test',
            template: 'hello dialog',
          })
          class TestElement {
            public canActivate() {
              canActivateCallCount++;
              return canActivate;
            }
          }

          const result = await dialogService.open<DialogRenderOptionsClassic>({
            component: () => TestElement
          });
          assert.strictEqual(result.wasCancelled, false);
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), 'hello dialog');
        },
        afterTornDown: ({ ctx }) => {
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      })),
      {
        title: 'resolves to "IOpenDialogResult" with [canActivate: false + rejectOnCancel: false]',
        afterStarted: async ({ ctx }, dialogService) => {
          let canActivateCallCount = 0;
          const result = await dialogService.open<DialogRenderOptionsClassic>({
            rejectOnCancel: false,
            template: 'hello world',
            component: () => class TestElement {
              public canActivate() {
                canActivateCallCount++;
                return false;
              }
            }
          });
          assert.strictEqual(result.wasCancelled, true);
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      },
      {
        title: 'gets rejected with "IDialogCancelError" with [canActivate: false + rejectOnCancel: true]',
        afterStarted: async ({ ctx }, dialogService) => {
          let canActivateCallCount = 0;
          let error: DialogCancelError<unknown>;
          await dialogService.open<DialogRenderOptionsClassic>({
            rejectOnCancel: true,
            template: 'hello world',
            component: () => class TestElement {
              public canActivate() {
                canActivateCallCount++;
                return false;
              }
            }
          }).catch(err => error = err);

          assert.notStrictEqual(error, undefined);
          assert.strictEqual(error.wasCancelled, true);
          assert.includes(error.message, 'AUR0905');
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      },
      {
        title: 'propagates errors from canActivate',
        afterStarted: async (_, dialogService) => {
          const expectedError = new Error('Expected error.');
          let canActivateCallCount = 0;
          let error: DialogCancelError<unknown>;
          await dialogService.open<DialogRenderOptionsClassic>({
            template: 'hello world',
            component: () => class TestElement {
              public canActivate() {
                if (canActivateCallCount === 0) {
                  canActivateCallCount++;
                  throw expectedError;
                }
              }
            }
          }).catch(err => error = err);
          assert.strictEqual(dialogService.controllers.length, 0);
          assert.strictEqual(error, expectedError);
          assert.strictEqual(canActivateCallCount, 1);
        }
      },
      ...[null, undefined, true].map<IDialogServiceTestCase>(canDeactivate => ({
        title: `invokes & resolves with [canDeactivate: ${canDeactivate}]`,
        afterStarted: async function ({ ctx }, dialogService) {
          let canActivateCallCount = 0;
          @customElement({
            name: 'test',
            template: 'hello dialog',
          })
          class TestElement {
            public canDeactivate() {
              canActivateCallCount++;
              return canDeactivate;
            }
          }

          const result = await dialogService.open<DialogRenderOptionsClassic>({
            component: () => TestElement
          });
          assert.strictEqual(result.wasCancelled, false);
          assert.strictEqual(canActivateCallCount, 0);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), 'hello dialog');

          void result.dialog.ok();
          await result.dialog.closed;
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      })),
      {
        title: 'resolves: "IDialogCloseResult" when: .ok()',
        afterStarted: async (_, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          const expectedValue = 'expected ok output';
          await dialog.ok(expectedValue);
          const result = await dialog.closed;
          assert.strictEqual(result.status, 'ok');
          assert.strictEqual(result.value, expectedValue);
        }
      },
      {
        title: 'resolves: "IDialogCloseResult" when: .cancel() + rejectOnCancel: false',
        afterStarted: async (_, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          const expectedOutput = 'expected cancel output';
          let error: DialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void dialog.cancel(expectedOutput);
          const result = await dialog.closed.catch(err => {
            errorCaughtCount++;
            error = err;
            return { status: 'error' };
          });
          assert.strictEqual(error, undefined);
          assert.strictEqual(errorCaughtCount, 0);
          assert.strictEqual(result.status, 'cancel');
        }
      },
      {
        title: 'rejects: "IDialogCancelError" when: .cancel() + rejectOnCancel: true',
        afterStarted: async (_, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: '', rejectOnCancel: true });
          const expectedValue = 'expected cancel error output';
          let error: DialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void dialog.cancel(expectedValue);
          await dialog.closed.catch(err => {
            errorCaughtCount++;
            error = err;
            return { status: 'ok' };
          });
          assert.notStrictEqual(error, undefined);
          assert.strictEqual(errorCaughtCount, 1);
          assert.strictEqual(error.wasCancelled, true);
          assert.strictEqual(error.value, expectedValue);
        }
      },
      {
        title: 'gets rejected with provided error when ".error" closed',
        afterStarted: async (_, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          const expectedError = new Error('expected test error');
          let error: DialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void dialog.error(expectedError);
          await dialog.closed.catch(err => {
            errorCaughtCount++;
            error = err;
          });
          assert.includes(error.message, 'AUR0908');
          assert.strictEqual(error.wasCancelled, false);
          assert.strictEqual(error.value, expectedError);
          assert.strictEqual(errorCaughtCount, 1);
        }
      },
      {
        title: '.closeAll() with 1 dialog',
        afterStarted: async (_, dialogService) => {
          await dialogService.open<DialogRenderOptionsClassic>({ template: '' });
          assert.strictEqual(dialogService.controllers.length, 1);
          const unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.controllers.length, 0);
          assert.deepStrictEqual(unclosedController, []);
        }
      },
      {
        title: '.closeAll() with more than 1 dialog',
        afterStarted: async (_, dialogService) => {
          await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({ template: '' }),
            dialogService.open<DialogRenderOptionsClassic>({ template: '' }),
            dialogService.open<DialogRenderOptionsClassic>({ template: '' }),
          ]);
          assert.strictEqual(dialogService.controllers.length, 3);
          const unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.controllers.length, 0);
          assert.deepStrictEqual(unclosedController, []);
        }
      },
      {
        title: '.closeAll() with one dialog open',
        afterStarted: async (_, dialogService) => {
          await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({ template: '' }),
            dialogService.open<DialogRenderOptionsClassic>({ template: '' }),
            dialogService.open<DialogRenderOptionsClassic>({
              component: () => class App {
                private deactivateCount = 0;
                public canDeactivate() {
                  // only deactivate when called 2nd time
                  return this.deactivateCount++ > 0;
                }
              }, template: ''
            }),
          ]);
          assert.strictEqual(dialogService.controllers.length, 3);
          let unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.controllers.length, 1);
          assert.strictEqual(unclosedController.length, 1);
          unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.controllers.length, 0);
          assert.deepStrictEqual(unclosedController, []);
        }
      },
      {
        title: 'closes dialog when clicking on overlay with lock: false',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false } });
          assert.strictEqual(ctx.doc.querySelector('au-dialog-container').textContent, 'Hello world');
          const overlay = ctx.doc.querySelector('au-dialog-overlay') as HTMLElement;
          overlay.click();
          await Promise.any([
            dialog.closed,
            new Promise(r => setTimeout(r, 50)),
          ]);
          assert.strictEqual(dialogService.controllers.length, 0);
        }
      },
      {
        title: 'does not close dialog when clicking on overlay with lock: undefined',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world' });
          assert.strictEqual((dialog.settings.options as DialogRenderOptionsClassic).lock, true);
          assert.strictEqual(ctx.doc.querySelector('au-dialog-container').textContent, 'Hello world');
          const overlay = ctx.doc.querySelector('au-dialog-overlay') as HTMLElement;
          overlay.click();
          await Promise.any([
            dialog.closed,
            new Promise(r => setTimeout(r, 50)),
          ]);
          assert.strictEqual(dialogService.controllers.length, 1);
        }
      },
      {
        title: 'does not close dialog when clicking on overlay with lock: true',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: true } });
          assert.strictEqual((dialog.settings.options as DialogRenderOptionsClassic).lock, true);
          assert.strictEqual(ctx.doc.querySelector('au-dialog-container').textContent, 'Hello world');
          const overlay = ctx.doc.querySelector('au-dialog-overlay') as HTMLElement;
          overlay.click();
          await Promise.any([
            dialog.closed,
            new Promise(r => setTimeout(r, 50)),
          ]);
          assert.strictEqual(dialogService.controllers.length, 1);
        }
      },
      {
        title: 'does not close dialog when clicking inside dialog host with lock: false',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false } });
          assert.strictEqual(ctx.doc.querySelector('au-dialog-container').textContent, 'Hello world');
          const host = ctx.doc.querySelector('div') as HTMLElement;
          host.click();
          await Promise.any([
            dialog.closed,
            new Promise(r => setTimeout(r, 50)),
          ]);
          assert.strictEqual(dialogService.controllers.length, 1);
        }
      },
      {
        title: 'closes the latest open dialog when hitting ESC key',
        afterStarted: async ({ ctx }, dialogService) => {
          const [{ dialog: dialog1 }, { dialog: dialog2 }] = await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false } }),
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false } })
          ]);
          const cancelSpy1 = createSpy(dialog1, 'cancel', true);
          const cancelSpy2 = createSpy(dialog2, 'cancel', true);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(cancelSpy1.calls.length, 0);
          assert.strictEqual(cancelSpy2.calls.length, 1);
          await dialog2.closed;
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(cancelSpy1.calls.length, 1);
          assert.strictEqual(cancelSpy2.calls.length, 1);
          await dialog1.closed;
          assert.strictEqual(dialogService.controllers.length, 0);

          cancelSpy1.restore();
          cancelSpy2.restore();
        }
      },
      {
        title: 'closes with keyboard: ["Enter", "Escape"] setting',
        afterStarted: async ({ ctx }, dialogService) => {
          const [{ dialog: dialog1 }, { dialog: dialog2 }] = await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false, keyboard: ['Enter', 'Escape'] } }),
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false, keyboard: ['Enter', 'Escape'] } })
          ]);
          const cancelSpy1 = createSpy(dialog1, 'ok', true);
          const cancelSpy2 = createSpy(dialog2, 'cancel', true);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(cancelSpy1.calls.length, 0);
          assert.strictEqual(cancelSpy2.calls.length, 1);
          await dialog2.closed;
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Enter' }));
          assert.strictEqual(cancelSpy1.calls.length, 1);
          assert.strictEqual(cancelSpy2.calls.length, 1);
          await dialog1.closed;
          assert.strictEqual(dialogService.controllers.length, 0);

          cancelSpy1.restore();
          cancelSpy2.restore();
        }
      },
      {
        title: 'does not close the latest open dialog when hitting ESC key when lock:true',
        afterStarted: async ({ ctx }, dialogService) => {
          const [{ dialog: dialog1 }, { dialog: dialog2 }] = await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false } }),
            dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: true } }),
          ]);
          const cancelSpy1 = createSpy(dialog1, 'cancel', true);
          const cancelSpy2 = createSpy(dialog2, 'cancel', true);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(cancelSpy1.calls.length, 0);
          assert.strictEqual(cancelSpy2.calls.length, 0);
          void dialog2.cancel();
          await dialog2.closed;
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(cancelSpy1.calls.length, 1);
          await dialog1.closed;
          assert.strictEqual(dialogService.controllers.length, 0);

          cancelSpy1.restore();
          cancelSpy2.restore();
        }
      },
      {
        title: 'closes on Enter with keyboard:Enter regardless lock:[value]',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog: dialog1 } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false, keyboard: ['Enter'] } });
          const { dialog: dialog2 } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: true, keyboard: ['Enter'] } });
          const okSpy1 = createSpy(dialog1, 'ok', true);
          const okSpy2 = createSpy(dialog2, 'ok', true);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Escape' }));
          assert.strictEqual(okSpy1.calls.length, 0);
          assert.strictEqual(okSpy2.calls.length, 0);

          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Enter' }));
          assert.strictEqual(okSpy1.calls.length, 0);
          assert.strictEqual(okSpy2.calls.length, 1);
          await dialog2.closed;
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Enter' }));
          assert.strictEqual(okSpy1.calls.length, 1);
          assert.strictEqual(okSpy2.calls.length, 1);
          await dialog1.closed;
          assert.strictEqual(dialogService.controllers.length, 0);

          okSpy1.restore();
          okSpy2.restore();
        }
      },
      {
        title: 'does not response to keys that are not [Escape]/[Enter]',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog: controller1 } = await dialogService.open<DialogRenderOptionsClassic>({ template: 'Hello world', options: { lock: false, keyboard: ['Enter', 'Escape'] } });
          const okSpy1 = createSpy(controller1, 'ok', true);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Tab' }));
          assert.strictEqual(okSpy1.calls.length, 0);

          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'A' }));
          assert.strictEqual(okSpy1.calls.length, 0);
          ctx.wnd.dispatchEvent(new ctx.wnd.KeyboardEvent('keydown', { key: 'Space' }));
          assert.strictEqual(okSpy1.calls.length, 0);

          okSpy1.restore();
        }
      },
      {
        title: 'invokes lifeycyles in correct order',
        afterStarted: async (_, dialogService) => {
          const lifecycles: string[] = [];
          function log(lifecylce: string) {
            lifecycles.push(lifecylce);
          }

          class MyDialog {
            public constructor() {
              log('constructor');
            }
          }

          [
            'canActivate',
            'activate',
            'hydrating',
            'hydrated',
            'binding',
            'bound',
            'attaching',
            'attached',
            'canDeactivate',
            'deactivate',
            'detaching',
            'unbinding',
          ].forEach(method => {
            MyDialog.prototype[method] = function () {
              log(method);
            };
          });

          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({ component: () => MyDialog });
          assert.deepStrictEqual(lifecycles, [
            'constructor',
            'canActivate',
            'activate',
            'hydrating',
            'hydrated',
            'binding',
            'bound',
            'attaching',
            'attached',
          ]);

          void dialog.ok();
          await dialog.closed;
          assert.deepStrictEqual(lifecycles, [
            'constructor',
            'canActivate',
            'activate',
            'hydrating',
            'hydrated',
            'binding',
            'bound',
            'attaching',
            'attached',
            'canDeactivate',
            'deactivate',
            'detaching',
            'unbinding',
          ]);
        }
      },
      {
        title: 'it works with .delegate listener',
        afterStarted: async ({ ctx }, dialogService) => {
          let click1CallCount = 0;
          let click2CallCount = 0;
          await Promise.all([
            dialogService.open<DialogRenderOptionsClassic>({
              component: () => class MyClass1 {
                public onClick() {
                  click1CallCount++;
                }
              },
              template: '<button data-dialog-btn click.delegate="onClick()">'
            }),
            dialogService.open<DialogRenderOptionsClassic>({
              component: () => class MyClass2 {
                public onClick() {
                  click2CallCount++;
                }
              },
              template: '<button data-dialog-btn click.delegate="onClick()">'
            }),
          ]);

          const buttons = Array.from(ctx.doc.querySelectorAll('[data-dialog-btn]')) as HTMLElement[];
          buttons[0].click();
          assert.strictEqual(click1CallCount, 1);
          assert.strictEqual(click2CallCount, 0);
          buttons[1].click();
          assert.strictEqual(click1CallCount, 1);
          assert.strictEqual(click2CallCount, 1);
        }
      },
      {
        title: 'it passes model to the lifecycle methods',
        afterStarted: async (_, dialogService) => {
          let canActivateCalled = false;
          let activateCalled = false;
          const model = {};
          await dialogService.open<DialogRenderOptionsClassic>({
            model,
            component: () => class {
              public canActivate($model: unknown) {
                canActivateCalled = true;
                assert.strictEqual(model, $model);
              }
              public activate($model: unknown) {
                activateCalled = true;
                assert.strictEqual(model, $model);
              }
            }
          });
          assert.strictEqual(canActivateCalled, true);
          assert.strictEqual(activateCalled, true);
        }
      },
      {
        title: 'works with .whenClosed() shortcut',
        afterStarted: async (_, dialogService) => {
          const openPromise = dialogService.open<DialogRenderOptionsClassic>({
            template: () => 'Hello'
          });
          const whenClosedPromise = openPromise.whenClosed(result => result.value);
          const { dialog } = await openPromise;
          setTimeout(() => {
            void dialog.ok('Hello 123abc');
          }, 0);
          const value = await whenClosedPromise;
          assert.strictEqual(value, 'Hello 123abc');
        }
      },
      {
        title: 'it renders to a specific host',
        afterStarted: async ({ ctx, appHost }, dialogService) => {
          const dialogHost = appHost.appendChild(ctx.createElement('div'));
          await dialogService.open<DialogRenderOptionsClassic>({
            host: dialogHost,
            template: '<p>Hello world</p>'
          });
          assert.visibleTextEqual(dialogHost, 'Hello world');
        }
      },
      {
        title: 'registers only first deactivation value',
        afterStarted: async (_, dialogService) => {
          let resolve: (value?: unknown) => unknown;
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            component: () => ({
              deactivate: () => new Promise(r => { resolve = r; })
            })
          });

          const dialogValue = {};
          const p1 = dialog.ok(dialogValue);
          const p2 = dialog.ok();

          resolve();
          const [result1, result2] = await Promise.all([p1, p2]);
          assert.strictEqual(result1.value, result2.value);
          assert.strictEqual(result1.value, dialogValue);
        }
      },
      {
        title: 'assigns the dialog controller to "$dialog" property for view only dialog',
        afterStarted: async ({ ctx }, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world <button click.trigger="$dialog.ok(1)"></button>'
          });
          const spy = createSpy(dialog, 'ok', true);
          ctx.doc.querySelector('button').click();
          assert.strictEqual(spy.calls.length, 1);
        }
      },
      {
        title: 'assigns the dialog controller to "$dialog" property for component only dialog',
        afterStarted: async (_, dialogService) => {
          let isSet = false;
          let $dialog: IDialogController;
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            component: () => ({
              set $dialog(dialog: IDialogController) {
                isSet = true;
                $dialog = dialog;
              }
            })
          });
          assert.strictEqual(isSet, true);
          assert.strictEqual($dialog, dialog);
        }
      },
      {
        title: 'assigns the dialog controller to "$dialog" property for CustomElement',
        afterStarted: async (_, dialogService) => {
          let isSet = false;
          let $dialog: IDialogController;
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            component: () => CustomElement.define({
              name: 'hello-world',
              template: 'Hello 123'
            }, class {
              public set $dialog(dialog: IDialogController) {
                isSet = true;
                $dialog = dialog;
              }
            })
          });
          assert.strictEqual(isSet, true);
          assert.strictEqual($dialog, dialog);
        }
      },
      {
        title: 'sets correct zindex from global settings',
        afterStarted: async ({ container, appHost, assertStyles }, dialogService) => {
          (container.get(IDialogGlobalSettings).options as DialogRenderOptionsClassic).startingZIndex = 1;
          await dialogService.open<DialogRenderOptionsClassic>({
            template: 'hello',
            host: appHost
          });
          assertStyles('au-dialog-container', { zIndex: '1' });
        },
        browserOnly: true,
      },
      {
        title: 'lets zindex from open override global settings',
        afterStarted: async ({ container, appHost, assertStyles }, dialogService) => {
          (container.get(IDialogGlobalSettings).options as DialogRenderOptionsClassic).startingZIndex = 1;
          await dialogService.open<DialogRenderOptionsClassic>({
            template: 'hello',
            host: appHost,
            options: { startingZIndex: 2 }
          });
          assertStyles('au-dialog-container', { zIndex: '2' });
        },
        browserOnly: true,
      },
      {
        title: 'handles long animation',
        afterStarted: async (_, dialogService) => {
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            template: '<div style="width: 300px; height: 300px; background: red;">Hello world',
            component: () => class MyDialog {
              public attaching() {
                // pretend to be animating in
                return new Promise<void>(resolve => setTimeout(resolve, 100));
              }

              public detaching() {
                // pretend to be animating out
                return new Promise<void>(resolve => setTimeout(resolve, 100));
              }
            },
          });
          await dialog.ok();
        }
      },
      {
        title: 'uses custom renderer in open call settings',
        afterStarted: async ({ platform }, dialogService) => {
          const overlay = platform.document.createElement('haha');
          const contentHost = platform.document.createElement('hahaha');
          let disposed = 0;
          const host = platform.document.createElement('host-here');
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world',
            renderer: {
              render(host, _controller, _settings) {
                host.append(overlay, contentHost);
                return {
                  overlay,
                  root: contentHost,
                  contentHost,
                  dispose() {
                    disposed = 1;
                  }
                };
              }
            },
            host
          });
          assert.strictEqual(disposed, 0);
          assert.contains(host, overlay);
          assert.contains(host, contentHost);
          await dialog.ok();
          assert.strictEqual(disposed, 1);
        },
      },
      {
        title: 'calls show/hide on custom dialog dom',
        afterStarted: async ({ platform }, dialogService) => {
          const overlay = platform.document.createElement('div');
          const contentHost = platform.document.createElement('div');
          const host = platform.document.createElement('host-here');
          let i = 0;
          const { dialog } = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world',
            renderer: {
              render(_host, _controller, _settings) {
                return {
                  overlay,
                  root: contentHost,
                  contentHost,
                  show() { i = 1; },
                  hide() { i = 2; },
                  dispose() {/*  */}
                };
              }
            },
            host
          });
          assert.strictEqual(i, 1);
          await dialog.ok();
          assert.strictEqual(i, 2);
        },
      },

      // #region animation hook
      {
        title: 'allows custom animation hooks in open',
        afterStarted: async (_, dialogService) => {
          let i = 0;

          const result = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world',
            options: {
              show(_dom: IDialogDom) { i = 1; },
              hide(_dom: IDialogDom) { i = 2; },
            }
          });
          assert.strictEqual(i, 1);

          await result.dialog.ok();
          assert.strictEqual(i, 2);
        }
      },
      {
        title: 'uses hooks from open call instead of the global one',
        afterStarted: async ({ container }, dialogService) => {
          let i = 0;

          Object.assign(container.get(IDialogGlobalSettings), {
            show(_dom: IDialogDom) { throw new Error('??'); },
            hide(_dom: IDialogDom) { throw new Error('??'); },
          });

          const result = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world',
            options: {
                show(_dom: IDialogDom) { i = 3; },
                hide(_dom: IDialogDom) { i = 4; }
            },
          });
          assert.strictEqual(i, 3);

          await result.dialog.ok();
          assert.strictEqual(i, 4);
        }
      },
      {
        title: 'calls deactivate before hide option hook',
        afterStarted: async ({ container }, dialogService) => {
          const calls: string[] = [];

          Object.assign(container.get(IDialogGlobalSettings).options as DialogRenderOptionsClassic, {
            show(_dom: IDialogDom) { },
            hide(_dom: IDialogDom) { calls.push('hide'); },
          });

          const result = await dialogService.open<DialogRenderOptionsClassic>({
            template: 'Hello world',
            component: () => ({
              deactivate() { calls.push('deactivate'); }
            })
          });
          assert.deepEqual(calls, []);

          await result.dialog.ok();
          assert.deepEqual(calls, ['deactivate', 'hide']);
        }
      },

      // #region form
      {
        title: 'calls prevent default on form submit event',
        async afterStarted(appCreationResult, dialogService) {
          let submit: () => void;
          let e: SubmitEvent;
          await dialogService.open<DialogRenderOptionsClassic>({
            template: '<form submit.trigger="onSubmit($event)"><button>Submit</button></form>',
            component: () => class {
              dom = resolve(IDialogDom);
              activate() {
                submit = () => this.dom.contentHost.querySelector('button').click();
              }
              onSubmit(event: Event) {
                e = event as SubmitEvent;
              }
            }
          });

          submit();
          assert.strictEqual(e?.defaultPrevented, true);
        },
      }
    ];

    // #region test run
    for (const { title, only, afterStarted, afterTornDown, browserOnly } of testCases) {
      if (browserOnly && isNode()) continue;
      const $it = only ? it.only : it;
      $it(title, async function () {
        const creationResult = createFixture('', class App { }, [delegateSyntax, DialogConfigurationClassic]);
        const { ctx, tearDown, startPromise } = creationResult;
        await startPromise;
        const dialogService = ctx.container.get(IDialogService);
        try {
          await afterStarted(creationResult, dialogService);
        } catch (ex) {
          try {
            await dialogService.closeAll();
          } catch (e2) {/* best effort */ }
          try {
            await tearDown();
          } catch (e2) {/* best effort */ }
          ctx.doc.querySelectorAll('au-dialog-container').forEach(e => e.remove());
          throw ex;
        }

        await tearDown();
        await afterTornDown?.(creationResult, dialogService);
        const dialogContainerEls = ctx.doc.querySelectorAll('au-dialog-container');
        dialogContainerEls.forEach(e => e.remove());
        if (dialogContainerEls.length > 0) {
          throw new Error('Invalid test, left over <au-dialog-container/> in the document');
        }
      });
    }
  });

  interface IDialogServiceTestCase {
    title: string;
    afterStarted: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
    afterTornDown?: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
    only?: boolean;
    browserOnly?: boolean;
  }
});
