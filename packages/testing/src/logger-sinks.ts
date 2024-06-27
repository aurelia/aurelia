import { IContainer, ILogEvent, ISink, LogLevel, Registration } from '@aurelia/kernel';

export const createSink = Object.assign((callback: (message: any) => any, level?: LogLevel) => {
  return class TargetedConsoleSink implements ISink {
    public static register(container: IContainer) {
      container.register(Registration.singleton(ISink, this));
    }

    public handleEvent(event: ILogEvent): void {
      if (level == null || event.severity === level) {
        callback(event.message);
      }
    }
  };
}, {
  error: (callback: (message: any) => any) => createSink(callback, LogLevel.error),
  warn: (callback: (message: any) => any) => createSink(callback, LogLevel.warn),
  info: (callback: (message: any) => any) => createSink(callback, LogLevel.info),
  debug: (callback: (message: any) => any) => createSink(callback, LogLevel.debug),
  trace: (callback: (message: any) => any) => createSink(callback, LogLevel.trace),
});
