import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, HTMLTestContext } from '@aurelia/testing';
import { IRouter } from '@aurelia/router';
import { IHistory, ILocation } from '@aurelia/runtime-html';
import { AppTask } from '@aurelia/runtime';

export const TestRouterConfiguration = {
  for(ctx: HTMLTestContext, logLevel: LogLevel = LogLevel.debug): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(LoggerConfiguration.create({ $console: console, level: logLevel }));

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
          AppTask.with(IRouter).beforeCompose().call(router => {
            // mockBrowserHistoryLocation.changeCallback = router['handlePopstate'];
            mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
          }),
        );
      },
    };
  },
};

function getModifiedRouter(container) {
  const router = container.get(IRouter) as IRouter;
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
  router.navigation.history = mockBrowserHistoryLocation as any;
  router.navigation.location = mockBrowserHistoryLocation as any;
  return router;
}
