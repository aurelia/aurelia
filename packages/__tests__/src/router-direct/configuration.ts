import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { IRouter } from '@aurelia/router-direct';
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
          AppTask.hydrating(IRouter, router => {
            mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
          }),
        );
      },
    };
  },
};
