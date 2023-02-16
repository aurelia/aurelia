import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel, ColorOptions, ConsoleSink, ISink, Class } from '@aurelia/kernel';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
import { ILocationManager } from '@aurelia/router-lite';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';

export const TestRouterConfiguration = {
  for(logLevel: LogLevel = LogLevel.warn, sinks: Class<ISink>[] = [ConsoleSink]): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(
          LoggerConfiguration.create({
            level: logLevel,
            colorOptions: ColorOptions.noColors,
            sinks,
          }),
        );

        const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
        container.register(
          Registration.instance(IHistory, mockBrowserHistoryLocation),
          Registration.instance(ILocation, mockBrowserHistoryLocation),
        );
      },
    };
  },
};
