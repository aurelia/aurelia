import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel, ColorOptions, ConsoleSink } from '@aurelia/kernel';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
import { IRouter } from '@aurelia/router-lite';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';

export const TestRouterConfiguration = {
  for(logLevel: LogLevel = LogLevel.debug): IRegistry {
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
          AppTask.hydrating(IRouter, router => {
            mockBrowserHistoryLocation.changeCallback = router['handlePopstate'];
          }),
        );
      },
    };
  },
};
