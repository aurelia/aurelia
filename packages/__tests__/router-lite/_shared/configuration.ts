import { IContainer, Registration, IRegistry, LoggerConfiguration, LogLevel, ColorOptions, ConsoleSink, ISink, Class } from '@aurelia/kernel';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
import { AppTask, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { IRouterOptions } from '@aurelia/router-lite';

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

export function getLocationChangeHandlerRegistration(): IRegistry {
  return AppTask.hydrated(IContainer, container => {
    const useHash = container.get(IRouterOptions).useUrlFragmentHash;
    const window = container.get(IWindow);
    const mockBrowserHistoryLocation = container.get<MockBrowserHistoryLocation>(IHistory);
    mockBrowserHistoryLocation.changeCallback = () => {
      window.dispatchEvent(useHash ? new HashChangeEvent('hashchange') : new PopStateEvent('popstate'));
      return Promise.resolve();
    };
  });
}
