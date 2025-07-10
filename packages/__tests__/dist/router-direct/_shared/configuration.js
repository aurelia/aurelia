import { ConsoleSink, LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router-direct';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
export const TestRouterConfiguration = {
    for(ctx, logLevel = LogLevel.debug) {
        return {
            register(container) {
                container.register(LoggerConfiguration.create({
                    level: logLevel,
                    colorOptions: 'no-colors',
                    sinks: [ConsoleSink],
                }));
                const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
                container.register(Registration.instance(IHistory, mockBrowserHistoryLocation), Registration.instance(ILocation, mockBrowserHistoryLocation), AppTask.hydrating(IRouter, router => {
                    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
                }));
            },
        };
    },
};
//# sourceMappingURL=configuration.js.map