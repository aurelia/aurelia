import { Registration, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
import { IRouter } from '@aurelia/router-direct';
import { AppTask, IHistory, ILocation } from '@aurelia/runtime-html';
export const TestRouterConfiguration = {
    for(ctx, logLevel = LogLevel.debug) {
        return {
            register(container) {
                container.register(LoggerConfiguration.create({ $console: console, level: logLevel }));
                const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
                container.register(Registration.instance(IHistory, mockBrowserHistoryLocation), Registration.instance(ILocation, mockBrowserHistoryLocation), AppTask.hydrating(IRouter, router => {
                    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
                }));
            },
        };
    },
};
//# sourceMappingURL=configuration.js.map