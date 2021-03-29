import {
  IDialogService,
  IDialogSettings,
  IGlobalDialogSettings,
  DefaultDialogConfiguration,
  customElement,
  IDialogCancelError,
  DialogDeactivationStatuses,
  IDialogCloseResult,
  IDialogAnimator,
  IDialogDom,
} from '@aurelia/runtime-html';
import {
  createFixture,
  assert,
} from '@aurelia/testing';

describe('3-runtime-html/dialog/dialog-service.spec.ts', function () {
  describe('.open()', function () {
    const testCases: IDialogServiceTestCase[] = [
      {
        title: 'throws on invalid configuration',
        afterStarted: async (_, dialogService) => {
          let error: IDialogCancelError<unknown>;
          await dialogService.open({}).catch(err => error = err);
          assert.strictEqual(error.message, 'Invalid Dialog Settings. You must provide "component", "template" or both.');
        }
      },
      {
        title: 'hasOpenDialog with 1 dialog',
        afterStarted: async ({}, dialogService) => {
          assert.strictEqual(dialogService.hasOpenDialog, false);
          const { controller } = await dialogService.open({ template: '' });
          assert.strictEqual(dialogService.hasOpenDialog, true);
          void controller.ok();
          await controller.closed;
          assert.strictEqual(dialogService.hasOpenDialog, false);
        }
      },
      {
        title: 'hasOpenDialog with more than 1 dialog',
        afterStarted: async (_, dialogService) => {
          assert.strictEqual(dialogService.hasOpenDialog, false);
          const { controller: controller1 } = await dialogService.open({ template: '' });
          assert.strictEqual(dialogService.hasOpenDialog, true);
          const { controller: controller2 } = await dialogService.open({ template: '' });
          assert.strictEqual(dialogService.hasOpenDialog, true);
          void controller1.ok();
          await controller1.closed;
          assert.strictEqual(dialogService.hasOpenDialog, true);
          void controller2.ok();
          await controller2.closed;
          assert.strictEqual(dialogService.hasOpenDialog, false);
        }
      },
      {
        title: 'should create new settings by merging the default settings and the provided ones',
        afterStarted: async ({ ctx }, dialogService) => {
          const overrideSettings: IDialogSettings = {
            rejectOnCancel: true,
            lock: true,
            keyboard: 'Escape',
            overlayDismiss: true,
          };
          const { controller } = await dialogService.open({
            ...overrideSettings,
            component: () => Object.create(null),
          });
          const expectedSettings = { ...ctx.container.get(IGlobalDialogSettings), ...overrideSettings };
          const actualSettings = { ...controller.settings };
          delete actualSettings.component;
          assert.deepStrictEqual(actualSettings, expectedSettings);
        }
      },
      {
        title: 'should not modify the default settings',
        afterStarted: async ({ ctx }, dialogService) => {
          const overrideSettings = { component: () => ({}), model: 'model data' };
          const expectedSettings = { ...ctx.container.get(IGlobalDialogSettings) };
          await dialogService.open(overrideSettings);
          const actualSettings = { ...ctx.container.get(IGlobalDialogSettings) };
          assert.deepStrictEqual(actualSettings, expectedSettings);
        }
      },
      {
        title: 'invokes & resolves with [canActivate: true]',
        afterStarted: async function ({ ctx }, dialogService) {
          let canActivateCallCount = 0;
          @customElement({
            name: 'test',
            template: 'hello dialog',
          })
          class TestElement {
            public canActivate() {
              canActivateCallCount++;
              return true;
            }
          }

          const result = await dialogService.open({
            component: () => TestElement
          });
          assert.strictEqual(result.wasCancelled, false);
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), 'hello dialog');
        },
        afterTornDown: ({ ctx }) => {
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      },
      {
        title: 'resolves to "IOpenDialogResult" with [canActivate: false + rejectOnCancel: false]',
        afterStarted: async ({ ctx }, dialogService) => {
          let canActivateCallCount = 0;
          const result = await dialogService.open({
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
          let error: IDialogCancelError<unknown>;
          await dialogService.open({
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
          assert.strictEqual(error.message, 'Dialog activation rejected');
          assert.strictEqual(canActivateCallCount, 1);
          assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
        }
      },
      {
        title: 'propagates errors from canActivate',
        afterStarted: async (_, dialogService) => {
          const expectedError = new Error('Expected error.');
          let canActivateCallCount = 0;
          let error: IDialogCancelError<unknown>;
          await dialogService.open({
            template: 'hello world',
            component: () => class TestElement {
              public canActivate() {
                canActivateCallCount++;
                throw expectedError;
              }
            }
          }).catch(err => error = err);
          assert.strictEqual(error, expectedError);
          assert.strictEqual(canActivateCallCount, 1);
        }
      },
      {
        title: 'resolves: "IDialogCloseResult" when: .ok()',
        afterStarted: async (_, dialogService) => {
          const { controller } = await dialogService.open({ template: '' });
          const expectedValue = 'expected ok output';
          await controller.ok(expectedValue);
          const result = await controller.closed;
          assert.strictEqual(result.status, DialogDeactivationStatuses.Ok);
          assert.strictEqual(result.value, expectedValue);
        }
      },
      {
        title: 'resolves: "IDialogCloseResult" when: .cancel() + rejectOnCancel: false',
        afterStarted: async (_, dialogService) => {
          const { controller } = await dialogService.open({ template: '' });
          const expectedOutput = 'expected cancel output';
          let error: IDialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void controller.cancel(expectedOutput);
          const result = await controller.closed.catch(err => {
            errorCaughtCount++;
            error = err;
            return { status: DialogDeactivationStatuses.Error };
          });
          assert.strictEqual(error, undefined);
          assert.strictEqual(errorCaughtCount, 0);
          assert.strictEqual(result.status, DialogDeactivationStatuses.Cancel);
        }
      },
      {
        title: 'rejects: "IDialogCancelError" when: .cancel() + rejectOnCancel: true',
        afterStarted: async (_, dialogService) => {
          const { controller } = await dialogService.open({ template: '', rejectOnCancel: true });
          const expectedValue = 'expected cancel error output';
          let error: IDialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void controller.cancel(expectedValue);
          await controller.closed.catch(err => {
            errorCaughtCount++;
            error = err;
            return {} as IDialogCloseResult;
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
          const { controller } = await dialogService.open({ template: '' });
          const expectedError = new Error('expected test error');
          let error: IDialogCancelError<unknown>;
          let errorCaughtCount = 0;
          void controller.error(expectedError);
          await controller.closed.catch(err => {
            errorCaughtCount++;
            error = err;
          });
          assert.deepStrictEqual(error, Object.assign(new Error(), {
            wasCancelled: false,
            value: expectedError
          }));
        }
      },
      {
        title: '.closeAll() with 1 dialog',
        afterStarted: async (_, dialogService) => {
          await dialogService.open({ template: '' });
          assert.strictEqual(dialogService.hasOpenDialog, true);
          assert.strictEqual(dialogService.count, 1);
          const unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.hasOpenDialog, false);
          assert.strictEqual(dialogService.count, 0);
          assert.deepStrictEqual(unclosedController, []);
        }
      },
      {
        title: '.closeAll() with more than 1 dialog',
        afterStarted: async (_, dialogService) => {
          await Promise.all([
            dialogService.open({ template: '' }),
            dialogService.open({ template: '' }),
            dialogService.open({ template: '' }),
          ]);
          assert.strictEqual(dialogService.hasOpenDialog, true);
          assert.strictEqual(dialogService.count, 3);
          const unclosedController = await dialogService.closeAll();
          assert.strictEqual(dialogService.hasOpenDialog, false);
          assert.strictEqual(dialogService.count, 0);
          assert.deepStrictEqual(unclosedController, []);
        }
      },
      {
        title: 'invokes animator',
        afterStarted: async ({ ctx }, dialogService) => {
          let attachingCallCount = 0;
          let detachingCallCount = 0;
          const dialogAnimator = ctx.container.get(IDialogAnimator);
          dialogAnimator.attaching = (fn => function (dom: IDialogDom, animation: unknown) {
            attachingCallCount++;
            return fn.call(this, dom, animation);
          })(dialogAnimator.attaching);
          dialogAnimator.detaching = (fn => function (dom: IDialogDom, animation: unknown) {
            detachingCallCount++;
            return fn.call(this, dom, animation);
          })(dialogAnimator.detaching);

          const { controller } = await dialogService.open({ template: '' });
          assert.strictEqual(attachingCallCount, 1);

          void controller.ok();
          await controller.closed;
          assert.strictEqual(detachingCallCount, 1);
        }
      }
    ];

    for (const { title, only, afterStarted, afterTornDown } of testCases) {
      const $it = only ? it.only : it;
      $it(title, async function () {
        const creationResult = createFixture('', class App { }, [DefaultDialogConfiguration]);
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
          throw ex;
        }

        await tearDown();
        await afterTornDown?.(creationResult, dialogService);
      });
    }
  });

  interface IDialogServiceTestCase {
    title: string;
    afterStarted: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
    afterTornDown?: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
    only?: boolean;
  }
});
