import {
  IDialogService,
  IDialogSettings,
  IGlobalDialogSettings,
  DefaultDialogConfiguration,
  customElement,
} from '@aurelia/runtime-html';
import {
  createFixture,
  assert
} from '@aurelia/testing';

describe('3-runtime-html/dialog/dialog-service.spec.ts', function () {
  describe('".open"', () => {
    it('should create new settings by merging the default settings and the provided ones', async function () {
      const { ctx, tearDown, startPromise } = createFixture('', class App {}, [DefaultDialogConfiguration]);
      const overrideSettings: IDialogSettings = {
        rejectOnCancel: true,
        lock: true,
        keyboard: 'Escape',
        overlayDismiss: true,
      };
      await startPromise;
      const dialogService = ctx.container.get(IDialogService);
      const { controller } = await dialogService.open({
        ...overrideSettings,
        component: () => Object.create(null),
      });
      const expectedSettings = { ...ctx.container.get(IGlobalDialogSettings), overrideSettings };
      const actualSettings = { ...controller.settings };
      delete actualSettings.component;
      assert.deepStrictEqual(actualSettings, expectedSettings);

      await tearDown();
    });

    it('should not modify the default settings', async function () {
      const { ctx, tearDown, startPromise } = createFixture('', class App {}, [DefaultDialogConfiguration]);
      await startPromise;
      const dialogService = ctx.container.get(IDialogService);
      const overrideSettings = { component: () => ({}), model: 'model data' };
      const expectedSettings = { ...ctx.container.get(IGlobalDialogSettings) };
      await dialogService.open(overrideSettings);
      const actualSettings = { ...ctx.container.get(IGlobalDialogSettings) };
      assert.deepStrictEqual(actualSettings, expectedSettings);
      await tearDown();
    });

    it('invokes & resolves with ".canActivate" resolves to "true"', async function () {
      const { ctx, tearDown, startPromise } = createFixture('', class App {}, [DefaultDialogConfiguration]);
      await startPromise;
      const dialogService = ctx.container.get(IDialogService);

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

      await tearDown();

      assert.html.textContent(ctx.doc.querySelector('au-dialog-container'), null);
    });

    // // tslint:disable-next-line:max-line-length
    // it('resolves to "DialogCancelResult" when ".canActivate" resolves to "false" and ".rejectOnCancel" is "false"', async done => {
    //   spyOn(TestElement.prototype, 'canActivate').and.returnValue(false);
    //   const result = await _success(() => dialogService.open({ rejectOnCancel: false }), done);
    //   expect(result.wasCancelled).toBe(true);
    //   expect((result as DialogOpenResult).controller).not.toBeDefined();
    //   done();
    // });

    // // tslint:disable-next-line:max-line-length
    // it('gets rejected with "DialogCancelError" when ".canActivate" resolves to "false" and ".rejectOnCancel" is "true"', async done => {
    //   spyOn(TestElement.prototype, 'canActivate').and.returnValue(false);
    //   const result = await _failure(() => dialogService.open({ rejectOnCancel: true }), done) as DialogCancelError;
    //   expect(result.message).toBeDefined();
    //   expect(result.stack).toBeDefined();
    //   expect(result.wasCancelled).toBe(true);
    //   done();
    // });

    // it('should create new child Container if "childContainer" is missing', async done => {
    //   spyOn(container, 'createChild').and.callThrough();
    //   await _success(() => dialogService.open(), done);
    //   expect(container.createChild).toHaveBeenCalled();
    //   done();
    // });

    // it('should not create new child Container if "childContainer" is provided', async done => {
    //   const settings = { childContainer: container.createChild() };
    //   spyOn(container, 'createChild').and.callThrough();
    //   spyOn(settings.childContainer, 'invoke').and.callThrough();
    //   await _success(() => dialogService.open(settings), done);
    //   expect(container.createChild).not.toHaveBeenCalled();
    //   expect(settings.childContainer.invoke).toHaveBeenCalled();
    //   done();
    // });

    // it('should get rejected when the "moduleId" of the provided view model can not be resolved ', async done => {
    //   const settings = { viewModel: class {} };
    //   await _failure(() => dialogService.open(settings), done);
    //   done();
    // });

    // it('propagates errors', async done => {
    //   const expectdError = new Error('Expected error.');
    //   spyOn(TestElement.prototype, 'canActivate').and.callFake(() => { throw expectdError; });
    //   const result = await _failure(() => dialogService.open(), done) as DialogCancelError;
    //   expect(result as any).toBe(expectdError);
    //   done();
    // });
  });
});
