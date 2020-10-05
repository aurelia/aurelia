import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel, ColorOptions, PLATFORM } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, HTMLTestContext } from '@aurelia/testing';
import { IRouter } from '@aurelia/router';
import { IHistory, ILocation } from '@aurelia/runtime-html';
import { StartTask } from '@aurelia/runtime';

export const TestRouterConfiguration = {
  for(ctx: HTMLTestContext, logLevel: LogLevel = LogLevel.debug): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(
          LoggerConfiguration.create({
            $console: console,
            level: logLevel,
            colorOptions: PLATFORM.isNodeLike ? ColorOptions.colors : ColorOptions.noColors,
          }),
        );

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
          StartTask.with(IRouter).beforeCompile().call(router => {
            mockBrowserHistoryLocation.changeCallback = router['handlePopstate'];
          }),
        );
      },
    };
  },
};
