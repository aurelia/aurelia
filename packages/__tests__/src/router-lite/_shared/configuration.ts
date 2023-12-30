import { Class, ConsoleSink, IContainer, IRegistry, ISink, LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { IRouterOptions } from '@aurelia/router-lite';
import { AppTask, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation } from '@aurelia/testing';

export const TestRouterConfiguration = {
  for(logLevel: LogLevel = LogLevel.warn, sinks: Class<ISink>[] = [ConsoleSink]): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(
          LoggerConfiguration.create({
            level: logLevel,
            colorOptions: 'no-colors',
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
