import { ConsoleSink, IContainer, IRegistry, LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

export const TestRouterConfiguration = {
  for(ctx: TestContext, logLevel: LogLevel = LogLevel.debug): IRegistry {
    return {
      register(container: IContainer): void {
        container.register(
          LoggerConfiguration.create({
            level: logLevel,
            colorOptions: 'no-colors',
            sinks: [ConsoleSink],
          }),
        );

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
