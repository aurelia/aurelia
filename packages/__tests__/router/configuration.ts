import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { IRouter } from '@aurelia/router';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';

export const TestRouterConfiguration = {
  for(ctx: TestContext, logLevel: LogLevel = LogLevel.debug): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(LoggerConfiguration.create({ $console: console, level: logLevel }));

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
          AppTask.with(IRouter).hydrating().call(router => {
            // mockBrowserHistoryLocation.changeCallback = router['handlePopstate'];
            mockBrowserHistoryLocation.changeCallback = router.viewer.handlePopstate;
          }),
        );
      },
    };
  },
};

function getModifiedRouter(container) {
  const router = container.get(IRouter) as IRouter;
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.viewer.handlePopstate;
  router.viewer.history = mockBrowserHistoryLocation as any;
  router.viewer.location = mockBrowserHistoryLocation as any;
  return router;
}
