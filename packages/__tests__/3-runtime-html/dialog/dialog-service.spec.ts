import {
  IDialogService,
  IDialogSettings,
  IGlobalDialogSettings,
  DefaultDialogConfiguration,
  customElement,
  IDialogCancelError,
} from '@aurelia/runtime-html';
import {
  createFixture,
  assert
} from '@aurelia/testing';

describe('3-runtime-html/dialog/dialog-service.spec.ts', function () {
  describe('.open()', () => {

    const testCases: IDialogServiceTestCase[] = [
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
            canActivate() {
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
        afterStarted: async ({}, dialogService) => {
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
        }
      }
    ];

    for (const { title, afterStarted, afterTornDown } of testCases) {
      it(title, async function () {
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
    title: string,
    afterStarted: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
    afterTornDown?: (appCreationResult: ReturnType<typeof createFixture>, dialogService: IDialogService) => void | Promise<void>;
  }
});
