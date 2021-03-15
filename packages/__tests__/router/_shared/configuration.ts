import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel, ColorOptions, ConsoleSink } from '@aurelia/kernel';
import { MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { IRouter } from '@aurelia/router';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';

export const TestRouterConfiguration = {
  for(ctx: TestContext, logLevel: LogLevel = LogLevel.debug): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(
          LoggerConfiguration.create({
            level: logLevel,
            colorOptions: ColorOptions.noColors,
            sinks: [ConsoleSink],
          }),
        );

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
          AppTask.with(IRouter).hydrating().call(router => {
            mockBrowserHistoryLocation.changeCallback = router['handlePopstate'];
          }),
        );
      },
    };
  },
};
