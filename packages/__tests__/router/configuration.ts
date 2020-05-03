import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, HTMLTestContext } from '@aurelia/testing';
import { IHistory, ILocation, IHTMLRouter } from '@aurelia/router-html';
import { StartTask } from '@aurelia/runtime';

export const TestRouterConfiguration = {
  for(ctx: HTMLTestContext): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(LoggerConfiguration.create(ctx.wnd.console, LogLevel.debug));

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
          StartTask.with(IHTMLRouter).beforeRender().call(router => {
            mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
          }),
        );
      },
    };
  },
};
