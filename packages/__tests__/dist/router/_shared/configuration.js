import { ConsoleSink, IContainer, LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { IRouterOptions } from '@aurelia/router';
import { AppTask, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation } from '@aurelia/testing';
export const TestRouterConfiguration = {
    for(logLevel = LogLevel.warn, sinks = [ConsoleSink]) {
        return {
            register(container) {
                container.register(LoggerConfiguration.create({
                    level: logLevel,
                    colorOptions: 'no-colors',
                    sinks,
                }));
                const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
                container.register(Registration.instance(IHistory, mockBrowserHistoryLocation), Registration.instance(ILocation, mockBrowserHistoryLocation));
            },
        };
    },
};
export function getLocationChangeHandlerRegistration() {
    return AppTask.hydrated(IContainer, container => {
        const useHash = container.get(IRouterOptions).useUrlFragmentHash;
        const window = container.get(IWindow);
        const mockBrowserHistoryLocation = container.get(IHistory);
        mockBrowserHistoryLocation.changeCallback = () => {
            window.dispatchEvent(useHash ? new HashChangeEvent('hashchange') : new PopStateEvent('popstate'));
            return Promise.resolve();
        };
    });
}
//# sourceMappingURL=configuration.js.map